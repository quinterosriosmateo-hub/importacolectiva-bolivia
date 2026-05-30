// src/controllers/hubspotController.js
import hubspotService from '../services/hubspotService';

class HubSpotController {
  /**
   * Recibe datos del formulario de contacto y los envía a HubSpot
   */
  async submitLead(req, res) {
    try {
      const { email, firstname, lastname, phone, company, message, source, utm_source, utm_medium, utm_campaign } = req.body;

      // Validación básica
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico es obligatorio',
        });
      }

      // Preparar datos adicionales para marketing
      const enrichedData = {
        email,
        firstname: firstname || null,
        lastname: lastname || null,
        phone: phone || null,
        company: company || null,
        message: message || null,
        // Campos de tracking de campaña (útiles para medir resultados)
        hs_analytics_source: source || 'website_form',
        hs_analytics_first_url: req.headers.referer || 'direct',
        // UTM parameters (si vienen del frontend)
        ...(utm_source && { hs_analytics_source_data_1: utm_source }),
        ...(utm_medium && { hs_analytics_source_data_2: utm_medium }),
        ...(utm_campaign && { hs_analytics_campaign: utm_campaign }),
      };

      // Enviar a HubSpot
      const result = await hubspotService.createOrUpdateContact(enrichedData);

      // Opcional: Guardar en Supabase un log de esta interacción
      // await this.saveLeadLog(req.body, result);

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
   * Por ejemplo, cuando un lead se convierte en cliente
   */
  async handleWebhook(req, res) {
    try {
      const events = req.body;
      console.log('Webhook recibido de HubSpot:', events);
      
      // Aquí puedes procesar eventos como:
      // - deal.creation (nuevo negocio cerrado)
      // - contact.creation (nuevo lead)
      // Y actualizar tu base de datos local en Supabase
      
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('Error en webhook:', error);
      return res.status(500).json({ error: 'Error procesando webhook' });
    }
  }
}

export default new HubSpotController();