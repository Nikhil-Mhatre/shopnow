import { describe, test, expectTypeOf } from "vitest";
import {
  IProduct,
  IAssociation,
  ICreateProductPayload,
  IProductResponse,
} from "../src/catalog-service/index.js"; // Adjust path if importing directly from "../src/catalog.js"

describe("Catalog Service Type Contracts", () => {
  test("IProduct should enforce strict core entity properties", () => {
    expectTypeOf<IProduct>().toHaveProperty("id").toBeString();
    expectTypeOf<IProduct>().toHaveProperty("sku").toBeString();
    expectTypeOf<IProduct>().toHaveProperty("slug").toBeString();
    expectTypeOf<IProduct>().toHaveProperty("price").toBeNumber();

    // Validate embedded layout sub-structures
    expectTypeOf<IProduct>().toHaveProperty("categories").toBeArray();
    expectTypeOf<IProduct>().toHaveProperty("images").toBeArray();
    expectTypeOf<IProduct>().toHaveProperty("attributes").toBeArray();

    // Verify boolean operational states
    expectTypeOf<IProduct>().toHaveProperty("isOutOfStock").toBeBoolean();
    expectTypeOf<IProduct>().toHaveProperty("isActive").toBeBoolean();
  });

  test("IAssociation should mirror cross-sell recommendation requirements", () => {
    expectTypeOf<IAssociation>().toHaveProperty("id").toBeString();
    expectTypeOf<IAssociation>().toHaveProperty("productId").toBeString();
    expectTypeOf<IAssociation>()
      .toHaveProperty("associatedProductId")
      .toBeString();
    expectTypeOf<IAssociation>().toHaveProperty("purchaseCount").toBeNumber();
  });

  test("Administrative request payloads must maintain ingestion schemas", () => {
    expectTypeOf<ICreateProductPayload>().toHaveProperty("sku").toBeString();
    expectTypeOf<ICreateProductPayload>().toHaveProperty("name").toBeString();
    expectTypeOf<ICreateProductPayload>().toHaveProperty("price").toBeNumber();
    expectTypeOf<ICreateProductPayload>()
      .toHaveProperty("attributes")
      .toBeArray();
  });

  test("Runtime compilation sanity test", () => {
    const sampleProductResponse: IProductResponse = {
      success: true,
      data: {
        id: "prod_12345",
        sku: "AUDIO-HDST-ELITE26",
        name: "Elite Wireless Audio Headset v26",
        slug: "elite-wireless-audio-headset-v26",
        description: "High fidelity space audio",
        price: 189.99,
        categories: ["audio", "electronics"],
        images: ["https://cdn.store.com/image.webp"],
        attributes: [{ name: "color", value: "Matte Black" }],
        isFeatured: true,
        isOutOfStock: false,
        isActive: true,
        createdAt: "2026-06-09T21:03:17.000Z",
        updatedAt: "2026-06-09T21:03:17.000Z",
      },
    };

    expectTypeOf(sampleProductResponse).toMatchTypeOf<IProductResponse>();
  });
});
