/**
 * Tests de compatibilidad para ProjectImagesManager
 * Verifica que el sistema funcione con datos existentes
 */

import { ProjectImagesManager } from '../project-images'
import { ImageType } from '@/types/project-images'

describe('ProjectImagesManager - Compatibility Tests', () => {
  // Datos de prueba simulando el sistema actual
  const legacyArrayData = [
    'https://example.com/placeholder.jpg',     // índice 0 - placeholder
    'https://example.com/main-image.jpg',      // índice 1 - imagen principal
    'https://example.com/carousel-1.jpg',      // índice 2 - carrusel
    'https://example.com/carousel-2.jpg',      // índice 3 - carrusel
    'https://example.com/carousel-3.jpg'       // índice 4 - carrusel
  ]

  const legacyJsonString = JSON.stringify(legacyArrayData)

  describe('Legacy Format Migration', () => {
    test('should migrate string array to new format', () => {
      const manager = new ProjectImagesManager(legacyArrayData)
      
      expect(manager.isFromLegacyFormat()).toBe(true)
      expect(manager.getImageCount()).toBe(5)
      
      // Verificar migración de tipos
      expect(manager.getHeroImage()?.url).toBe('https://example.com/placeholder.jpg')
      expect(manager.getCardImage()?.url).toBe('https://example.com/main-image.jpg')
      expect(manager.getCarouselImages()).toHaveLength(3)
    })

    test('should migrate JSON string to new format', () => {
      const manager = new ProjectImagesManager(legacyJsonString)
      
      expect(manager.isFromLegacyFormat()).toBe(true)
      expect(manager.getImageCount()).toBe(5)
    })

    test('should handle empty legacy data', () => {
      const manager = new ProjectImagesManager([])
      
      expect(manager.getAllImages()).toHaveLength(0)
      expect(manager.hasHeroImage()).toBe(false)
      expect(manager.hasCardImage()).toBe(false)
    })

    test('should filter out empty URLs from legacy data', () => {
      const dataWithEmpties = [
        'https://example.com/image1.jpg',
        '',
        'https://example.com/image2.jpg',
        '   ',
        'https://example.com/image3.jpg'
      ]
      
      const manager = new ProjectImagesManager(dataWithEmpties)
      expect(manager.getImageCount()).toBe(3)
    })
  })

  describe('New Format Support', () => {
    test('should work with new object format', () => {
      const newFormatData = [
        {
          url: 'https://example.com/hero.jpg',
          type: ImageType.HERO,
          order: 0,
          metadata: { isMain: true }
        },
        {
          url: 'https://example.com/card.jpg',
          type: ImageType.CARD,
          order: 0
        }
      ]

      const manager = new ProjectImagesManager(newFormatData)
      
      expect(manager.isFromLegacyFormat()).toBe(false)
      expect(manager.hasHeroImage()).toBe(true)
      expect(manager.hasCardImage()).toBe(true)
    })
  })

  describe('Fallback Logic', () => {
    test('should provide main image fallback from legacy data', () => {
      const manager = new ProjectImagesManager(legacyArrayData)
      const mainImage = manager.getMainImage()
      
      // Debería ser la imagen hero (índice 0 migrado)
      expect(mainImage?.url).toBe('https://example.com/placeholder.jpg')
      expect(mainImage?.type).toBe(ImageType.HERO)
    })

    test('should handle null/undefined data gracefully', () => {
      const managerNull = new ProjectImagesManager(null)
      const managerUndefined = new ProjectImagesManager(undefined)
      
      expect(managerNull.getAllImages()).toHaveLength(0)
      expect(managerUndefined.getAllImages()).toHaveLength(0)
    })

    test('should handle malformed JSON strings', () => {
      const manager = new ProjectImagesManager('invalid json string')
      expect(manager.getAllImages()).toHaveLength(0)
    })
  })

  describe('Type Inference from Legacy Index', () => {
    test('should correctly infer types from legacy indexes', () => {
      const manager = new ProjectImagesManager(legacyArrayData)
      const images = manager.getAllImages()
      
      // Verificar tipos inferidos según la lógica actual
      expect(images[0].type).toBe(ImageType.HERO)      // índice 0
      expect(images[1].type).toBe(ImageType.CARD)      // índice 1
      expect(images[2].type).toBe(ImageType.CAROUSEL)  // índice 2
      expect(images[3].type).toBe(ImageType.CAROUSEL)  // índice 3
      expect(images[4].type).toBe(ImageType.CAROUSEL)  // índice 4
    })

    test('should preserve order from legacy array', () => {
      const manager = new ProjectImagesManager(legacyArrayData)
      const carouselImages = manager.getCarouselImages()
      
      expect(carouselImages).toHaveLength(3)
      expect(carouselImages[0].order).toBe(2)
      expect(carouselImages[1].order).toBe(3)
      expect(carouselImages[2].order).toBe(4)
    })
  })

  describe('Validation with Legacy Data', () => {
    test('should validate migrated legacy data', () => {
      const manager = new ProjectImagesManager(legacyArrayData)
      const validation = manager.validate()
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    test('should handle legacy data exceeding limits', () => {
      // Crear array con más imágenes que el límite para carrusel
      const oversizedArray = Array.from({ length: 15 }, (_, i) => 
        `https://example.com/image-${i}.jpg`
      )
      
      const manager = new ProjectImagesManager(oversizedArray)
      const validation = manager.validate()
      
      // Debería tener errores por exceder límites
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Backwards Compatibility in Operations', () => {
    test('should allow adding new images to migrated legacy data', () => {
      const manager = new ProjectImagesManager(legacyArrayData)
      const updatedManager = manager.addImage(
        'https://example.com/new-progress.jpg',
        ImageType.PROGRESS,
        0
      )
      
      expect(updatedManager.getProgressImages()).toHaveLength(1)
      expect(updatedManager.getImageCount()).toBe(6)
    })

    test('should allow removing images from migrated legacy data', () => {
      const manager = new ProjectImagesManager(legacyArrayData)
      const updatedManager = manager.removeImage('https://example.com/main-image.jpg')
      
      expect(updatedManager.hasCardImage()).toBe(false)
      expect(updatedManager.getImageCount()).toBe(4)
    })

    test('should maintain serialization format', () => {
      const manager = new ProjectImagesManager(legacyArrayData)
      const serialized = manager.toArray()
      
      expect(Array.isArray(serialized)).toBe(true)
      expect(serialized).toHaveLength(5)
      expect(serialized[0]).toHaveProperty('url')
      expect(serialized[0]).toHaveProperty('type')
      expect(serialized[0]).toHaveProperty('order')
    })
  })

  describe('Edge Cases', () => {
    test('should handle mixed array types gracefully', () => {
      const mixedArray = [
        'https://example.com/image1.jpg',
        null,
        'https://example.com/image2.jpg',
        undefined,
        'https://example.com/image3.jpg'
      ]
      
      const manager = new ProjectImagesManager(mixedArray as any)
      // Debería manejar el array como malformado y retornar vacío
      expect(manager.getAllImages()).toHaveLength(0)
    })

    test('should handle extremely large legacy arrays', () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => 
        `https://example.com/image-${i}.jpg`
      )
      
      const manager = new ProjectImagesManager(largeArray)
      expect(manager.getImageCount()).toBe(100)
      
      // Validación debería fallar por límites
      const validation = manager.validate()
      expect(validation.isValid).toBe(false)
    })

    test('should handle deeply nested JSON strings', () => {
      const nestedJson = JSON.stringify(JSON.stringify(legacyArrayData))
      const manager = new ProjectImagesManager(nestedJson)
      
      // Debería poder parsear correctamente
      expect(manager.isFromLegacyFormat()).toBe(true)
      expect(manager.getImageCount()).toBe(5)
    })
  })
})

// Tests de integración simulando datos reales
describe('Real Data Integration Tests', () => {
  // Simulación de datos como vendrían de la base de datos
  const realProjectData = {
    id: 'project-123',
    name: 'Torre del Puerto',
    images: [
      'https://supabase-storage.com/projects/project-123/hero-image.jpg',
      'https://supabase-storage.com/projects/project-123/main-display.jpg',
      'https://supabase-storage.com/projects/project-123/gallery-1.jpg',
      'https://supabase-storage.com/projects/project-123/gallery-2.jpg',
      'https://supabase-storage.com/projects/project-123/gallery-3.jpg'
    ]
  }

  test('should handle real project data from database', () => {
    const manager = new ProjectImagesManager(realProjectData.images)
    
    expect(manager.getImageCount()).toBe(5)
    expect(manager.hasHeroImage()).toBe(true)
    expect(manager.hasCardImage()).toBe(true)
    expect(manager.getCarouselImages()).toHaveLength(3)
  })

  test('should maintain data integrity after operations', () => {
    const manager = new ProjectImagesManager(realProjectData.images)
    
    // Realizar varias operaciones
    const updated = manager
      .addImage('https://example.com/progress-1.jpg', ImageType.PROGRESS)
      .addImage('https://example.com/progress-2.jpg', ImageType.PROGRESS)
      .reorderImages(ImageType.CAROUSEL, [
        'https://supabase-storage.com/projects/project-123/gallery-3.jpg',
        'https://supabase-storage.com/projects/project-123/gallery-1.jpg',
        'https://supabase-storage.com/projects/project-123/gallery-2.jpg'
      ])
    
    // Verificar integridad
    expect(updated.getImageCount()).toBe(7)
    expect(updated.getProgressImages()).toHaveLength(2)
    expect(updated.getCarouselImages()[0].url).toBe(
      'https://supabase-storage.com/projects/project-123/gallery-3.jpg'
    )
  })
})