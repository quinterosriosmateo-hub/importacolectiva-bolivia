import { productController } from '@/controllers/productController';
import { withAuth } from '@/lib/withAuth';

async function handler(req, res) {
  if (req.method === 'GET') {
    return await productController.getProducts(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
