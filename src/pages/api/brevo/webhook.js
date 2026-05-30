// src/pages/api/brevo/webhook.js
import brevoController from '../../../controllers/brevoController';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return brevoController.handleWebhook(req, res);
  }
  
  res.status(405).json({ success: false, message: 'Method not allowed' });
}