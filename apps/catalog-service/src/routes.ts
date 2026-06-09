import { Router } from "express";
import { z } from "zod";
import { getDocsRouter } from "./docs/openapi.js";
import { validate } from "./middleware/validate.js";
import {
  createProduct,
  getHomepageLayout,
  getSimilarProducts,
  searchProducts,
} from "./controllers/product.controller.js";
import { requireAdmin } from "./middleware/requireAdmin.js";
import { getProductImageUploadUrl } from "./controllers/media.controller.js";

const router: Router = Router();

// Zod Schemas
const SearchQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
});

const UploadRequestSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

// Localized Interactive API Portal Explorer Documentation Mount
router.use("/docs", getDocsRouter());

// Public Consumer Catalog Routes
router.get("/catalog/homepage", getHomepageLayout);
router.get("/catalog/search", validate(SearchQuerySchema), searchProducts);
router.get("/catalog/products/:productId/similar", getSimilarProducts);

// Secured Administrative Media & Mutation Routes
router.post(
  "/catalog/admin/media-upload",
  requireAdmin,
  validate(UploadRequestSchema),
  getProductImageUploadUrl,
);
router.post("/catalog/admin/products", requireAdmin, createProduct);

export default router;
