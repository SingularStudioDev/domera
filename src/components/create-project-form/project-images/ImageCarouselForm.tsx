"use client";

import React, { useState } from "react";

import { cn } from "@/utils/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ImageCarouselFormProps } from "@/types/project-form";
import { OptimizedImageUpload } from "@/components/image-upload";

export function ImageCarouselForm({
  value,
  onChange,
  projectName,
  disabled,
  error,
  className,
  projectId,
}: ImageCarouselFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImagesChange = (imageUrls: string[]) => {
    onChange({
      images: imageUrls,
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
      prevIndex === 0 ? value.images.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === value.images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const currentImage = value.images[currentIndex];
  const hasMultipleImages = value.images.length > 1;

  return (
    <>
      {/* Modal para edición de imágenes */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Editar Carrusel de Imágenes
            </h3>
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
              deferUpload={true}
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-primaryColor hover:bg-primaryColor/90 rounded px-4 py-2 text-white"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Componente principal - EXACTAMENTE igual al original ProjectImageCarousel */}
      <div className={cn("w-full", className)}>
        {value.images.length > 0 ? (
          <div className="relative">
            {/* Imagen principal */}
            <div
              className="relative h-[80dvh] w-full cursor-pointer"
              onClick={() => !disabled && setIsEditing(true)}
            >
              <img
                src={currentImage}
                alt={`${projectName} - Imagen ${currentIndex + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />

              {/* Overlay para indicar que es editable */}
              {!disabled && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-all duration-200 hover:bg-black/10">
                  <div className="rounded-lg bg-white/90 px-4 py-2 font-medium text-gray-900 opacity-0 hover:opacity-100">
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
                  className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all duration-200 hover:bg-white"
                  disabled={disabled}
                >
                  <ChevronLeft className="h-6 w-6 text-gray-900" />
                </button>

                {/* Botón siguiente */}
                <button
                  onClick={goToNext}
                  className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all duration-200 hover:bg-white"
                  disabled={disabled}
                >
                  <ChevronRight className="h-6 w-6 text-gray-900" />
                </button>

                {/* Contador */}
                <div className="absolute right-4 bottom-4 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
                  {currentIndex + 1} / {value.images.length}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Estado vacío - Igual al original */
          <div
            className="relative flex h-[80dvh] w-full cursor-pointer items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200"
            onClick={() => !disabled && setIsEditing(true)}
          >
            <div className="text-center text-gray-500">
              <div className="mb-4 text-6xl">📷</div>
              <p className="mb-2 text-xl font-medium">
                No hay imágenes disponibles
              </p>
              {!disabled && (
                <p className="text-sm">
                  Haz clic para agregar imágenes al carrusel
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}
      </div>
    </>
  );
}
