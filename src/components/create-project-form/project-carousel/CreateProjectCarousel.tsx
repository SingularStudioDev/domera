"use client";

import React, { useState } from "react";

import { cn } from "@/utils/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { CreateProjectCarouselProps } from "@/types/project-form";

import { EditCarouselDialog } from "./EditCarouselDialog";

export function CreateProjectCarousel({
  value,
  onChange,
  projectName,
  disabled,
  error,
  className,
  projectId,
  onCarouselImagesChange,
}: CreateProjectCarouselProps) {
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

      {/* Dialog para edición de imágenes */}
      <EditCarouselDialog
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        value={value.images || []}
        onChange={handleImagesChange}
        onFilesChange={onCarouselImagesChange}
        projectId={projectId}
        disabled={disabled}
      />
    </>
  );
}
