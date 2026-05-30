// src/services/hubspotService.js
import { Client } from '@hubspot/api-client';

class HubSpotService {
  constructor() {
    this.hubspotClient = new Client({
      accessToken: process.env.HUBSPOT_API_KEY,
    });
  }

  async createOrUpdateContact(contactData) {
    // Solo tomamos los campos que realmente vamos a usar
    const { email, firstname, lastname, message, utm_source, utm_medium, utm_campaign } = contactData;

    if (!email) {
      throw new Error('El email es obligatorio para crear un contacto en HubSpot');
    }

    try {
      console.log(`📢 [HubSpot] Creando contacto para: ${email}`);

      // Usar SOLO campos estándar que existen en HubSpot
      const apiResponse = await this.hubspotClient.crm.contacts.basicApi.create({
        properties: {
          email,
          firstname: firstname || '',
          lastname: lastname || '',
          hs_content_membership_notes: message || 'Lead desde formulario web',
          hs_analytics_source: utm_source || 'OTHER_CAMPAIGNS',
          hs_analytics_source_data_2: utm_medium || '',
          hs_analytics_campaign: utm_campaign || '',
        },
      });

      console.log(`✅ [HubSpot] Contacto creado con ID: ${apiResponse.id}`);

      // =============================================
      // NUEVO: Llamar a Brevo en BACKGROUND (sin bloquear)
      // =============================================
      console.log(`📢 [HubSpot] Iniciando background sync para Brevo: ${email}`);
      
      // Construir URL base (funciona tanto en desarrollo como en producción)
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
      
      // Llamar al endpoint de background (no esperamos respuesta)
      fetch(`${baseUrl}/api/background/brevo-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          nombre: `${firstname || ''} ${lastname || ''}`.trim(),
          firstname: firstname || '',
          userId: apiResponse.id,
          message: message || 'Lead desde formulario web'
        }),
      }).catch(err => {
        console.error('⚠️ [HubSpot] Error llamando a background sync:', err?.message || err);
      });
      
      console.log(`📢 [HubSpot] Background sync iniciado (no esperamos respuesta)`);
      // =============================================

      return {
        success: true,
        data: apiResponse,
        message: 'Contacto creado/actualizado en HubSpot',
      };
    } catch (error) {
      console.error('Error en HubSpot Service:', error);
      
      if (error.code === 409) {
        throw new Error('El contacto ya existe y fue actualizado');
      }
      
      if (error.body && error.body.errors) {
        console.error('Detalles de validación:', error.body.errors);
        throw new Error(`Error de validación: ${error.body.errors.map(e => e.message).join(', ')}`);
      }
      
      throw new Error(`Error al comunicarse con HubSpot: ${error.message}`);
    }
  }

  async searchContactByEmail(email) {
    try {
      const response = await this.hubspotClient.crm.contacts.searchApi.doSearch({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email,
          }],
        }],
      });
      
      return response.results.length > 0 ? response.results[0] : null;
    } catch (error) {
      console.error('Error buscando contacto:', error);
      return null;
    }
  }
}

export default new HubSpotService();