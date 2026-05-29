import { subscriptionRepository } from '@/repositories/subscriptionRepository';
import { authRepository } from '@/repositories/authRepository';

export const subscriptionService = {
  /**
   * Obtiene la suscripción del usuario, validando expiraciones en tiempo de consulta.
   */
  async getSubscription(userId, token) {
    // getSubscription returns the row directly (or null), not { data, error }
    let subscription = null;
    try {
      subscription = await subscriptionRepository.getSubscription(userId, token);
    } catch (err) {
      console.error(`[subscriptionService] Error al obtener suscripción para ${userId}:`, err);
      return null;
    }

    // Si realmente no existe registro de suscripción, devolvemos el Plan Gratuito
    if (!subscription) {
      return {
        plan: 'Gratuito',
        estado: 'Inactivo',
        fecha_inicio: null,
        fecha_fin: null,
        renovacion_automatica: false
      };
    }

    // Solo validamos expiración si tiene una fecha de fin definida (evita fallos con planes gratuitos)
    if (subscription && subscription.fecha_fin) {
      const now = new Date();
      const fechaFin = new Date(subscription.fecha_fin);

      // Si la fecha de finalización ya pasó y aún figuraba como Activa o Cancelada
      if (fechaFin < now && (subscription.estado === 'Activa' || subscription.estado === 'Cancelada')) {
        console.log(`[subscriptionService] La suscripción de ${userId} ha expirado. Procediendo a degradar rol.`);
        
        // 1. Degradamos el rol del usuario a Cliente
        await authRepository.updateProfile(userId, { rol: 'Cliente' }, token);

        // 2. Actualizar estado a Expirada en la tabla de suscripciones
        const updated = await subscriptionRepository.createOrUpdateSubscription(userId, {
          plan: subscription.plan,
          fecha_inicio: subscription.fecha_inicio,
          fecha_fin: subscription.fecha_fin,
          estado: 'Expirada'
        }, token);

        if (updated.data) {
          subscription = updated.data;
        }
      }
    }

    if (subscription && typeof subscription.renovacion_automatica === 'undefined') {
      subscription.renovacion_automatica = subscription.estado === 'Activa';
    }

    return subscription;
  },

  /**
   * Crea una suscripción Premium y registra el pago correspondiente.
   */
  async subscribe(userId, { plan, metodoPago, monto }, token) {
    if (plan !== 'Premium') {
      return { error: new Error('Plan de suscripción no válido.') };
    }

    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    // 0. Asegurar que el usuario exista en la tabla public.usuario para evitar error de Foreign Key
    const profileCheck = await authRepository.getProfile(userId);
    if (!profileCheck.data && !profileCheck.error) {
      await authRepository.updateProfile(userId, { rol: 'Cliente' }, token);
    }

    // 1. Registrar el Pago
    const paymentResult = await subscriptionRepository.createPayment(userId, {
      monto: parseFloat(monto || 200),
      metodo: metodoPago || 'Tarjeta de Crédito',
      estado: 'Completado',
      fecha: now.toISOString()
    }, token);

    if (paymentResult.error) {
      return { error: paymentResult.error };
    }

    // 2. Crear o actualizar la suscripción
    const subResult = await subscriptionRepository.createOrUpdateSubscription(userId, {
      plan: 'Premium',
      fecha_inicio: now.toISOString(),
      fecha_fin: nextMonth.toISOString(),
      estado: 'Activa'
    }, token);

    if (subResult.error) {
      return { error: subResult.error };
    }

    // 3. Cambiar el rol del usuario a Premium en la DB
    const profileUpdate = await authRepository.updateProfile(userId, { rol: 'Premium' }, token);
    if (profileUpdate.error) {
      console.warn('Advertencia: El rol no pudo actualizarse en la tabla de usuarios:', profileUpdate.error.message);
    }

    return {
      subscription: subResult.data,
      payment: paymentResult.data,
      error: null
    };
  },

  /**
   * Desactiva la renovación automática de la suscripción.
   */
  async cancelSubscription(userId, token) {
    const cancelResult = await subscriptionRepository.cancelSubscription(userId, token);
    return cancelResult;
  },

  /**
   * Obtiene el historial de pagos del usuario.
   */
  async getPaymentHistory(userId, token) {
    // getPayments returns an array directly (or []), not { data, error }
    const payments = await subscriptionRepository.getPayments(userId, token);
    return Array.isArray(payments) ? payments : [];
  }
};
