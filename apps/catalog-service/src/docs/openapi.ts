import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

// 1. Initialize the Zod prototype extension methods safely
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// 2. Define the Global Security Schema for local testing pathways (RS256 Zero-Trust Bearer)
registry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Provide your administrative RS256 token to execute write-operations.',
});

// ==========================================
// 3. DEFINE REUSABLE SCHEMA COMPONENT DOCUMENTS
// ==========================================

const ProductAttributeSchemaDoc = z.object({
  name: z.string().openapi({ example: 'color', description: 'The metadata identifier key for faceted filtering.' }),
  value: z.string().openapi({ example: 'Matte Black', description: 'The corresponding value assigned to the attribute.' }),
});

const CreateProductSchemaDoc = registry.register('CreateProductRequest', z.object({
  sku: z.string().openapi({ example: 'AUDIO-HDST-ELITE26', description: 'Unique Stock Keeping Unit (Global Identifier).' }),
  name: z.string().openapi({ example: 'Elite Wireless Audio Headset v26', description: 'Display name of the product entity.' }),
  slug: z.string().openapi({ example: 'elite-wireless-audio-headset-v26', description: 'URL-safe slugified unique string.' }),
  price: z.number().positive().openapi({ example: 189.99, description: 'Base price unit denominated in decimal currency.' }),
  description: z.string().openapi({ example: 'High fidelity noise-cancelling spatial headphones', description: 'Full marketing and item breakdown string.' }),
  attributes: z.array(ProductAttributeSchemaDoc).openapi({ description: 'Array of key-value pair facet components.' }),
}));

const ProductResponseSchemaDoc = registry.register('ProductResponse', z.object({
  _id: z.string().openapi({ example: '64f8c9e2b1d4c2a3e8f491a0' }),
  sku: z.string().openapi({ example: 'AUDIO-HDST-ELITE26' }),
  name: z.string().openapi({ example: 'Elite Wireless Audio Headset v26' }),
  slug: z.string().openapi({ example: 'elite-wireless-audio-headset-v26' }),
  price: z.number().openapi({ example: 189.99 }),
  description: z.string().openapi({ example: 'High fidelity noise-cancelling spatial headphones' }),
  isOutOfStock: z.boolean().openapi({ example: false, description: 'State synced asynchronously via inventory amqp brokers.' }),
  attributes: z.array(ProductAttributeSchemaDoc),
  createdAt: z.string().openapi({ example: '2026-06-09T15:33:17.000Z' }),
  updatedAt: z.string().openapi({ example: '2026-06-09T15:33:17.000Z' }),
}));

const MediaUploadRequestSchemaDoc = registry.register('MediaUploadRequest', z.object({
  contentType: z.string().openapi({ example: 'image/webp', description: 'Mime-type configuration parameter to configure the secure Azure SAS block.' }),
}));

const MediaUploadResponseSchemaDoc = registry.register('MediaUploadResponse', z.object({
  uploadUrl: z.string().openapi({ 
    example: 'https://mockstorestorage.blob.core.windows.net/catalog-images/products/asset.webp?sv=2026-04-06&sig=Tx8D...',
    description: 'Write-only, short-lived SAS signature target URL direct to Azure Object Storage container boundaries.' 
  }),
  publicAssetUrl: z.string().openapi({ 
    example: 'https://mockstorestorage.blob.core.windows.net/catalog-images/products/asset.webp',
    description: 'The immutable static URL string to persist inside database entities for client layout renders.' 
  }),
}));

// ==========================================
// 4. REGISTER API PATH MAP ROUTINGS
// ==========================================

// --- ADMIN BOUNDARY ROUTES ---

registry.registerPath({
  method: 'post',
  path: '/api/catalog/admin/products',
  summary: 'Ingest and persist a new catalog entry',
  tags: ['Admin Catalog Management'],
  security: [{ BearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: CreateProductSchemaDoc } } } },
  responses: {
    201: { 
      description: 'Product successfully instantiated and persisted in cluster database storage.',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: ProductResponseSchemaDoc }) } }
    },
    401: { description: 'Missing or malformed Bearer access token string context.' },
    403: { description: 'Forbidden: Inbound security role parameters lack administrative context.' },
    409: { description: 'Conflict: Unique database constraints violated (e.g. Duplicate product SKU).' },
    500: { description: 'Internal server system failure fallback exception.' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/catalog/admin/media-upload',
  summary: 'Acquire high-speed secure asynchronous Azure Storage SAS lease token URL',
  tags: ['Admin Catalog Management'],
  security: [{ BearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: MediaUploadRequestSchemaDoc } } } },
  responses: {
    200: { 
      description: 'Lease block successfully assigned; client-side file upload initialized bypassing catalog server overhead entirely.',
      content: { 'application/json': { schema: MediaUploadResponseSchemaDoc } }
    },
    401: { description: 'Unauthorized authentication credentials context missing.' },
    403: { description: 'Administrative authorization bounds violation.' },
  },
});

// --- PUBLIC ROUTING CONSUMPTION BOUNDARIES ---

registry.registerPath({
  method: 'get',
  path: '/api/catalog/products',
  summary: 'Query product registry using high-performance faceted filter compound lookups',
  tags: ['Public Browsing Discovery'],
  request: {
    query: z.object({
      search: z.string().optional().openapi({ description: 'Text-search parameter target string mapping against multi-key text collections.' }),
      category: z.string().optional().openapi({ description: 'Filter target classification boundaries.' }),
      limit: z.string().optional().openapi({ example: '20' }),
      page: z.string().optional().openapi({ example: '1' }),
    }),
  },
  responses: {
    200: {
      description: 'Lean JSON array resource payload dispatched successfully.',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(ProductResponseSchemaDoc) }) } }
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/catalog/products/{slug}',
  summary: 'Retrieve unique product details block using semantic identifier URL string',
  tags: ['Public Browsing Discovery'],
  request: {
    params: z.object({
      slug: z.string().openapi({ example: 'elite-wireless-audio-headset-v26' }),
    }),
  },
  responses: {
    200: {
      description: 'Un-hydrated raw data document snapshot found.',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: ProductResponseSchemaDoc }) } }
    },
    404: { description: 'Target entity could not be located using provided slug value parameters.' },
  },
});

// ==========================================
// 5. COMPILE AND EXPORT INTERACTIVE INTERFACE MIDDLEWARE ROUTER
// ==========================================
export const getDocsRouter = (): Router => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  
  const openApiDocument = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce Catalog Service API Portal Specification',
      version: '1.0.0',
      description: 'High-performance asymmetric microservice interface layout documentation generated dynamically using native operational Zod Schemas.',
    },
    servers: [
      { url: 'http://localhost:3002', description: 'Local Dev Direct Workspace Port Instance' },
      { url: 'https://api.mystore.local/catalog', description: 'Unified API K8s Envoy Ingress Gateway Base Proxy Route' }
    ],
  });

  const router = Router();
  
  // Serve raw JSON spec sheet for dynamic consumer engines
  router.get('/openapi.json', (req, res) => {
    res.json(openApiDocument);
  });
  
  // Mount the interactive Swagger Explorer portal dashboard page UI
  router.use('/', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  return router;
};