import { supabase } from '@/lib/supabaseClient';

export const reventaService = {
  /**
   * Ejecuta el proceso de búsqueda de participantes que no pagaron el Hito 2 (Aduana)
   * después de un periodo de gracia (ej. 72 horas).
   * Mueve esa mercancía a "Abandono" y la publica automáticamente para reventa.
   * 
   * NOTA: Esto normalmente se llama desde un Cron Job diario o al disparar un evento webhook.
   */
  async procesarAbandonosAduana() {
    try {
      console.log('[ReventaService] Iniciando procesamiento de abandonos de aduana...');
      
      // 1. Buscar participantes con hito_actual = 2 y estado_pago = 'Pendiente'
      // En la vida real, se filtra también por fecha de vencimiento (ej. fecha_eta + 3 días)
      const { data: morosos, error } = await supabase
        .from('participante_compra')
        .select(`
          id,
          usuario_id,
          compra_grupal_id,
          monto,
          compra_grupal (
            producto_id
          )
        `)
        .eq('hito_actual', 2)
        .eq('estado_pago', 'Pendiente');

      if (error) throw error;
      if (!morosos || morosos.length === 0) {
        console.log('[ReventaService] No hay abandonos pendientes.');
        return { success: true, procesados: 0 };
      }

      let procesados = 0;

      // 2. Por cada moroso, pasarlo a abandono y crear registro de reventa
      for (const participante of morosos) {
        // A. Actualizar estado del participante a "Abandonado"
        await supabase
          .from('participante_compra')
          .update({ estado_aduanas: 'Abandonado', estado_pago: 'Cancelado' })
          .eq('id', participante.id);

        // B. Crear el registro en la tabla de reventa para que aparezca en el Marketplace
        const productoId = participante.compra_grupal?.producto_id;
        
        if (productoId) {
          await supabase
            .from('reventa')
            .insert({
              producto_id: productoId,
              precio: participante.monto, // Precio de oportunidad = monto adeudado
              motivo: 'Abandono Aduanero (Falta de Pago Hito 2)',
              estado: 'Disponible'
            });
          procesados++;
        }
      }

      console.log(`[ReventaService] Se procesaron ${procesados} abandonos.`);
      return { success: true, procesados };
    } catch (error) {
      console.error('[ReventaService] Error procesando abandonos:', error);
      return { error: new Error('Fallo al procesar reventas automáticas') };
    }
  }
};
