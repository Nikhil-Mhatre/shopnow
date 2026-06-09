import { Request, Response, NextFunction } from "express";
import { ProductModel } from "../models/Product.js";
import { logger } from "../utils/logger.js";

// 1. HIGH-PERFORMANCE HOME PAGE RESOLVER (Concurrent Pipeline)
export const getHomepageLayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [featured, newArrivals] = await Promise.all([
      ProductModel.find({
        isFeatured: true,
        isActive: true,
        isOutOfStock: false,
      })
        .limit(8)
        .lean(),
      ProductModel.find({ isActive: true, isOutOfStock: false })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

    res.status(200).json({ featured, newArrivals });
  } catch (error) {
    next(error);
  }
};

// 2. FACETED SEARCH AND FULL-TEXT ENGINE EXECUTION
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;
    const filterConditions: any = { isActive: true };

    // Apply full-text search index parameter bounds if string pattern is supplied
    if (q) {
      filterConditions.$text = { $search: q as string };
    }
    if (category) {
      filterConditions.categories = category as string;
    }
    if (minPrice || maxPrice) {
      filterConditions.price = {};
      if (minPrice) filterConditions.price.$gte = Number(minPrice);
      if (maxPrice) filterConditions.price.$lte = Number(maxPrice);
    }

    // Execute query via unhydrated engine pointers (.lean()) for quick response delivery
    const queryBuilder = ProductModel.find(filterConditions);

    if (q) {
      queryBuilder
        .select({ score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } });
    } else {
      queryBuilder.sort({ createdAt: -1 });
    }

    const results = await queryBuilder.lean();
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

// 3. TIER 1 SIMILAR RECOMMENDATIONS GENERATION
export const getSimilarProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { productId } = req.params;
    const currentProduct = await ProductModel.findById(productId).lean();
    if (!currentProduct) {
      res.status(404).json({ error: "Target product entity missing" });
      return;
    }

    const attributeValues = currentProduct.attributes.map((attr) => attr.value);

    const recommendations = await ProductModel.aggregate([
      {
        $match: {
          _id: { $ne: currentProduct._id },
          categories: { $in: currentProduct.categories },
          isActive: true,
          isOutOfStock: false,
        },
      },
      {
        $addFields: {
          matchIntersection: {
            $size: { $setIntersection: ["$attributes.value", attributeValues] },
          },
        },
      },
      { $sort: { matchIntersection: -1, createdAt: -1 } },
      { $limit: 4 },
    ]);

    res.status(200).json(recommendations);
  } catch (error) {
    next(error);
  }
};

// 4. INGEST ADMINISTRATIVE ENTRIES
export const createProduct = async (req: Request, res: Response) => {
  try {
    const newProduct = await ProductModel.create(req.body);

    return res.status(201).json({
      success: true,
      data: newProduct,
    });
  } catch (error: any) {
    // Check for MongoDB Duplicate Key Error (Code 11000)
    if (
      error.code === 11000 ||
      (error.message && error.message.includes("E11000"))
    ) {
      // FOOLPROOF EXTRACTION: Pull the SKU directly from the user's request payload!
      const duplicatedSku = req.body?.sku || error.keyValue?.sku || "unknown";

      return res.status(409).json({
        error: `Conflict: A product with the SKU '${duplicatedSku}' already exists.`,
      });
    }

    // Generic server error fallback
    console.error("Error creating product:", error);
    return res.status(500).json({ error: "Failed to create product." });
  }
};
