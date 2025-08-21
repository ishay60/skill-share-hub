import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SkillShareHub API',
      version: '1.0.0',
      description: 'A complete SaaS knowledge spaces platform API',
      contact: {
        name: 'SkillShareHub Support',
        url: 'https://github.com/ishay60/skill-share-hub',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth-token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['creator', 'user'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Space: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            creator_id: { type: 'string' },
            subscription_price: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            space_id: { type: 'string' },
            is_premium: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number' },
            environment: { type: 'string' },
            version: { type: 'string' },
            checks: {
              type: 'object',
              properties: {
                database: { type: 'string' },
                redis: { type: 'string' },
                stripe: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  // Only enable Swagger in development mode
  if (process.env.NODE_ENV !== 'production') {
    app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'SkillShareHub API Documentation',
        swaggerOptions: {
          persistAuthorization: true,
        },
      })
    );

    app.get('/api/docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(specs);
    });

    console.log('📚 Swagger UI available at http://localhost:4000/api/docs');
  }
};

export { specs };
