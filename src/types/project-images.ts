/**
 * Tipos para el nuevo sistema de gestión de imágenes de proyectos
 * Mantiene compatibilidad con el sistema legacy de arrays de strings
 */

export interface ProjectImageMetadata {
  caption?: string
  altText?: string
  uploadedAt?: string
  isMain?: boolean
}

export interface ProjectImage {
  url: string
  type: 'hero' | 'card' | 'carousel' | 'progress'
  order?: number
  metadata?: ProjectImageMetadata
}

// Tipos para compatibilidad hacia atrás
export type LegacyImagesArray = string[]
export type ProjectImagesArray = ProjectImage[]

// Tipo union para soportar ambos formatos durante la transición
export type ImagesData = ProjectImagesArray | LegacyImagesArray | string | null | undefined

// Enums para mayor type safety
export const ImageType = {
  HERO: 'hero',
  CARD: 'card', 
  CAROUSEL: 'carousel',
  PROGRESS: 'progress'
} as const

export type ImageTypeValue = typeof ImageType[keyof typeof ImageType]

// Resultado de operaciones de parsing
export interface ImageParsingResult {
  images: ProjectImage[]
  isLegacyFormat: boolean
  hasErrors: boolean
  errors: string[]
}

// Configuración de validación por tipo de imagen
export interface ImageTypeConfig {
  maxCount: number
  requiresOrder: boolean
  allowMultiple: boolean
  description: string
}

export const IMAGE_TYPE_CONFIG: Record<ImageTypeValue, ImageTypeConfig> = {
  [ImageType.HERO]: {
    maxCount: 1,
    requiresOrder: false,
    allowMultiple: false,
    description: 'Imagen principal del proyecto (hero section)'
  },
  [ImageType.CARD]: {
    maxCount: 1,
    requiresOrder: false,
    allowMultiple: false,
    description: 'Imagen para tarjetas de proyecto en listados'
  },
  [ImageType.CAROUSEL]: {
    maxCount: 10,
    requiresOrder: true,
    allowMultiple: true,
    description: 'Imágenes del carrusel de galería'
  },
  [ImageType.PROGRESS]: {
    maxCount: 50,
    requiresOrder: true,
    allowMultiple: true,
    description: 'Imágenes de avances de obra'
  }
}