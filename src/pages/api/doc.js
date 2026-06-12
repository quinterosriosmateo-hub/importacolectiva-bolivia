import { withSwagger } from 'next-swagger-doc';

const swaggerHandler = withSwagger({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Importacolectiva Bolivia API',
      version: '1.0.0',
      description: 'Documentación de los endpoints de la API para Importacolectiva Bolivia.',
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor Local',
      },
    ],
  },
  apiFolder: 'src/pages/api',
});

const handler = swaggerHandler();

export default function (req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not Found' });
  }
  return handler(req, res);
}
