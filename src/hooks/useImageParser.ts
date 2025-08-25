import { useMemo } from 'react';

/**
 * Hook para parsear imágenes desde diferentes formatos
 * Centraliza la lógica de manejo de imágenes en la aplicación
 */
export const useImageParser = (images: string[] | string | undefined | null) => {
  const parsedImages = useMemo(() => {
    if (!images) return [];

    // Si ya es un array, retornarlo
    if (Array.isArray(images)) {
      return images.filter(img => img && typeof img === 'string');
    }

    // Si es string, intentar parsearlo como JSON
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) {
          return parsed.filter(img => img && typeof img === 'string');
        }
        // Si no es array, tratarlo como URL única
        return [images];
      } catch {
        // Si falla el parsing, tratarlo como URL única
        return [images];
      }
    }

    return [];
  }, [images]);

  return {
    images: parsedImages,
    hasImages: parsedImages.length > 0,
    imageCount: parsedImages.length,
    firstImage: parsedImages[0] || null,
  };
};