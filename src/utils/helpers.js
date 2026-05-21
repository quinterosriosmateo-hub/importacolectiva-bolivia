/**
 * Helper functions for styling and formatting across the application
 */

/**
 * Returns the color scheme for a role chip
 * @param {string} rol 
 * @returns {'error' | 'secondary' | 'info' | 'warning' | 'default'}
 */
export const getRoleChipColor = (rol) => {
  switch (rol) {
    case 'Administrador': return 'error';
    case 'Premium': return 'secondary';
    case 'Asesor': return 'info';
    case 'Proveedor/Agente': return 'warning';
    default: return 'default';
  }
};

/**
 * Returns the color scheme for a status chip
 * @param {string} estado 
 * @returns {'success' | 'warning' | 'error' | 'default'}
 */
export const getEstadoChipColor = (estado) => {
  switch (estado || 'activo') {
    case 'activo': return 'success';
    case 'suspendido': return 'warning';
    case 'baneado': return 'error';
    default: return 'default';
  }
};
