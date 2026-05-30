// src/pages/api/background/brevo-sync.js
import brevoService from '@/services/brevoService';

export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, nombre, userId, firstname } = req.body;
  
  console.log(`🔄 [Background] Sync iniciado para: ${email}`);
  console.log(`🔄 [Background] Datos:`, { nombre, userId });
  
  try {
    // Paso 1: Crear/actualizar contacto en Brevo
    console.log(`📤 [Background] Creando contacto para: ${email}`);
    const contactResult = await brevoService.createOrUpdateContact({
      email,
      nombre: nombre || email,
      telefono: '',
      empresa: '',
      userId: userId || 'background-sync',
      rol: 'Lead',
      source: 'Background sync desde HubSpot',
    });
    console.log(`✅ [Background] Contacto creado/actualizado:`, contactResult.success);
    
    // Paso 2: Enviar email de bienvenida con descuento
    console.log(`📧 [Background] Enviando email a: ${email}`);
    const emailResult = await brevoService.sendMarketingWelcomeEmail(email, firstname || nombre || email);
    console.log(`✅ [Background] Email enviado:`, emailResult.success);
    
    console.log(`✅ [Background] Sync COMPLETADO para: ${email}`);
    return res.status(200).json({ 
      success: true, 
      message: 'Brevo sync completado',
      contact: contactResult,
      email: emailResult
    });
    
  } catch (error) {
    console.error(`❌ [Background] Error para ${email}:`, error?.message || error);
    console.error(`❌ [Background] Error stack:`, error?.stack);
    return res.status(500).json({ 
      success: false, 
      error: error?.message || 'Error desconocido' 
    });
  }
}