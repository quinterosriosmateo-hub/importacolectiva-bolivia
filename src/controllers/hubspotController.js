// src/controllers/hubspotController.js
import hubspotService from '../services/hubspotService';

class HubSpotController {
  async submitLead(req, res) {
    try {
      const { email, firstname, lastname, message, utm_source, utm_medium, utm_campaign } = req.body;

      // Validación básica
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico es obligatorio',
        });
      }

      // Preparar datos SOLO con campos estándar
      const leadData = {
        email,
        firstname: firstname || '',
        lastname: lastname || '',
        message: message || 'Lead desde formulario web',
        utm_source: utm_source || 'OTHER_CAMPAIGNS',
        utm_medium: utm_medium || '',
        utm_campaign: utm_campaign || '',
      };

      // Enviar a HubSpot
      const result = await hubspotService.createOrUpdateContact(leadData);

      return res.status(200).json({
        success: true,
        message: 'Lead registrado exitosamente en CRM',
        data: result.data,
      });
    } catch (error) {
      console.error('Error en HubSpot Controller:', error);
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Error interno al procesar el lead',
      });
    }
  }
}

export default new HubSpotController();