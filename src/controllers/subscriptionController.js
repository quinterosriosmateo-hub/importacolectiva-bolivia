import { subscriptionService } from '@/services/subscriptionService';

export const subscriptionController = {
  /**
   * Obtiene la suscripción del usuario autenticado.
   */
  async getSubscription(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }

    if (!req.user) {
      return res.status(401).json({ code: 1, error: 'No autorizado: no hay sesión activa.' });
    }

    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const subscription = await subscriptionService.getSubscription(req.user.id, req.token);
      return res.status(200).json({ code: 0, subscription, debug_user_id: req.user.id });
    } catch (err) {
      console.error('[subscriptionController.getSubscription] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error interno al obtener la suscripción.', details: err.message });
    }
  },

  /**
   * Procesa la compra de una suscripción premium.
   */
  async subscribe(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }

    if (!req.user) {
      return res.status(401).json({ code: 1, error: 'No autorizado: no hay sesión activa.' });
    }

    const { plan, metodoPago, monto } = req.body;

    try {
      const { subscription, payment, error } = await subscriptionService.subscribe(
        req.user.id,
        { plan, metodoPago, monto },
        req.token
      );

      if (error) {
        return res.status(400).json({ code: 1, error: error.message });
      }

      return res.status(200).json({
        code: 0,
        message: '¡Te has suscrito con éxito al Plan Premium!',
        subscription,
        payment
      });
    } catch (err) {
      console.error('[subscriptionController.subscribe] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error interno al procesar la suscripción.' });
    }
  },

  /**
   * Cancela la renovación automática de la suscripción.
   */
  async cancelSubscription(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }

    if (!req.user) {
      return res.status(401).json({ code: 1, error: 'No autorizado: no hay sesión activa.' });
    }

    try {
      const { data, error } = await subscriptionService.cancelSubscription(req.user.id, req.token);

      if (error) {
        return res.status(400).json({ code: 1, error: error.message });
      }

      return res.status(200).json({
        code: 0,
        message: 'La renovación automática ha sido desactivada.',
        subscription: data
      });
    } catch (err) {
      console.error('[subscriptionController.cancelSubscription] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error interno al cancelar la renovación.' });
    }
  },

  /**
   * Obtiene el historial de pagos del usuario.
   */
  async getPaymentHistory(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }

    if (!req.user) {
      return res.status(401).json({ code: 1, error: 'No autorizado: no hay sesión activa.' });
    }

    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const history = await subscriptionService.getPaymentHistory(req.user.id, req.token);
      return res.status(200).json({ code: 0, history });
    } catch (err) {
      console.error('[subscriptionController.getPaymentHistory] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error interno al obtener el historial de pagos.' });
    }
  }
};
