const swaggerJsdoc = require('swagger-jsdoc');

const serverUrl =
  process.env.RENDER_EXTERNAL_URL ||
  process.env.API_BASE_URL ||
  `http://localhost:${process.env.PORT || 3000}`;

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Check Price Platform API',
    version: '1.0.0',
    description: 'REST API for the Check Price Platform — Phase 1: Auth, Phase 2: Stores, Phase 3: Products',
  },
  servers: [
    {
      url: serverUrl,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string' },
          path: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
