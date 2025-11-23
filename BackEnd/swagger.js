const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const PORT = process.env.PORT || 5050;
const isProd = process.env.NODE_ENV === "production";

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bird Classification API',
      version: '1.0.0',
      description: 'API documentation for the Bird Classification application. **To authenticate:** 1) Use `/createUser` or `/authenticateUser` endpoint first. 2) The session cookie will be automatically stored. 3) You can then use protected endpoints. If needed, you can manually enter the cookie value from browser DevTools (Application > Cookies > connect.sid) in the Authorize button.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server (local)',
      },
      {
        url: 'https://birdquest-backend.onrender.com',
        description: 'Production server (Render)',
      },
      {
        url: 'https://comp-4537-t5-prj.vercel.app',
        description: 'Production server (Vercel - Frontend)',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            ok: {
              type: 'boolean',
              example: false,
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            ok: {
              type: 'boolean',
              example: true,
            },
            msg: {
              type: 'string',
              description: 'Success message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
            },
            user_type_id: {
              type: 'integer',
            },
            api_consumption: {
              type: 'integer',
            },
            score: {
              type: 'integer',
            },
          },
        },
        BirdAnalysis: {
          type: 'object',
          properties: {
            label: {
              type: 'string',
              description: 'Bird species name',
            },
            probability: {
              type: 'number',
              description: 'Confidence score',
            },
            classId: {
              type: 'integer',
            },
            message: {
              type: 'string',
              description: 'Status message',
            },
            score: {
              type: 'integer',
              description: 'Updated user score',
            },
          },
        },
      },
    },
    // Note: Individual endpoints can override this with security: [] for public endpoints
  },
  apis: ['./routes/*.js'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

