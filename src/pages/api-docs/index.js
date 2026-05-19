import { createSwaggerSpec } from 'next-swagger-doc';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDoc({ spec }) {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          API Documentation
        </Typography>
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          <SwaggerUI spec={spec} />
        </Box>
      </Box>
    </Container>
  );
}

export const getStaticProps = async () => {
  const spec = createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Importacolectiva Bolivia API',
        version: '1.0.0',
      },
    },
    apiFolder: 'pages/api',
  });

  return {
    props: {
      spec,
    },
  };
};
