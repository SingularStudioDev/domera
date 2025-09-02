'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { OptimizedImageUpload } from './OptimizedImageUpload';
import { ImageCarouselFormProps } from '@/types/project-form';
import { cn } from '@/utils/utils';

export const ImageCarouselForm: React.FC<ImageCarouselFormProps & { className?: string; projectId?: string }> = ({
  value,
  onChange,
  projectName,
  disabled,
  error,
  className,
  projectId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImagesChange = (imageUrls: string[]) => {
    onChange({
      images: imageUrls
    });
    
    // Resetear índice si no hay imágenes
    if (imageUrls.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= imageUrls.length) {
      setCurrentIndex(imageUrls.length - 1);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? value.images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === value.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentImage = value.images[currentIndex];
  const hasMultipleImages = value.images.length > 1;

  return (
    <>
      {/* Modal para edición de imágenes */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Editar Carrusel de Imágenes</h3>
            <OptimizedImageUpload
              value={value.images || []}
              onChange={handleImagesChange}
              entityType="project"
              entityId={projectId}
              maxImages={20}
              placeholder="Seleccionar imágenes para el carrusel"
              aspectRatio="aspect-[16/10]"
              disabled={disabled}
              showUploadButton={true}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-primaryColor/90"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Componente principal - EXACTAMENTE igual al original ProjectImageCarousel */}
      <div className={cn('w-full', className)}>
        {value.images.length > 0 ? (
          <div className="relative">
            {/* Imagen principal */}
            <div 
              className="relative w-full h-[80dvh] cursor-pointer"
              onClick={() => !disabled && setIsEditing(true)}
            >
              <img
                src={currentImage}
                alt={`${projectName} - Imagen ${currentIndex + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              
              {/* Overlay para indicar que es editable */}
              {!disabled && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 bg-white/90 rounded-lg px-4 py-2 text-gray-900 font-medium">
                    Haz clic para editar imágenes
                  </div>
                </div>
              )}
            </div>

            {/* Controles de navegación - Solo si hay múltiples imágenes */}
            {hasMultipleImages && (
              <>
                {/* Botón anterior */}
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200"
                  disabled={disabled}
                >
                  <ChevronLeft className="w-6 h-6 text-gray-900" />
                </button>

                {/* Botón siguiente */}
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200"
                  disabled={disabled}
                >
                  <ChevronRight className="w-6 h-6 text-gray-900" />
                </button>

                {/* Contador */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {value.images.length}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Estado vacío - Igual al original */
          <div 
            className="relative w-full h-[80dvh] bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => !disabled && setIsEditing(true)}
          >
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-xl font-medium mb-2">No hay imágenes disponibles</p>
              {!disabled && (
                <p className="text-sm">Haz clic para agregar imágenes al carrusel</p>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </>
  );
};