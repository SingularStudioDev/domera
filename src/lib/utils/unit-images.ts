/**
 * UnitImagesManager - Gestor de imágenes de unidades con soporte para metadatos
 * Basado en el patrón de ProjectImagesManager pero adaptado para unidades
 */

import { 
  UnitImage, 
  LegacyUnitImagesArray,
  UnitImagesData,
  UnitImageParsingResult,
  UnitImageType,
  UnitImageTypeValue,
  UNIT_IMAGE_TYPE_CONFIG
} from '@/types/unit-images'

export class UnitImagesManager {
  private images: UnitImage[]
  private readonly isLegacyFormat: boolean

  constructor(imagesData: UnitImagesData) {
    const parseResult = this.parseImages(imagesData)
    this.images = parseResult.images
    this.isLegacyFormat = parseResult.isLegacyFormat
  }

  // ========================================
  // MÉTODOS DE ACCESO (GETTERS)
  // ========================================

  /**
   * Obtiene todas las imágenes del array
   */
  getAllImages(): UnitImage[] {
    return [...this.images]
  }

  /**
   * Obtiene imágenes por tipo específico, ordenadas
   */
  getImagesByType(type: UnitImageTypeValue): UnitImage[] {
    return this.images
      .filter(img => img.type === type)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  /**
   * Obtiene la imagen principal de la unidad
   */
  getMainImage(): UnitImage | undefined {
    return this.images.find(img => img.type === UnitImageType.MAIN)
  }

  /**
   * Obtiene imágenes de la galería ordenadas
   */
  getGalleryImages(): UnitImage[] {
    return this.getImagesByType(UnitImageType.GALLERY)
  }

  /**
   * Obtiene la imagen a mostrar como principal (fallback hierarchy)
   * Prioridad: main > primera de galería > primera disponible
   */
  getDisplayImage(): UnitImage | undefined {
    return this.getMainImage() || 
           this.getGalleryImages()[0] || 
           this.images[0]
  }

  // ========================================
  // MÉTODOS DE MANIPULACIÓN
  // ========================================

  /**
   * Agrega una nueva imagen con tipo específico
   */
  addImage(
    url: string, 
    type: UnitImageTypeValue, 
    order?: number,
    metadata?: UnitImage['metadata']
  ): UnitImagesManager {
    // Validar límites por tipo
    const currentCount = this.getImageCount(type)
    const config = UNIT_IMAGE_TYPE_CONFIG[type]
    
    if (currentCount >= config.maxCount) {
      throw new Error(`Máximo ${config.maxCount} imágenes permitidas para tipo ${type}`)
    }

    // Validar que no se agreguen duplicados para tipos únicos
    if (!config.allowMultiple && currentCount > 0) {
      throw new Error(`Solo se permite una imagen para tipo ${type}`)
    }

    const newImage: UnitImage = {
      url,
      type,
      order: order ?? this.getNextOrder(type),
      metadata: {
        uploadedAt: new Date().toISOString(),
        isMain: type === UnitImageType.MAIN,
        ...metadata
      }
    }

    const newImages = [...this.images, newImage]
    return new UnitImagesManager(newImages)
  }

  /**
   * Remueve imagen por URL y opcionalmente por tipo
   */
  removeImage(url: string, type?: UnitImageTypeValue): UnitImagesManager {
    const filteredImages = this.images.filter(img => {
      if (img.url !== url) return true
      if (type && img.type !== type) return true
      return false
    })

    return new UnitImagesManager(filteredImages)
  }

  /**
   * Reordena imágenes de un tipo específico
   */
  reorderImages(type: UnitImageTypeValue, urlsInNewOrder: string[]): UnitImagesManager {
    const otherImages = this.images.filter(img => img.type !== type)
    const imagesToReorder = this.images.filter(img => img.type === type)

    const reorderedImages: UnitImage[] = []
    urlsInNewOrder.forEach((url, newIndex) => {
      const img = imagesToReorder.find(i => i.url === url)
      if (img) {
        reorderedImages.push({ ...img, order: newIndex })
      }
    })

    return new UnitImagesManager([...otherImages, ...reorderedImages])
  }

  /**
   * Establece una imagen como principal para su tipo
   */
  setMainImage(url: string): UnitImagesManager {
    // Para unidades, solo podemos tener una imagen main
    // Si ya existe una main, la reemplazamos
    const filteredImages = this.images.filter(img => img.type !== UnitImageType.MAIN)
    const targetImage = this.images.find(img => img.url === url)
    
    if (!targetImage) {
      throw new Error('Imagen no encontrada')
    }

    const newMainImage: UnitImage = {
      ...targetImage,
      type: UnitImageType.MAIN,
      order: 0,
      metadata: {
        ...targetImage.metadata,
        isMain: true
      }
    }

    return new UnitImagesManager([...filteredImages, newMainImage])
  }

  // ========================================
  // MÉTODOS DE VALIDACIÓN Y CONSULTA
  // ========================================

  /**
   * Verifica si tiene imagen principal
   */
  hasMainImage(): boolean {
    return this.images.some(img => img.type === UnitImageType.MAIN)
  }

  /**
   * Verifica si tiene imágenes de galería
   */
  hasGalleryImages(): boolean {
    return this.images.some(img => img.type === UnitImageType.GALLERY)
  }

  /**
   * Obtiene el conteo de imágenes por tipo
   */
  getImageCount(type?: UnitImageTypeValue): number {
    return type 
      ? this.images.filter(img => img.type === type).length 
      : this.images.length
  }

  /**
   * Valida la estructura actual de imágenes
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const [type, config] of Object.entries(UNIT_IMAGE_TYPE_CONFIG)) {
      const count = this.getImageCount(type as UnitImageTypeValue)
      
      if (count > config.maxCount) {
        errors.push(`Tipo ${type}: ${count} imágenes excede el límite de ${config.maxCount}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Convierte a array serializable para la base de datos
   */
  toArray(): UnitImage[] {
    return this.getAllImages()
  }

  /**
   * Convierte a array de strings para compatibilidad con sistema legacy
   */
  toLegacyStringArray(): string[] {
    const urls: string[] = []
    
    // Agregar imagen principal primero si existe
    const mainImage = this.getMainImage()
    if (mainImage) {
      urls.push(mainImage.url)
    }
    
    // Agregar imágenes de galería
    const galleryImages = this.getGalleryImages()
    galleryImages.forEach(img => urls.push(img.url))
    
    return urls
  }

  /**
   * Indica si los datos provienen del formato legacy
   */
  isFromLegacyFormat(): boolean {
    return this.isLegacyFormat
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  /**
   * Parsea datos de imágenes desde múltiples formatos
   */
  private parseImages(data: UnitImagesData): UnitImageParsingResult {
    const result: UnitImageParsingResult = {
      images: [],
      isLegacyFormat: false,
      hasErrors: false,
      errors: []
    }

    try {
      // Null/undefined
      if (!data) {
        return result
      }

      // Array directo
      if (Array.isArray(data)) {
        if (data.length === 0) {
          return result
        }

        // Array de strings (formato legacy)
        if (data.every(item => typeof item === 'string')) {
          result.images = this.migrateFromLegacyArray(data as LegacyUnitImagesArray)
          result.isLegacyFormat = true
          return result
        }

        // Array de objetos UnitImage (formato nuevo)
        if (data.every(item => typeof item === 'object' && 'url' in item)) {
          result.images = data as UnitImage[]
          return result
        }

        result.hasErrors = true
        result.errors.push('Array contiene tipos de datos inconsistentes')
        return result
      }

      // String JSON
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data)
          return this.parseImages(parsed)
        } catch {
          result.hasErrors = true
          result.errors.push('String JSON inválido')
          return result
        }
      }

      result.hasErrors = true
      result.errors.push(`Tipo de dato no soportado: ${typeof data}`)
      return result

    } catch (error) {
      result.hasErrors = true
      result.errors.push(`Error durante el parsing: ${error}`)
      return result
    }
  }

  /**
   * Migra desde array legacy de strings al nuevo formato
   */
  private migrateFromLegacyArray(urls: LegacyUnitImagesArray): UnitImage[] {
    return urls
      .filter(url => url && url.trim().length > 0)
      .map((url, index) => ({
        url: url.trim(),
        type: index === 0 ? UnitImageType.MAIN : UnitImageType.GALLERY,
        order: index === 0 ? 0 : index - 1, // Gallery images start from 0
        metadata: {
          uploadedAt: new Date().toISOString(),
          isMain: index === 0,
          altText: index === 0 ? 'Imagen principal de la unidad' : `Imagen de galería ${index}`
        }
      }))
  }

  /**
   * Obtiene el siguiente número de orden para un tipo específico
   */
  private getNextOrder(type: UnitImageTypeValue): number {
    const existingImages = this.getImagesByType(type)
    if (existingImages.length === 0) return 0
    
    const maxOrder = Math.max(...existingImages.map(img => img.order || 0))
    return maxOrder + 1
  }
}