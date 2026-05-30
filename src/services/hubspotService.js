// src/services/hubspotService.js
import { Client } from '@hubspot/api-client';
import brevoService from './brevoService'; // <-- NUEVO: Importar Brevo

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
      // Usar SOLO campos estándar que existen en HubSpot
      const apiResponse = await this.hubspotClient.crm.contacts.basicApi.create({
        properties: {
          email,
          firstname: firstname || '',
          lastname: lastname || '',
          // Nota interna (campo estándar)
          hs_content_membership_notes: message || 'Lead desde formulario web',
          // Fuente de tráfico (campo estándar)
          hs_analytics_source: utm_source || 'OTHER_CAMPAIGNS',
          // Medio de tráfico (campo estándar)
          hs_analytics_source_data_2: utm_medium || '',
          // Campaña (campo estándar)
          hs_analytics_campaign: utm_campaign || '',
        },
      });

      // <-- NUEVO: Sincronizar con Brevo en paralelo (sin bloquear)
      this.syncWithBrevo(email, firstname, lastname, message, apiResponse.id).catch(err => {
        console.error('⚠️ Error en sincronización con Brevo (no crítico):', err?.message || err);
      });
      // ========== FIN NUEVO ==========

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

  // <-- NUEVO: Método auxiliar para sincronizar con Brevo
  async syncWithBrevo(email, firstname, lastname, message, hubspotId) {
    try {
      const nombreCompleto = `${firstname || ''} ${lastname || ''}`.trim();
      
      await brevoService.createOrUpdateContact({
        email,
        nombre: nombreCompleto || email,
        telefono: '',
        empresa: '',
        userId: hubspotId,
        rol: 'Lead',
        source: message || 'Formulario web',
      });

      await brevoService.sendMarketingWelcomeEmail(email, firstname || email);
      
      console.log(`✅ Lead ${email} sincronizado con Brevo`);
    } catch (error) {
      console.error(`❌ Error sincronizando ${email} con Brevo:`, error?.message || error);
    }
  }
  // ========== FIN NUEVO ==========

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