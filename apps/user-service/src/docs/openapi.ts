import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

// 1. Initialize the Zod prototype extension methods safely
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// 2. Define the Global Security Schema for local testing pathways
registry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Provide your RS256 token generated via /auth/otp-verify',
});

// 3. Define Reusable Component Data Schemas using your model parameters
const EmailSchemaDoc = registry.register('EmailRequest', z.object({
  email: z.string().email().openapi({ example: 'customer@mystore.com' }),
}));

const VerifyOtpSchemaDoc = registry.register('VerifyOtpRequest', z.object({
  email: z.string().email().openapi({ example: 'customer@mystore.com' }),
  otp: z.string().length(6).openapi({ example: '123456', description: '6-digit authorization code' }),
}));

const ProfileUpdateSchemaDoc = registry.register('ProfileUpdateRequest', z.object({
  firstName: z.string().min(2).openapi({ example: 'Alex' }),
  lastName: z.string().min(2).openapi({ example: 'Mercer' }),
  phone: z.string().optional().openapi({ example: '+1234567890' }),
}));

// ==========================================
// REGISTER API OPERATIONS PATHS
// ==========================================

registry.registerPath({
  method: 'post',
  path: '/api/auth/otp-request',
  summary: 'Request authentication code',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: EmailSchemaDoc } } } },
  responses: {
    200: { description: 'Code generated successfully.', content: { 'application/json': { schema: z.object({ message: z.string() }) } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/otp-verify',
  summary: 'Verify code and issue token',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: VerifyOtpSchemaDoc } } } },
  responses: {
    200: { description: 'JWT Token issued successfully.' },
    401: { description: 'Invalid or expired code context.' },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/profile',
  summary: 'Update user profile metadata',
  tags: ['Profile'],
  security: [{ BearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: ProfileUpdateSchemaDoc } } } },
  responses: {
    200: { description: 'Profile nodes saved to DB successfully.' },
    401: { description: 'Missing validation contexts or headers.' },
  },
});

// ==========================================
// GENERATE MIDDLEWARE PORTAL
// ==========================================
export const getDocsRouter = (): Router => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  
  const openApiDocument = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce User Service API Portal',
      version: '1.0.0',
      description: 'Localized microservice interface documentation generated dynamically via Zod Schemas.',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Local Dev Core Instance' }],
  });

  const router = Router();
  // Serve raw JSON spec sheet
  router.get('/swagger.json', (req, res) => res.json(openApiDocument));
  // Mount the interactive Swagger UI interface
  router.use('/', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  
  return router;
};