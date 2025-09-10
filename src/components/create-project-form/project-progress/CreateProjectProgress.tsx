"use client";

import React, { useState } from "react";

import { ChevronLeft, ChevronRight, ConstructionIcon } from "lucide-react";

import { EditProgressDialog } from "./EditProgressDialog";

interface CreateProjectProgressProps {
  progressImages: string[];
  onProgressImagesChange: (files: File[]) => void;
  onChange?: (imageUrls: string[]) => void;
  disabled?: boolean;
  error?: string;
  projectId?: string;
}

export function CreateProjectProgress({
  progressImages,
  onProgressImagesChange,
  onChange,
  disabled,
  error,
  projectId,
}: CreateProjectProgressProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localImages, setLocalImages] = useState<string[]>(
    progressImages || [],
  );

  // Sincronizar con progressImages cuando cambie
  React.useEffect(() => {
    setLocalImages(progressImages || []);
  }, [progressImages]);

  const handleImagesChange = (imageUrls: string[]) => {
    // Actualizar el estado local para preview inmediato
    setLocalImages(imageUrls);

    // Comunicar cambios al componente padre
    if (onChange) {
      onChange(imageUrls);
    }

    // Resetear índice si no hay imágenes
    if (imageUrls.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= imageUrls.length) {
      setCurrentIndex(imageUrls.length - 1);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? localImages.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === localImages.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const currentImage = localImages[currentIndex];
  const hasMultipleImages = localImages.length > 1;
  const hasImages = localImages.length > 0;

  return (
    <>
      {/* Componente principal - EXACTAMENTE igual al original ProjectProgress */}
      <div className="py-12">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            Avances de obra
          </h3>
        </div>

        {hasImages ? (
          <>
            {/* Vista móvil - Carrusel individual */}
            <div className="block md:hidden">
              <div className="relative">
                <div
                  className="relative cursor-pointer"
                  onClick={() => !disabled && setIsEditing(true)}
                >
                  <img
                    src={currentImage}
                    alt={`Avance de obra ${currentIndex + 1}`}
                    className="h-[30dvh] w-full rounded-lg object-cover"
                  />

                  {/* Overlay para indicar que es editable */}
                  {!disabled && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-all duration-200 hover:bg-black/10">
                      <div className="rounded-lg bg-white/90 px-4 py-2 font-medium text-gray-900 opacity-0 hover:opacity-100">
                        Haz clic para editar
                      </div>
                    </div>
                  )}
                </div>

                {/* Controles de navegación móvil */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
                      disabled={disabled}
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-900" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
                      disabled={disabled}
                    >
                      <ChevronRight className="h-4 w-4 text-gray-900" />
                    </button>
                    <div className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                      {currentIndex + 1} / {localImages.length}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Vista desktop - Grid de 3 columnas */}
            <div className="hidden md:block">
              <div className="relative">
                <div
                  className="grid cursor-pointer grid-cols-3 gap-4"
                  onClick={() => !disabled && setIsEditing(true)}
                >
                  {localImages
                    .slice(currentIndex, currentIndex + 3)
                    .map((image, index) => (
                      <div key={currentIndex + index} className="relative">
                        <img
                          src={image}
                          alt={`Avance de obra ${currentIndex + index + 1}`}
                          className="h-[50dvh] rounded-lg object-cover"
                        />

                        {/* Overlay para indicar que es editable */}
                        {!disabled && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-all duration-200 hover:bg-black/10">
                            <div className="rounded-lg bg-white/90 px-2 py-1 text-sm font-medium text-gray-900 opacity-0 hover:opacity-100">
                              Editar
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Controles de navegación desktop - Solo si hay más de 3 imágenes */}
                {localImages.length > 3 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white"
                      disabled={disabled}
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-900" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white"
                      disabled={disabled}
                    >
                      <ChevronRight className="h-6 w-6 text-gray-900" />
                    </button>
                  </>
                )}
              </div>

              {/* Indicadores y contador para desktop */}
              {localImages.length > 3 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    {Array.from({
                      length: Math.ceil(localImages.length / 3),
                    }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index * 3)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          Math.floor(currentIndex / 3) === index
                            ? "bg-primaryColor"
                            : "bg-gray-300"
                        }`}
                        disabled={disabled}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.min(currentIndex + 3, localImages.length)} de{" "}
                    {localImages.length} imágenes
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Estado vacío */
          <div
            className="flex aspect-[4/3] h-[30dvh] cursor-pointer items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200"
            onClick={() => !disabled && setIsEditing(true)}
          >
            <div className="flex flex-col items-center justify-center gap-3 text-center text-gray-500">
              <ConstructionIcon
                strokeWidth={1.5}
                className="h-12 w-12 text-gray-400"
              />
              <span>
                <p className="font-medium">No hay imágenes de avance de obra</p>
                {!disabled && (
                  <p className="text-sm">Haz clic para agregar imágenes</p>
                )}
              </span>
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

      {/* Dialog para edición de imágenes de progreso */}
      <EditProgressDialog
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        progressImages={localImages}
        onProgressImagesChange={onProgressImagesChange}
        onChange={handleImagesChange}
        disabled={disabled}
        projectId={projectId}
      />
    </>
  );
}
