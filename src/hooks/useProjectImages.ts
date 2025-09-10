/**
 * Hook para manejo de imágenes de proyecto con compatibilidad hacia atrás
 * Provee una interfaz limpia para acceder a imágenes categorizadas
 */

import { useMemo } from 'react'
import { ProjectImagesManager } from '@/lib/utils/project-images'
import { 
  ProjectImage, 
  ImagesData, 
  ImageTypeValue,
  ImageType 
} from '@/types/project-images'

export interface UseProjectImagesReturn {
  // Imágenes por tipo
  heroImage: ProjectImage | undefined
  cardImage: ProjectImage | undefined
  carouselImages: ProjectImage[]
  progressImages: ProjectImage[]
  
  // Imagen principal con fallback
  mainImage: ProjectImage | undefined
  
  // Funciones utilitarias
  getAllImages: () => ProjectImage[]
  getImagesByType: (type: ImageTypeValue) => ProjectImage[]
  getImageCount: (type?: ImageTypeValue) => number
  
  // Estado y metadatos
  hasImages: boolean
  hasHeroImage: boolean
  hasCardImage: boolean
  isLegacyFormat: boolean
  
  // Manager para operaciones avanzadas (opcional)
  manager: ProjectImagesManager
}

/**
 * Hook principal para manejo de imágenes de proyecto
 * Mantiene compatibilidad con arrays legacy de strings
 */
export function useProjectImages(imagesData: ImagesData): UseProjectImagesReturn {
  return useMemo(() => {
    const manager = new ProjectImagesManager(imagesData)
    
    // Imágenes categorizadas
    const heroImage = manager.getHeroImage()
    const cardImage = manager.getCardImage()
    const carouselImages = manager.getCarouselImages()
    const progressImages = manager.getProgressImages()
    const mainImage = manager.getMainImage()
    
    // Estados derivados
    const allImages = manager.getAllImages()
    const hasImages = allImages.length > 0
    const hasHeroImage = manager.hasHeroImage()
    const hasCardImage = manager.hasCardImage()
    const isLegacyFormat = manager.isFromLegacyFormat()
    
    return {
      // Imágenes por tipo
      heroImage,
      cardImage,
      carouselImages,
      progressImages,
      mainImage,
      
      // Funciones utilitarias
      getAllImages: () => manager.getAllImages(),
      getImagesByType: (type: ImageTypeValue) => manager.getImagesByType(type),
      getImageCount: (type?: ImageTypeValue) => manager.getImageCount(type),
      
      // Estado y metadatos
      hasImages,
      hasHeroImage,
      hasCardImage,
      isLegacyFormat,
      
      // Manager para operaciones avanzadas
      manager
    }
  }, [imagesData])
}

/**
 * Hook especializado para obtener la imagen de display en tarjetas
 * Implementa la lógica de fallback: card > hero > main > primera disponible
 */
export function useProjectCardImage(imagesData: ImagesData): {
  imageUrl: string | undefined
  image: ProjectImage | undefined
  fallbackUsed: 'card' | 'hero' | 'main' | 'first' | 'none'
} {
  return useMemo(() => {
    const manager = new ProjectImagesManager(imagesData)
    
    const cardImage = manager.getCardImage()
    if (cardImage) {
      return {
        imageUrl: cardImage.url,
        image: cardImage,
        fallbackUsed: 'card'
      }
    }
    
    const heroImage = manager.getHeroImage()
    if (heroImage) {
      return {
        imageUrl: heroImage.url,
        image: heroImage,
        fallbackUsed: 'hero'
      }
    }
    
    const mainImage = manager.getMainImage()
    if (mainImage) {
      return {
        imageUrl: mainImage.url,
        image: mainImage,
        fallbackUsed: 'main'
      }
    }
    
    const firstImage = manager.getAllImages()[0]
    if (firstImage) {
      return {
        imageUrl: firstImage.url,
        image: firstImage,
        fallbackUsed: 'first'
      }
    }
    
    return {
      imageUrl: undefined,
      image: undefined,
      fallbackUsed: 'none'
    }
  }, [imagesData])
}

/**
 * Hook especializado para obtener la imagen hero del proyecto
 * Con fallback inteligente para hero section
 */
export function useProjectHeroImage(imagesData: ImagesData): {
  imageUrl: string | undefined
  image: ProjectImage | undefined
  fallbackUsed: 'hero' | 'card' | 'main' | 'first' | 'none'
} {
  return useMemo(() => {
    const manager = new ProjectImagesManager(imagesData)
    
    const heroImage = manager.getHeroImage()
    if (heroImage) {
      return {
        imageUrl: heroImage.url,
        image: heroImage,
        fallbackUsed: 'hero'
      }
    }
    
    const cardImage = manager.getCardImage()
    if (cardImage) {
      return {
        imageUrl: cardImage.url,
        image: cardImage,
        fallbackUsed: 'card'
      }
    }
    
    const mainImage = manager.getMainImage()
    if (mainImage) {
      return {
        imageUrl: mainImage.url,
        image: mainImage,
        fallbackUsed: 'main'
      }
    }
    
    const firstImage = manager.getAllImages()[0]
    if (firstImage) {
      return {
        imageUrl: firstImage.url,
        image: firstImage,
        fallbackUsed: 'first'
      }
    }
    
    return {
      imageUrl: undefined,
      image: undefined,
      fallbackUsed: 'none'
    }
  }, [imagesData])
}

/**
 * Hook para obtener imágenes de carrusel con metadatos adicionales
 */
export function useProjectCarouselImages(imagesData: ImagesData): {
  images: ProjectImage[]
  count: number
  hasImages: boolean
  getImageAtIndex: (index: number) => ProjectImage | undefined
} {
  return useMemo(() => {
    const manager = new ProjectImagesManager(imagesData)
    const carouselImages = manager.getCarouselImages()
    
    return {
      images: carouselImages,
      count: carouselImages.length,
      hasImages: carouselImages.length > 0,
      getImageAtIndex: (index: number) => carouselImages[index]
    }
  }, [imagesData])
}

/**
 * Hook para obtener imágenes de progreso con funcionalidades específicas
 */
export function useProjectProgressImages(imagesData: ImagesData): {
  images: ProjectImage[]
  count: number
  hasImages: boolean
  imagesByDate: ProjectImage[]
  getLatestImage: () => ProjectImage | undefined
} {
  return useMemo(() => {
    const manager = new ProjectImagesManager(imagesData)
    const progressImages = manager.getProgressImages()
    
    // Ordenar por fecha de subida (más recientes primero)
    const imagesByDate = progressImages
      .filter(img => img.metadata?.uploadedAt)
      .sort((a, b) => {
        const dateA = new Date(a.metadata!.uploadedAt!).getTime()
        const dateB = new Date(b.metadata!.uploadedAt!).getTime()
        return dateB - dateA // Más recientes primero
      })
    
    return {
      images: progressImages,
      count: progressImages.length,
      hasImages: progressImages.length > 0,
      imagesByDate,
      getLatestImage: () => imagesByDate[0]
    }
  }, [imagesData])
}