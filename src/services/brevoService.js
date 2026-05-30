// src/services/brevoService.js
import axios from 'axios';

class BrevoService {
  constructor() {
    this.brevoClient = axios.create({
      baseURL: 'https://api.brevo.com/v3',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    });
  }

  // ID de listas (crearlas primero en Brevo Dashboard)
  getLists() {
    return {
      ALL_USERS: parseInt(process.env.BREVO_LIST_ALL_USERS || '2'),
      EDUCATIONAL: parseInt(process.env.BREVO_LIST_EDUCATIONAL || '3'),
      GROUP_PURCHASE: parseInt(process.env.BREVO_LIST_GROUP_PURCHASE || '4'),
    };
  }

  async createOrUpdateContact(contactData) {
    const { email, nombre, telefono, empresa, userId, rol } = contactData;

    if (!email) {
      throw new Error('El email es obligatorio para crear un contacto en Brevo');
    }

    try {
      // Separar nombre y apellido si viene completo
      const nombreParts = nombre ? nombre.split(' ') : ['', ''];
      const firstname = nombreParts[0] || '';
      const lastname = nombreParts.slice(1).join(' ') || '';

      const apiResponse = await this.brevoClient.post('/contacts', {
        email,
        attributes: {
          PRENOM: firstname,      // Nombre en Brevo
          NOM: lastname,          // Apellido en Brevo
          TELEFONO: telefono || '',
          EMPRESA: empresa || '',
          USER_ID: userId || '',
          ROL: rol || 'Cliente',
          SITIO_WEB: 'Importa Colectiva Bolivia',
          FECHA_REGISTRO: new Date().toISOString(),
        },
        listIds: [this.getLists().ALL_USERS],
        updateEnabled: true,      // Actualiza si ya existe
      });

      return {
        success: true,
        data: apiResponse.data,
        message: 'Contacto creado/actualizado en Brevo',
      };
    } catch (error) {
      console.error('Error en Brevo Service:', error.response?.data || error.message);
      
      if (error.response?.status === 400 && error.response?.data?.code === 'duplicate_parameter') {
        // Si ya existe, intentamos actualizar en lugar de crear
        try {
          const updateResponse = await this.brevoClient.post('/contacts', {
            email,
            attributes: {
              PRENOM: firstname,
              NOM: lastname,
              TELEFONO: telefono || '',
              EMPRESA: empresa || '',
              USER_ID: userId || '',
              ROL: rol || 'Cliente',
              FECHA_ACTUALIZACION: new Date().toISOString(),
            },
            updateEnabled: true,
          });
          return {
            success: true,
            data: updateResponse.data,
            message: 'Contacto actualizado en Brevo',
          };
        } catch (updateError) {
          throw new Error(`Error al actualizar contacto: ${updateError.message}`);
        }
      }
      
      throw new Error(`Error al comunicarse con Brevo: ${error.message}`);
    }
  }

  // Enviar email de bienvenida educativo (Objetivo específico #1)
  async sendWelcomeEmail(email, nombre) {
    try {
      // Usando template HTML personalizado (sin templateId para más control)
      const response = await this.brevoClient.post('/smtp/email', {
        to: [{ email, name: nombre || email }],
        sender: { 
          name: 'Importa Colectiva Bolivia', 
          email: process.env.BREVO_SENDER_EMAIL || 'info@importacolectiva.com' 
        },
        subject: '📚 Bienvenido a Importa Colectiva Bolivia - Comienza tu camino como importador',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1a73e8; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .button { display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: white; text-decoration: none; border-radius: 5px; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>¡Bienvenido, ${nombre || 'Futuro Importador'}! 🎉</h1>
              </div>
              <div class="content">
                <h2>Tu viaje hacia importaciones exitosas comienza aquí</h2>
                <p>En Importa Colectiva Bolivia te ayudamos a dominar el proceso de importación desde China paso a paso.</p>
                
                <h3>📖 ¿Qué encontrarás en nuestra plataforma?</h3>
                <ul>
                  <li><strong>Cursos gratuitos:</strong> Aprende desde cero cómo importar productos</li>
                  <li><strong>Proveedores verificados:</strong> Contactos confiables en China</li>
                  <li><strong>Compras grupales:</strong> Reduce costos de envío importando en grupo</li>
                  <li><strong>Simulador de costos:</strong> Calcula gastos de importación</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/courses" class="button" style="color: white; text-decoration: none;">
                </div>
                
                <h3>🎓 Tu primer reto educativo:</h3>
                <p>Completa el curso "Introducción a la Importación desde China" y obtén tu primer certificado en menos de 30 minutos.</p>
                
                <p>¿Tienes preguntas? Responde a este correo y nuestro equipo de asesores te ayudará.</p>
                
                <p>¡Juntos hacemos las importaciones más accesibles para todos!</p>
                
                <p><strong>Saludos,<br>Equipo Importa Colectiva Bolivia 🇧🇴</strong></p>
              </div>
              <div class="footer">
                <p>Este es un correo automático de bienvenida. Si no solicitaste esta cuenta, ignora este mensaje.</p>
                <p>© 2025 Importa Colectiva Bolivia - Haciendo las importaciones accesibles para todos</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      return {
        success: true,
        message: 'Email de bienvenida enviado exitosamente',
      };
    } catch (error) {
      console.error('Error enviando email de bienvenida:', error.response?.data || error.message);
      // No lanzamos error para no interrumpir el flujo de registro
      return {
        success: false,
        message: 'Error al enviar email de bienvenida',
        error: error.message,
      };
    }
  }

  // <-- NUEVO: Enviar email de bienvenida con descuento para leads de marketing
  async sendMarketingWelcomeEmail(email, nombre) {
    try {
      const response = await this.brevoClient.post('/smtp/email', {
        to: [{ email, name: nombre || email }],
        sender: { 
          name: 'Importa Colectiva Bolivia', 
          email: process.env.BREVO_SENDER_EMAIL || 'info@importacolectiva.com' 
        },
        subject: '🎁 ¡Tu descuento del 15% te espera! - Importa Colectiva Bolivia',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
              .discount-code { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 2px; font-weight: bold; border-radius: 8px; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: white; text-decoration: none; border-radius: 5px; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>¡Gracias por tu interés, ${nombre || 'Futuro Importador'}! 🎉</h1>
              </div>
              <div class="content">
                <h2>Tu código de descuento exclusivo</h2>
                <p>Como agradecimiento por registrarte en nuestra lista, aquí tienes tu <strong>15% de descuento</strong> para tu primera asesoría de importación.</p>
                
                <div class="discount-code">
                  🎫 IMPORTADOR15
                </div>
                
                <p><strong>Cómo canjearlo:</strong></p>
                <ol>
                  <li>Completa tu registro en nuestra plataforma</li>
                  <li>Selecciona el servicio de "Asesoría Personalizada"</li>
                  <li>Ingresa el código <strong>IMPORTADOR15</strong> al momento de pagar</li>
                </ol>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/register" class="button" style="color: white; text-decoration: none;">
                    🚀 Completar mi registro ahora
                  </a>
                </div>
                
                <h3>📚 Lo que incluye tu asesoría:</h3>
                <ul>
                  <li>✅ Análisis del producto que quieres importar</li>
                  <li>✅ Búsqueda de proveedores en China</li>
                  <li>✅ Cálculo de costos totales (flete, impuestos, aduana)</li>
                  <li>✅ Hoja de ruta paso a paso</li>
                  <li>✅ Acceso a la comunidad de compras grupales</li>
                </ul>
                
                <p><strong>¿Tienes preguntas?</strong> Responde a este correo y te ayudaremos encantados.</p>
                
                <p><strong>¡Te esperamos en la comunidad!</strong><br>
                Equipo Importa Colectiva Bolivia 🇧🇴</p>
              </div>
              <div class="footer">
                <p>Si no solicitaste este descuento, puedes ignorar este mensaje.</p>
                <p>© 2025 Importa Colectiva Bolivia - Haciendo las importaciones accesibles para todos</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      return {
        success: true,
        message: 'Email de bienvenida con descuento enviado',
      };
    } catch (error) {
      console.error('Error enviando email de bienvenida marketing:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Error al enviar email de bienvenida',
        error: error.message,
      };
    }
  }
  // ========== FIN NUEVO ==========

  // Enviar notificación de compra grupal (Objetivo específico #3)
  async sendGroupPurchaseNotification(email, nombre, productName, groupSize, requiredSize) {
    try {
      const response = await this.brevoClient.post('/smtp/email', {
        to: [{ email, name: nombre || email }],
        sender: { 
          name: 'Importa Colectiva Bolivia', 
          email: process.env.BREVO_SENDER_EMAIL || 'info@importacolectiva.com' 
        },
        subject: `🚢 ¡Oportunidad de compra grupal! - ${productName}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a73e8;">¡Tu compra grupal está cerca!</h2>
            <p>Hola ${nombre || 'importador'},</p>
            <p>El producto <strong>${productName}</strong> que te interesa ya tiene <strong>${groupSize} personas</strong> interesadas.</p>
            <p><strong>Faltan solo ${requiredSize - groupSize} personas</strong> para completar el grupo y activar la compra.</p>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #f0f8ff; border-radius: 8px;">
              <h3>💰 Beneficios de la compra grupal:</h3>
              <ul>
                <li>Hasta 40% menos en flete internacional</li>
                <li>Precios mayoristas en productos</li>
                <li>Asesoría legal y aduanera incluida</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/group-purchase/${productName}" 
                    style="display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: white; text-decoration: none; border-radius: 5px;">
                    🔗 Unirme a esta compra grupal
                </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              ¿No estás interesado? Puedes ajustar tus preferencias en tu perfil.
            </p>
          </div>
        `,
      });

      return { success: true };
    } catch (error) {
      console.error('Error enviando notificación grupal:', error);
      return { success: false };
    }
  }

  // Agregar usuario a lista específica (para segmentación)
  async addToList(email, listId) {
    try {
      await this.brevoClient.post(`/contacts/lists/${listId}/contacts/add`, {
        emails: [email],
      });
      return { success: true };
    } catch (error) {
      console.error(`Error agregando ${email} a lista ${listId}:`, error.response?.data || error);
      return { success: false };
    }
  }
}

export default new BrevoService();