import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

const getAuthenticatedClient = (token) => {
  if (!token) return supabase;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        },
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
      }
    }
  );
};

// In-memory mock fallbacks for local testing
let mockSubscriptions = {}; // key: userId
let mockPayments = {}; // key: userId

export const subscriptionRepository = {
  /**
   * Obtiene la suscripción activa o última de un usuario.
   */
  async getSubscription(userId, token) {
    try {
      const client = getAuthenticatedClient(token);
      const { data, error } = await client
        .from('suscripcion')
        .select('*')
        .eq('usuario_id', userId)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching subscription from Supabase for ${userId}:`, error.message);
        throw new Error(error.message);
      }

      return data || null;
    } catch (err) {
      console.error(`Network or client error in subscriptionRepository.getSubscription for ${userId}:`, err);
      throw err;
    }
  },

  /**
   * Crea o actualiza una suscripción para el usuario.
   */
  async createOrUpdateSubscription(userId, subscriptionData, token) {
    const { plan, fecha_inicio, fecha_fin, estado, renovacion_automatica } = subscriptionData;
    
    try {
      const client = getAuthenticatedClient(token);
      
      // Intentamos insertar o actualizar. Para evitar conflictos de RLS o de tabla no creada,
      // primero verificamos si ya existe una.
      const current = await this.getSubscription(userId, token);
      
      let result;
      if (current && current.id && typeof current.id === 'number') {
        // Si existe y tiene ID numérico de Supabase
        const { data, error } = await client
          .from('suscripcion')
          .update({
            plan,
            fecha_inicio,
            fecha_fin,
            estado
          })
          .eq('id', current.id)
          .select()
          .single();
          
        result = { data, error };
      } else {
        // Crear nueva fila
        const { data, error } = await client
          .from('suscripcion')
          .insert({
            usuario_id: userId,
            plan,
            fecha_inicio,
            fecha_fin,
            estado
          })
          .select()
          .single();
          
        result = { data, error };
      }

      if (result.error) {
        console.error("Supabase insert/update error in suscripcion:", result.error);
        throw new Error(result.error.message);
      }

      return { data: result.data, error: null };
    } catch (err) {
      console.error(`Error saving subscription for user ${userId}:`, err);
      return { error: err };
    }
  },

  /**
   * Cancela la renovación automática de la suscripción de un usuario.
   */
  async cancelSubscription(userId, token) {
    try {
      const client = getAuthenticatedClient(token);
      const current = await this.getSubscription(userId, token);
      
      if (!current) {
        return { error: new Error('No se encontró una suscripción activa.') };
      }
      
      if (current.id && typeof current.id === 'number') {
        const { data, error } = await client
          .from('suscripcion')
          .update({
            estado: 'Cancelada' // mantiene vigencia hasta fecha_fin
          })
          .eq('id', current.id)
          .select()
          .single();
          
        return { data, error };
      }
      
      throw new Error('No se pudo cancelar la suscripción.');
    } catch (err) {
      console.error(`Error canceling subscription for user ${userId}:`, err);
      return { error: err };
    }
  },

  /**
   * Obtiene la lista de pagos de un usuario.
   */
  async getPayments(userId, token) {
    try {
      const client = getAuthenticatedClient(token);
      const { data, error } = await client
        .from('pago')
        .select('*')
        .eq('usuario_id', userId)
        .order('fecha', { ascending: false });

      if (error) {
        console.error(`Error fetching payments from Supabase for ${userId}:`, error.message);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error(`Network or client error in subscriptionRepository.getPayments for ${userId}:`, err);
      return [];
    }
  },

  /**
   * Registra un pago.
   */
  async createPayment(userId, paymentData, token) {
    const { monto, metodo, estado, fecha } = paymentData;
    try {
      const client = getAuthenticatedClient(token);
      const { data, error } = await client
        .from('pago')
        .insert({
          usuario_id: userId,
          monto,
          metodo,
          estado,
          fecha: fecha || new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase insert/update error in pago:", error);
        throw new Error(error.message);
      }

      return { data, error: null };
    } catch (err) {
      console.error(`Error saving payment record for user ${userId}:`, err);
      return { error: err };
    }
  }
};
