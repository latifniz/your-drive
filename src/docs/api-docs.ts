// src/api-docs.ts
import swaggerJsDoc from 'swagger-jsdoc';
import { config } from '../config/config';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'StoreIt API',
      version: '1.0.0',
      description: 'API documentation for StoreIt REST API',
    },
    servers: [
      {
        url: `http://${config.app_host}:${config.port}`, // Update with your server URL
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to your API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
export default swaggerDocs;
