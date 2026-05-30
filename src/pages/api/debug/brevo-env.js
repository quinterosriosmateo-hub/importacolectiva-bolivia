// src/pages/api/debug/brevo-env.js
export default function handler(req, res) {
  // Mostrar qué variables de Brevo existen (sin mostrar valores completos por seguridad)
  const brevoKeys = Object.keys(process.env).filter(key => key.includes('BREVO'));
  
  res.status(200).json({
    hasBrevoApiKey: !!process.env.BREVO_API_KEY,
    brevoApiKeyPrefix: process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 15) + '...' : 'no-existe',
    brevoApiKeyLength: process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.length : 0,
    brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || 'no-configurado',
    brevoListAllUsers: process.env.BREVO_LIST_ALL_USERS || 'no-configurado',
    brevoListEducational: process.env.BREVO_LIST_EDUCATIONAL || 'no-configurado',
    brevoListGroupPurchase: process.env.BREVO_LIST_GROUP_PURCHASE || 'no-configurado',
    allBrevoEnvVars: brevoKeys,
    nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL || 'no-configurado'
  });
}