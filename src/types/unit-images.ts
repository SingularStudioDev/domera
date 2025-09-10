/**
 * Tipos para el sistema de gestión de imágenes de unidades
 * Basado en el sistema de imágenes de proyectos pero adaptado para unidades
 */

export interface UnitImageMetadata {
  caption?: string
  altText?: string
  uploadedAt?: string
  isMain?: boolean
}

export interface UnitImage {
  url: string
  type: 'main' | 'gallery'
  order?: number
  metadata?: UnitImageMetadata
}

// Tipos para compatibilidad hacia atrás
export type LegacyUnitImagesArray = string[]

// Tipo union para soportar ambos formatos durante la transición
export type UnitImagesData = UnitImage[] | LegacyUnitImagesArray | string | null | undefined

// Enums para mayor type safety
export const UnitImageType = {
  MAIN: 'main',
  GALLERY: 'gallery'
} as const

export type UnitImageTypeValue = typeof UnitImageType[keyof typeof UnitImageType]

// Resultado de operaciones de parsing
export interface UnitImageParsingResult {
  images: UnitImage[]
  isLegacyFormat: boolean
  hasErrors: boolean
  errors: string[]
}

// Configuración de validación por tipo de imagen
export interface UnitImageTypeConfig {
  maxCount: number
  requiresOrder: boolean
  allowMultiple: boolean
  description: string
}

export const UNIT_IMAGE_TYPE_CONFIG: Record<UnitImageTypeValue, UnitImageTypeConfig> = {
  [UnitImageType.MAIN]: {
    maxCount: 1,
    requiresOrder: false,
    allowMultiple: false,
    description: 'Imagen principal de la unidad'
  },
  [UnitImageType.GALLERY]: {
    maxCount: 20,
    requiresOrder: true,
    allowMultiple: true,
    description: 'Imágenes de la galería de la unidad'
  }
}