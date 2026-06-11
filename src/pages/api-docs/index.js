import { createSwaggerSpec } from 'next-swagger-doc';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/contexts/AuthContext';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDoc({ spec }) {
  const { session } = useAuth();

  // Interceptor para inyectar el token automáticamente si el usuario está logueado
  const requestInterceptor = (req) => {
    const token = session?.access_token;
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          API Documentation
        </Typography>
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          <SwaggerUI 
            spec={spec} 
            requestInterceptor={requestInterceptor}
            persistAuthorization={true}
          />
        </Box>
      </Box>
    </Container>
  );
}

export const getServerSideProps = async () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      notFound: true,
    };
  }

  const spec = createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Importacolectiva Bolivia API',
        version: '1.0.0',
        description: 'Documentación interactiva de la API. El acceso es libre para ejecución de pruebas.'
      },
    },
    apiFolder: 'src/pages/api',
  });

  return {
    props: {
      spec,
    },
  };
};
