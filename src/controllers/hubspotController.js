// src/controllers/hubspotController.js
import hubspotService from '../services/hubspotService';

class HubSpotController {
  /**
   * Recibe datos del formulario de contacto y los envía a HubSpot
   */
  async submitLead(req, res) {
    try {
      const { email, firstname, lastname, message, source, utm_source, utm_medium, utm_campaign } = req.body;

      // Validación básica
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico es obligatorio',
        });
      }

      // Valores permitidos por HubSpot para hs_analytics_source
      const allowedSources = [
        'ORGANIC_SEARCH', 'PAID_SEARCH', 'EMAIL_MARKETING', 
        'SOCIAL_MEDIA', 'REFERRALS', 'OTHER_CAMPAIGNS', 
        'DIRECT_TRAFFIC', 'OFFLINE', 'PAID_SOCIAL', 'AI_REFERRALS'
      ];
      
      // Mapear el source a un valor permitido, o usar DIRECT_TRAFFIC por defecto
      let mappedSource = 'DIRECT_TRAFFIC';
      if (source === 'homepage_cta_descuento') {
        mappedSource = 'OTHER_CAMPAIGNS'; // Porque es una campaña especial
      } else if (allowedSources.includes(source)) {
        mappedSource = source;
      }

      // Preparar datos para HubSpot (SOLO campos editables)
      const leadData = {
        email,
        firstname: firstname || '',
        lastname: lastname || '',
        message: message || '',
        // Usar campos que HubSpot permite escribir
        hs_lead_source: mappedSource,
        hs_analytics_source: mappedSource,
        // UTM parameters (estos campos sí son editables)
        hs_analytics_source_data_1: utm_source || '',
        hs_analytics_source_data_2: utm_medium || '',
        hs_analytics_campaign: utm_campaign || '',
        // Nota interna (campo editable)
        hs_content_membership_notes: message || `Lead capturado desde oferta de descuento. Origen: ${source}`,
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

  /**
   * Endpoint para recibir webhooks de HubSpot (opcional)
   */
  async handleWebhook(req, res) {
    try {
      const events = req.body;
      console.log('Webhook recibido de HubSpot:', events);
      
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('Error en webhook:', error);
      return res.status(500).json({ error: 'Error procesando webhook' });
    }
  }
}

export default new HubSpotController();