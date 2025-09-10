/**
 * ProjectImagesManager - Gestor de imágenes de proyecto con compatibilidad hacia atrás
 * Fase 1: Implementación con soporte para arrays legacy de strings
 */

import { 
  ProjectImage, 
  ProjectImagesArray, 
  LegacyImagesArray,
  ImagesData,
  ImageParsingResult,
  ImageType,
  ImageTypeValue,
  IMAGE_TYPE_CONFIG
} from '@/types/project-images'

export class ProjectImagesManager {
  private images: ProjectImage[]
  private readonly isLegacyFormat: boolean

  constructor(imagesData: ImagesData) {
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
  getAllImages(): ProjectImage[] {
    return [...this.images]
  }

  /**
   * Obtiene imágenes por tipo específico, ordenadas
   */
  getImagesByType(type: ImageTypeValue): ProjectImage[] {
    return this.images
      .filter(img => img.type === type)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  /**
   * Obtiene la imagen hero del proyecto
   */
  getHeroImage(): ProjectImage | undefined {
    return this.images.find(img => img.type === ImageType.HERO)
  }

  /**
   * Obtiene la imagen para tarjetas de proyecto
   */
  getCardImage(): ProjectImage | undefined {
    return this.images.find(img => img.type === ImageType.CARD)
  }

  /**
   * Obtiene imágenes del carrusel ordenadas
   */
  getCarouselImages(): ProjectImage[] {
    return this.getImagesByType(ImageType.CAROUSEL)
  }

  /**
   * Obtiene imágenes de avances de obra ordenadas
   */
  getProgressImages(): ProjectImage[] {
    return this.getImagesByType(ImageType.PROGRESS)
  }

  /**
   * Obtiene la imagen principal del proyecto (fallback hierarchy)
   * Prioridad: hero > card > primera disponible (SIN mezclar con carousel)
   * NOTA: Hero y carousel son completamente distintos
   */
  getMainImage(): ProjectImage | undefined {
    return this.getHeroImage() || 
           this.getCardImage() || 
           this.images.find(img => img.metadata?.isMain) ||
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
    type: ImageTypeValue, 
    order?: number,
    metadata?: ProjectImage['metadata']
  ): ProjectImagesManager {
    // Validar límites por tipo
    const currentCount = this.getImageCount(type)
    const config = IMAGE_TYPE_CONFIG[type]
    
    if (currentCount >= config.maxCount) {
      throw new Error(`Máximo ${config.maxCount} imágenes permitidas para tipo ${type}`)
    }

    // Validar que no se agreguen duplicados para tipos únicos
    if (!config.allowMultiple && currentCount > 0) {
      throw new Error(`Solo se permite una imagen para tipo ${type}`)
    }

    const newImage: ProjectImage = {
      url,
      type,
      order: order ?? this.getNextOrder(type),
      metadata: {
        uploadedAt: new Date().toISOString(),
        isMain: type === ImageType.HERO && !this.hasHeroImage(),
        ...metadata
      }
    }

    const newImages = [...this.images, newImage]
    return new ProjectImagesManager(newImages)
  }

  /**
   * Remueve imagen por URL y opcionalmente por tipo
   */
  removeImage(url: string, type?: ImageTypeValue): ProjectImagesManager {
    const filteredImages = this.images.filter(img => {
      if (img.url !== url) return true
      if (type && img.type !== type) return true
      return false
    })

    return new ProjectImagesManager(filteredImages)
  }

  /**
   * Reordena imágenes de un tipo específico
   */
  reorderImages(type: ImageTypeValue, urlsInNewOrder: string[]): ProjectImagesManager {
    const otherImages = this.images.filter(img => img.type !== type)
    const imagesToReorder = this.images.filter(img => img.type === type)

    const reorderedImages = urlsInNewOrder
      .map((url, newIndex) => {
        const img = imagesToReorder.find(i => i.url === url)
        return img ? { ...img, order: newIndex } : null
      })
      .filter((img): img is ProjectImage => img !== null)

    return new ProjectImagesManager([...otherImages, ...reorderedImages])
  }

  /**
   * Establece una imagen como principal para su tipo
   */
  setMainImage(url: string, type: ImageTypeValue): ProjectImagesManager {
    const updatedImages = this.images.map(img => ({
      ...img,
      metadata: {
        ...img.metadata,
        isMain: img.url === url && img.type === type
      }
    }))

    return new ProjectImagesManager(updatedImages)
  }

  // ========================================
  // MÉTODOS DE VALIDACIÓN Y CONSULTA
  // ========================================

  /**
   * Verifica si tiene imagen hero
   */
  hasHeroImage(): boolean {
    return this.images.some(img => img.type === ImageType.HERO)
  }

  /**
   * Verifica si tiene imagen para card
   */
  hasCardImage(): boolean {
    return this.images.some(img => img.type === ImageType.CARD)
  }

  /**
   * Obtiene el conteo de imágenes por tipo
   */
  getImageCount(type?: ImageTypeValue): number {
    return type 
      ? this.images.filter(img => img.type === type).length 
      : this.images.length
  }

  /**
   * Valida la estructura actual de imágenes
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const [type, config] of Object.entries(IMAGE_TYPE_CONFIG)) {
      const count = this.getImageCount(type as ImageTypeValue)
      
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
  toArray(): ProjectImage[] {
    return this.getAllImages()
  }

  /**
   * Convierte a array de strings para compatibilidad con sistema legacy
   * TEMPORARY: Para uso durante transición hasta que BD soporte ProjectImage[]
   */
  toLegacyStringArray(): string[] {
    // For now, return all URLs in a specific order for compatibility
    const urls: string[] = []
    
    // Add placeholder if hero exists (to maintain index 0)
    const heroImage = this.getHeroImage()
    if (heroImage) {
      urls.push(heroImage.url)
    }
    
    // Add card image at index 1 (legacy main image position)
    const cardImage = this.getCardImage()
    if (cardImage) {
      // If no hero, add empty placeholder at index 0
      if (!heroImage) {
        urls.push('')
      }
      urls.push(cardImage.url)
    }
    
    // Add carousel images starting from index 2
    const carouselImages = this.getCarouselImages()
    carouselImages.forEach(img => urls.push(img.url))
    
    // Add progress images at the end
    const progressImages = this.getProgressImages()
    progressImages.forEach(img => urls.push(img.url))
    
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
  private parseImages(data: ImagesData): ImageParsingResult {
    const result: ImageParsingResult = {
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
          result.images = this.migrateFromLegacyArray(data as LegacyImagesArray)
          result.isLegacyFormat = true
          return result
        }

        // Array de objetos ProjectImage (formato nuevo)
        if (data.every(item => typeof item === 'object' && 'url' in item)) {
          result.images = data as ProjectImage[]
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
   * Mantiene la lógica actual de índices durante la transición
   */
  private migrateFromLegacyArray(urls: LegacyImagesArray): ProjectImage[] {
    return urls
      .filter(url => url && url.trim().length > 0)
      .map((url, index) => ({
        url: url.trim(),
        type: this.inferTypeFromLegacyIndex(index),
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
   * NUEVA LÓGICA: Distinguir correctamente entre hero y carousel
   * - índice 0: HERO (imagen principal para hero section)
   * - índice 1: CARD (imagen para tarjetas)
   * - índices 2+: CAROUSEL (galería de imágenes)
   */
  private inferTypeFromLegacyIndex(index: number): ImageTypeValue {
    if (index === 0) return ImageType.HERO       // Primera imagen es HERO
    if (index === 1) return ImageType.CARD       // Segunda imagen es CARD
    return ImageType.CAROUSEL                    // Resto son CAROUSEL
  }

  /**
   * Obtiene el siguiente número de orden para un tipo específico
   */
  private getNextOrder(type: ImageTypeValue): number {
    const existingImages = this.getImagesByType(type)
    if (existingImages.length === 0) return 0
    
    const maxOrder = Math.max(...existingImages.map(img => img.order || 0))
    return maxOrder + 1
  }
}