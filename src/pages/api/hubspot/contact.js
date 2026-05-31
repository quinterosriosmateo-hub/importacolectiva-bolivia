// src/pages/api/hubspot/contact.js
import hubspotController from '../../../controllers/hubspotController';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  // Delegar al controlador
  return hubspotController.submitLead(req, res);
}