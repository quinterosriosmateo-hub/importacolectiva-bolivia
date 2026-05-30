// src/services/hubspotService.js
import { Client } from '@hubspot/api-client';

class HubSpotService {
  constructor() {
    this.hubspotClient = new Client({
      accessToken: process.env.HUBSPOT_API_KEY,
    });
  }

  async createOrUpdateContact(contactData) {
    const { email, firstname, lastname, message, hs_lead_source, hs_analytics_source, hs_analytics_source_data_1, hs_analytics_source_data_2, hs_analytics_campaign, hs_content_membership_notes } = contactData;

    if (!email) {
      throw new Error('El email es obligatorio para crear un contacto en HubSpot');
    }

    try {
      const apiResponse = await this.hubspotClient.crm.contacts.basicApi.create({
        properties: {
          email,
          firstname: firstname || '',
          lastname: lastname || '',
          // Campos de marketing (editables)
          hs_lead_source: hs_lead_source || 'OTHER_CAMPAIGNS',
          hs_analytics_source: hs_analytics_source || 'OTHER_CAMPAIGNS',
          hs_analytics_source_data_1: hs_analytics_source_data_1 || '',
          hs_analytics_source_data_2: hs_analytics_source_data_2 || '',
          hs_analytics_campaign: hs_analytics_campaign || '',
          hs_content_membership_notes: hs_content_membership_notes || message || '',
        },
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
      
      // Mostrar detalles del error de validación
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