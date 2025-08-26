import { useMemo } from 'react';

/**
 * Hook genérico para parsear arrays JSON desde diferentes formatos
 * Centraliza la lógica de manejo de campos JSON array en la aplicación
 */
export const useJsonArrayParser = (
  data: string[] | string | undefined | null,
  itemValidator?: (item: any) => boolean
) => {
  const parsedArray = useMemo(() => {
    if (!data) return [];

    // Si ya es un array, filtrarlo y retornarlo
    if (Array.isArray(data)) {
      return data.filter(item => {
        if (!item) return false;
        return itemValidator ? itemValidator(item) : typeof item === 'string';
      });
    }

    // Si es string, intentar parsearlo como JSON
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => {
            if (!item) return false;
            return itemValidator ? itemValidator(item) : typeof item === 'string';
          });
        }
        // Si no es array, tratarlo como item único si es válido
        if (itemValidator ? itemValidator(parsed) : typeof parsed === 'string') {
          return [parsed];
        }
        return [];
      } catch {
        // Si falla el parsing, tratarlo como item único si es string válido
        return data.trim() ? [data] : [];
      }
    }

    return [];
  }, [data, itemValidator]);

  return {
    items: parsedArray,
    hasItems: parsedArray.length > 0,
    itemCount: parsedArray.length,
    firstItem: parsedArray[0] || null,
  };
};

/**
 * Hook específico para parsear imágenes
 */
export const useImageParser = (images: string[] | string | undefined | null) => {
  const result = useJsonArrayParser(images, (item) => 
    typeof item === 'string' && item.trim().length > 0
  );

  return {
    images: result.items,
    hasImages: result.hasItems,
    imageCount: result.itemCount,
    firstImage: result.firstItem,
  };
};

/**
 * Hook específico para parsear features
 */
export const useFeatureParser = (features: string[] | string | undefined | null) => {
  const result = useJsonArrayParser(features, (item) => 
    typeof item === 'string' && item.trim().length > 0
  );

  return {
    features: result.items,
    hasFeatures: result.hasItems,
    featureCount: result.itemCount,
    firstFeature: result.firstItem,
  };
};