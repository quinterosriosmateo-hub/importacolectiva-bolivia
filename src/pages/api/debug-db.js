export default async function handler(req, res) {
  const { createClient } = require('@supabase/supabase-js');
  const token = req.headers.authorization?.split(' ')[1];
  
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
      }
    }
  );

  const userId = req.query.userId || '385780ea-2f38-4b00-a745-0f7636523fcf';

  const { data: subData, error: subError } = await client
    .from('suscripcion')
    .select('*')
    .eq('usuario_id', userId);

  const { data: payData, error: payError } = await client
    .from('pago')
    .select('*')
    .eq('usuario_id', userId);

  res.status(200).json({
    userId,
    token_provided: !!token,
    suscripcion: { data: subData, error: subError },
    pago: { data: payData, error: payError }
  });
}
