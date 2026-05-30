// src/controllers/brevoController.js
import brevoService from '../services/brevoService';

class BrevoController {
  // Endpoint para sincronizar contacto con Brevo (similar a HubSpot)
  async syncContact(req, res) {
    try {
      const { email, nombre, telefono, empresa, userId, rol } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico es obligatorio',
        });
      }

      const result = await brevoService.createOrUpdateContact({
        email,
        nombre: nombre || '',
        telefono: telefono || '',
        empresa: empresa || '',
        userId: userId || '',
        rol: rol || 'Cliente',
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error('Error en Brevo Controller (syncContact):', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error interno al sincronizar con Brevo',
      });
    }
  }

  // Endpoint para enviar email de bienvenida educativo
  async sendWelcomeEmail(req, res) {
    try {
      const { email, nombre } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico es obligatorio',
        });
      }

      const result = await brevoService.sendWelcomeEmail(email, nombre);

      return res.status(200).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      console.error('Error enviando email de bienvenida:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al enviar email de bienvenida',
      });
    }
  }

  // Webhook para recibir eventos de Brevo (cuando abren emails, hacen clic, etc)
  async handleWebhook(req, res) {
    try {
      const events = req.body;
      
      // Brevo envía un array de eventos
      const eventsArray = Array.isArray(events) ? events : [events];
      
      for (const event of eventsArray) {
        const { event: eventType, email, message_id, tag, date } = event;
        
        console.log(`[Brevo Webhook] Evento: ${eventType} | Email: ${email} | Tag: ${tag}`);
        
        // Aquí puedes:
        // 1. Guardar en tu base de datos el engagement del usuario
        // 2. Actualizar un campo en HubSpot (si tienes la integración)
        // 3. Disparar acciones automáticas
        
        if (eventType === 'open') {
          // Usuario abrió el email - está interesado
          console.log(`📧 Usuario ${email} abrió el email educativo`);
        } else if (eventType === 'click') {
          // Usuario hizo clic en un enlace - muy interesado
          console.log(`🖱️ Usuario ${email} hizo clic en el email - Tag: ${tag}`);
        } else if (eventType === 'delivered') {
          console.log(`✅ Email entregado a ${email}`);
        } else if (eventType === 'hard_bounce') {
          console.log(`❌ Email rebotado permanentemente: ${email}`);
        }
      }
      
      // Responder 200 para que Brevo sepa que recibió el webhook
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('Error en webhook de Brevo:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new BrevoController();