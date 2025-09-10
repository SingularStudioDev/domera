/**
 * Utilidades de validación y parsing para imágenes de proyecto
 * Complementa el ProjectImagesManager con funciones helper
 */

import { 
  ProjectImage, 
  ImagesData, 
  ImageTypeValue, 
  IMAGE_TYPE_CONFIG,
  ImageType 
} from '@/types/project-images'

/**
 * Valida si una URL es válida y accesible
 */
export function isValidImageUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Valida si un array de imágenes cumple con las reglas de negocio
 */
export function validateProjectImages(images: ProjectImage[]): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Validar URLs
  images.forEach((img, index) => {
    if (!isValidImageUrl(img.url)) {
      errors.push(`Imagen ${index + 1}: URL inválida - ${img.url}`)
    }
  })

  // Validar límites por tipo
  for (const [type, config] of Object.entries(IMAGE_TYPE_CONFIG)) {
    const typeImages = images.filter(img => img.type === type)
    
    if (typeImages.length > config.maxCount) {
      errors.push(
        `Tipo ${type}: ${typeImages.length} imágenes excede el límite de ${config.maxCount}`
      )
    }
  }

  // Validar tipos únicos
  const heroImages = images.filter(img => img.type === ImageType.HERO)
  const cardImages = images.filter(img => img.type === ImageType.CARD)

  if (heroImages.length > 1) {
    errors.push(`Solo se permite una imagen hero, encontradas ${heroImages.length}`)
  }

  if (cardImages.length > 1) {
    errors.push(`Solo se permite una imagen card, encontradas ${cardImages.length}`)
  }

  // Warnings para mejores prácticas
  if (heroImages.length === 0) {
    warnings.push('Se recomienda agregar una imagen hero para mejor presentación')
  }

  if (cardImages.length === 0) {
    warnings.push('Se recomienda agregar una imagen card para listados')
  }

  // Validar orden en tipos que lo requieren
  for (const [type, config] of Object.entries(IMAGE_TYPE_CONFIG)) {
    if (config.requiresOrder) {
      const typeImages = images.filter(img => img.type === type)
      const hasOrderIssues = typeImages.some(img => typeof img.order !== 'number')
      
      if (hasOrderIssues) {
        warnings.push(`Tipo ${type}: algunas imágenes no tienen orden definido`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Convierte datos de imágenes a formato estándar para persistencia
 */
export function normalizeImagesForStorage(imagesData: ImagesData): ProjectImage[] {
  if (!imagesData) return []

  // Array directo
  if (Array.isArray(imagesData)) {
    if (imagesData.length === 0) return []

    // Array de strings (formato legacy)
    if (imagesData.every(item => typeof item === 'string')) {
      return migrateFromLegacyArray(imagesData as string[])
    }

    // Array de objetos ProjectImage (formato nuevo)
    if (imagesData.every(item => typeof item === 'object' && 'url' in item)) {
      return imagesData as ProjectImage[]
    }
  }

  // String JSON
  if (typeof imagesData === 'string') {
    try {
      const parsed = JSON.parse(imagesData)
      return normalizeImagesForStorage(parsed)
    } catch {
      return []
    }
  }

  return []
}

/**
 * Migra array legacy de strings al nuevo formato
 */
function migrateFromLegacyArray(urls: string[]): ProjectImage[] {
  return urls
    .filter(url => url && url.trim().length > 0)
    .map((url, index) => ({
      url: url.trim(),
      type: inferTypeFromLegacyIndex(index),
      order: index,
      metadata: {
        uploadedAt: new Date().toISOString(),
        isMain: index === 1, // En el sistema legacy, índice 1 era la imagen principal
        altText: `Imagen ${index + 1}`
      }
    }))
}

/**
 * Infiere el tipo de imagen basado en el índice del sistema legacy
 */
function inferTypeFromLegacyIndex(index: number): ImageTypeValue {
  if (index === 0) return ImageType.HERO      // placeholder/hero
  if (index === 1) return ImageType.CARD      // imagen principal para cards
  return ImageType.CAROUSEL                    // resto son carousel por defecto
}

/**
 * Crea una imagen por defecto para testing o fallback
 */
export function createDefaultProjectImage(
  url: string,
  type: ImageTypeValue,
  order = 0
): ProjectImage {
  return {
    url,
    type,
    order,
    metadata: {
      uploadedAt: new Date().toISOString(),
      isMain: type === ImageType.HERO,
      altText: `Imagen ${type}`
    }
  }
}

/**
 * Verifica si los datos de imagen están en formato legacy
 */
export function isLegacyFormat(imagesData: ImagesData): boolean {
  if (!imagesData || !Array.isArray(imagesData)) return false
  if (imagesData.length === 0) return false
  
  return imagesData.every(item => typeof item === 'string')
}

/**
 * Obtiene estadísticas de un array de imágenes
 */
export function getImagesStats(images: ProjectImage[]): {
  total: number
  byType: Record<ImageTypeValue, number>
  hasHero: boolean
  hasCard: boolean
  oldestUpload?: string
  newestUpload?: string
} {
  const byType = {
    [ImageType.HERO]: 0,
    [ImageType.CARD]: 0,
    [ImageType.CAROUSEL]: 0,
    [ImageType.PROGRESS]: 0
  }

  const uploadDates = images
    .map(img => img.metadata?.uploadedAt)
    .filter(date => date)
    .sort()

  images.forEach(img => {
    byType[img.type]++
  })

  return {
    total: images.length,
    byType,
    hasHero: byType[ImageType.HERO] > 0,
    hasCard: byType[ImageType.CARD] > 0,
    oldestUpload: uploadDates[0],
    newestUpload: uploadDates[uploadDates.length - 1]
  }
}

/**
 * Filtra imágenes por múltiples criterios
 */
export function filterImages(
  images: ProjectImage[],
  filters: {
    types?: ImageTypeValue[]
    hasMetadata?: boolean
    uploadedAfter?: Date
    uploadedBefore?: Date
  }
): ProjectImage[] {
  return images.filter(img => {
    // Filtrar por tipo
    if (filters.types && !filters.types.includes(img.type)) {
      return false
    }

    // Filtrar por presencia de metadata
    if (filters.hasMetadata !== undefined) {
      const hasMetadata = img.metadata !== undefined
      if (filters.hasMetadata !== hasMetadata) {
        return false
      }
    }

    // Filtrar por fecha de subida
    if (filters.uploadedAfter || filters.uploadedBefore) {
      const uploadDate = img.metadata?.uploadedAt
      if (!uploadDate) return false

      const imgDate = new Date(uploadDate)
      
      if (filters.uploadedAfter && imgDate < filters.uploadedAfter) {
        return false
      }
      
      if (filters.uploadedBefore && imgDate > filters.uploadedBefore) {
        return false
      }
    }

    return true
  })
}