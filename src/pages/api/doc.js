import { withSwagger } from 'next-swagger-doc';

const swaggerHandler = withSwagger({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Importacolectiva Bolivia API',
      version: '1.0.0',
      description: 'Documentación de los endpoints de la API para Importacolectiva Bolivia',
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor Local',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apiFolder: 'src/pages/api',
});

export default swaggerHandler();
