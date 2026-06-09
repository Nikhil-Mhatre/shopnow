// =========================================================================
// SECTION 1: CORE DOMAIN ENTITIES (NETWORK & SERIALIZATION PERSPECTIVE)
// =========================================================================

/**
 * Key-value sub-document variant interface for faceted layout rendering
 */
export interface IProductAttribute {
  name: string;
  value: string;
}

/**
 * Pure data contract representation of a Catalog Product entity.
 * Decoupled from Mongoose Document types to support cross-service consumption.
 */
export interface IProduct {
  id: string; // Decoupled and normalized from Mongoose '_id' string
  name: string;
  slug: string; // Unique URL-safe identifier string
  description: string;
  price: number; // Item base unit value
  sku: string; // Unique global stock keeping unit token
  categories: string[]; // Associated classification category boundaries
  images: string[]; // Persisted image asset location URLs
  attributes: IProductAttribute[]; // Dynamic infinitely elastic facets
  isFeatured: boolean;
  isOutOfStock: boolean; // Managed asynchronously via background AMQP listeners
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Pure data contract representation of a Market Basket Analysis Association map.
 * Used for building hyper-relevant recommendation lookups.
 */
export interface IAssociation {
  id: string;
  productId: string;
  associatedProductId: string;
  purchaseCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// =========================================================================
// SECTION 2: REQUEST PAYLOADS (FRONTEND & ADMIN CONSUMERS)
// =========================================================================

/**
 * Structural payload sent by administrative views to create an individual product
 * Target: POST /api/catalog/admin/products
 */
export interface ICreateProductPayload {
  name: string;
  slug: string;
  description: string;
  price: number;
  sku: string;
  categories?: string[];
  images?: string[];
  attributes: IProductAttribute[];
  isFeatured?: boolean;
  isActive?: boolean;
}

/**
 * Metadata configuration block used to lease zero-server cloud streaming configurations
 * Target: POST /api/catalog/admin/media-upload
 */
export interface IMediaUploadPayload {
  contentType: string; // e.g. 'image/webp', 'image/png'
}

/**
 * Standard query lookup parameter options for front-end faceted searches
 * Target: GET /api/catalog/products
 */
export interface IProductQueryFilters {
  search?: string;
  category?: string;
  limit?: string | number;
  page?: string | number;
}

// =========================================================================
// SECTION 3: UNIFIED MICROSERVICE RESPONSES (HTTP API CONTRACTS)
// =========================================================================

/**
 * Standard HTTP response body for individual product lookup or mutation
 */
export interface IProductResponse {
  success: boolean;
  data: IProduct;
}

/**
 * Standard HTTP response body for listing pages and faceted results
 */
export interface IProductListResponse {
  success: boolean;
  data: IProduct[];
}

/**
 * Return configuration payload block to configure direct client-to-cloud streams
 */
export interface IMediaUploadResponse {
  uploadUrl: string; // Temporary write-only Azure Blob SAS token lease URL
  publicAssetUrl: string; // Permanent static read URL to save to product document schemas
}
