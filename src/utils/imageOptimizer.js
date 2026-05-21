/**
 * Utilities for client-side image optimization, cropping, and compression.
 */

/**
 * Automatically crops an image to a 1:1 square from the center and resizes it to optimized dimensions.
 * Compresses the output as JPEG with configurable quality.
 * 
 * @param {File} file - The source image file from input
 * @param {number} [targetSize=300] - The output width and height in pixels
 * @param {number} [quality=0.85] - The output JPEG quality (0.0 to 1.0)
 * @returns {Promise<Blob>} - Resolves to the optimized JPEG Blob
 */
export function optimizeAndCropAvatar(file, targetSize = 300, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('El archivo seleccionado no es una imagen válida.'));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          return reject(new Error('No se pudo inicializar el contexto de Canvas 2D.'));
        }

        const originalWidth = img.width;
        const originalHeight = img.height;

        // Determinar dimensiones para un recorte cuadrado perfecto desde el centro
        const minSize = Math.min(originalWidth, originalHeight);
        const sourceX = (originalWidth - minSize) / 2;
        const sourceY = (originalHeight - minSize) / 2;

        // Configurar dimensiones finales del canvas
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Activar suavizado de imagen de alta calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Dibujar el recorte centrado y redimensionado en el canvas
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          minSize,
          minSize,
          0,
          0,
          targetSize,
          targetSize
        );

        // Convertir el canvas a Blob JPEG optimizado
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al generar el Blob de imagen optimizada.'));
            }
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Error al cargar la imagen. El archivo podría estar corrupto.'));
    };

    img.src = objectUrl;
  });
}
