// src/services/hubspotService.js
import { Client } from '@hubspot/api-client';
import brevoService from './brevoService';

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

      console.log(`✅ [HubSpot] Contacto creado con ID: ${apiResponse.id}`);

      // Sincronizar con Brevo en paralelo (sin bloquear)
      console.log(`📢 [HubSpot] Llamando a syncWithBrevo para: ${email}`);
      Promise.resolve(this.syncWithBrevo(email, firstname, lastname, message, apiResponse.id))
        .catch(err => {
        console.error('⚠️ Error en sincronización con Brevo (no crítico):', err?.message || err);
      });

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

  // Método auxiliar para sincronizar con Brevo (CON LOGS MEJORADOS)
async syncWithBrevo(email, firstname, lastname, message, hubspotId) {
  const startTime = Date.now();
  console.log(`🔍 [Brevo] Iniciando sync para email: ${email} at ${startTime}`);
  
  try {
    const nombreCompleto = `${firstname || ''} ${lastname || ''}`.trim();
    
    console.log(`📤 [Brevo] Paso 1: Llamando a createOrUpdateContact...`);
    const contactStart = Date.now();
    const contactResult = await brevoService.createOrUpdateContact({
      email,
      nombre: nombreCompleto || email,
      telefono: '',
      empresa: '',
      userId: hubspotId,
      rol: 'Lead',
      source: message || 'Formulario web',
    });
    console.log(`✅ [Brevo] createOrUpdateContact exitoso en ${Date.now() - contactStart}ms`);
    
    console.log(`📧 [Brevo] Paso 2: Enviando email de bienvenida...`);
    const emailStart = Date.now();
    const emailResult = await brevoService.sendMarketingWelcomeEmail(email, firstname || email);
    console.log(`✅ [Brevo] Email enviado en ${Date.now() - emailStart}ms`);
    
    console.log(`✅ [Brevo] Lead ${email} sincronizado COMPLETAMENTE en ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error(`❌ [Brevo] Error sincronizando ${email} después de ${Date.now() - startTime}ms:`, error?.message || error);
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