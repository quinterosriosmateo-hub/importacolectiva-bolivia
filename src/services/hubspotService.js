// src/services/hubspotService.js
import { Client } from '@hubspot/api-client';

class HubSpotService {
  constructor() {
    // El API key se tomará de las variables de entorno de Vercel
    this.hubspotClient = new Client({
      apiKey: process.env.HUBSPOT_API_KEY,
    });
  }

  /**
   * Crea o actualiza un contacto en HubSpot
   * @param {Object} contactData - Datos del contacto (email, firstname, lastname, phone, etc.)
   * @returns {Promise<Object>} Respuesta de HubSpot
   */
  async createOrUpdateContact(contactData) {
    const { email, firstname, lastname, phone, company, website, message, ...customProperties } = contactData;

    if (!email) {
      throw new Error('El email es obligatorio para crear un contacto en HubSpot');
    }

    try {
      const apiResponse = await this.hubspotClient.crm.contacts.basicApi.create({
        properties: {
          email,
          firstname: firstname || '',
          lastname: lastname || '',
          phone: phone || '',
          company: company || '',
          website: website || '',
          // Campo personalizado para guardar el mensaje o interés
          hs_content_membership_notes: message || '',
          // Marcar como lead nuevo (opcional - necesitas tener este campo personalizado)
          // hs_lead_status: 'NEW',
          ...customProperties,
        },
      });

      return {
        success: true,
        data: apiResponse,
        message: 'Contacto creado/actualizado en HubSpot',
      };
    } catch (error) {
      console.error('Error en HubSpot Service:', error);
      
      // Manejo específico de errores comunes
      if (error.code === 409) {
        throw new Error('El contacto ya existe y fue actualizado');
      }
      
      throw new Error(`Error al comunicarse con HubSpot: ${error.message}`);
    }
  }

  /**
   * Busca un contacto por email (útil para verificar si ya existe)
   */
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

  /**
   * Registra un evento personalizado (útil para analítica de comportamiento)
   */
  async trackCustomEvent(email, eventName, properties = {}) {
    // Esto requiere el tracking code de HubSpot en el frontend
    // Para backend, puedes usar las APIs de eventos (si tienes Marketing Hub)
    console.log(`[HubSpot Track] ${email} - ${eventName}`, properties);
    // Implementación avanzada si tienes acceso a la API de eventos
  }
}

export default new HubSpotService();