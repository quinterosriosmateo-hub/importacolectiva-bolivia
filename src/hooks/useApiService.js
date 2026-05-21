import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNotification } from '@/contexts/NotificationContext';

// ─── Dev logger ───────────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development';

const LOG_STYLES = {
  request: 'background:#1a73e8;color:#fff;padding:2px 6px;border-radius:4px;font-weight:700',
  success: 'background:#188038;color:#fff;padding:2px 6px;border-radius:4px;font-weight:700',
  error:   'background:#c5221f;color:#fff;padding:2px 6px;border-radius:4px;font-weight:700',
  warn:    'background:#e37400;color:#fff;padding:2px 6px;border-radius:4px;font-weight:700',
};

function devLog(type, method, url, payload) {
  if (!isDev) return;
  const ts = new Date().toLocaleTimeString('es-BO', { hour12: false });
  const label = `[API ${method}] ${url}`;
  console.groupCollapsed(`%c${type.toUpperCase()}%c ${ts} — ${label}`, LOG_STYLES[type], 'color:inherit');
  if (payload !== undefined) console.log('Payload →', payload);
  console.trace('Stack trace');
  console.groupEnd();
}

function devLogResponse(method, url, status, data) {
  if (!isDev) return;
  const ts = new Date().toLocaleTimeString('es-BO', { hour12: false });
  const type = status >= 200 && status < 300 ? 'success' : 'error';
  console.groupCollapsed(
    `%c${type.toUpperCase()}%c ${ts} — [API ${method}] ${url} → HTTP ${status}`,
    LOG_STYLES[type],
    'color:inherit'
  );
  console.log('Response →', data);
  console.groupEnd();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * useApiService — Fetcher centralizado con:
 *  - Auth JWT automático (token de Supabase)
 *  - Estados: loading, error
 *  - Alertas opcionales por llamada
 *  - Logs de desarrollo con colores
 *
 * @example
 * const { getApiService, postApiService, loading } = useApiService();
 *
 * // GET sin alerta
 * const data = await getApiService('/api/products');
 *
 * // POST con alertas
 * await postApiService('/api/orders', body, {
 *   successMessage: '¡Pedido enviado!',
 *   errorMessage: 'No se pudo enviar el pedido.',
 * });
 */
export function useApiService() {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtiene el token JWT de la sesión activa de Supabase.
   * Retorna null si no hay sesión (útil para rutas públicas).
   */
  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return {};
    return { Authorization: `Bearer ${session.access_token}` };
  }, []);

  /**
   * Ejecuta una petición HTTP con auth + manejo de errores centralizado.
   *
   * @param {string} method
   * @param {string} url
   * @param {any} [body]
   * @param {object} [opts]
   * @param {string} [opts.successMessage]  — Si se provee, muestra un toast de éxito
   * @param {string} [opts.errorMessage]    — Si se provee, muestra un toast de error (sobrescribe el mensaje del servidor)
   * @param {number} [opts.successDuration] — Duración del toast de éxito (ms). Default: 4500
   * @param {number} [opts.errorDuration]   — Duración del toast de error (ms). Default: 6000
   * @returns {Promise<any>}               — El JSON de respuesta, o null si hubo error
   */
  const request = useCallback(async (method, url, body, opts = {}) => {
    const {
      successMessage,
      errorMessage,
      successDuration = 4500,
      errorDuration = 6000,
      requireAuth = true,
    } = opts;

    setLoading(true);
    setError(null);
    devLog('request', method, url, body);

    try {
      const authHeaders = requireAuth ? await getAuthHeaders() : {};

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // Response vacía (ej: 204 No Content)
        data = null;
      }

      devLogResponse(method, url, res.status, data);

      if (!res.ok) {
        const serverMsg = data?.error || data?.message || `Error ${res.status}`;
        const displayMsg = errorMessage ?? serverMsg;
        setError(displayMsg);
        if (errorMessage !== false) {
          notify(displayMsg, 'error', errorDuration);
        }
        return null;
      }

      if (successMessage) {
        notify(successMessage, 'success', successDuration);
      }

      return data;
    } catch (err) {
      // Red caída u otro error fatal
      const msg = errorMessage ?? 'Error de conexión. Verifica tu red.';
      setError(msg);
      notify(msg, 'error', errorDuration);
      if (isDev) {
        console.error(`[API ${method}] ${url} — Fatal:`, err);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, notify]);

  // ── Métodos públicos ──────────────────────────────────────────────────────
  const getApiService = useCallback((url, opts)        => request('GET',    url, undefined, opts), [request]);
  const postApiService = useCallback((url, body, opts)  => request('POST',   url, body,      opts), [request]);
  const putApiService = useCallback((url, body, opts)   => request('PUT',    url, body,      opts), [request]);
  const patchApiService = useCallback((url, body, opts) => request('PATCH',  url, body,      opts), [request]);
  const deleteApiService = useCallback((url, opts)     => request('DELETE', url, undefined, opts), [request]);

  return { getApiService, postApiService, putApiService, patchApiService, deleteApiService, loading, error };
}
