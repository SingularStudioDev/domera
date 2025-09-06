"use client";

import React, { useCallback, useState } from "react";

import { cn } from "@/utils/utils";
import { ImageIcon, Plus, X } from "lucide-react";

interface ImageArrayUploadProps {
  value: (string | File)[];
  onChange: (files: (string | File)[]) => void;
  maxImages?: number;
  placeholder?: string;
  maxSize?: number;
  accept?: string;
  className?: string;
  disabled?: boolean;
  aspectRatio?: string;
}

export function ImageArrayUpload({
  value = [],
  onChange,
  maxImages = 20,
  placeholder = "Agregar imágenes",
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = "image/jpeg,image/png,image/webp",
  className,
  disabled = false,
  aspectRatio = "aspect-video",
}: ImageArrayUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getImageSrc = useCallback((item: string | File) => {
    if (typeof item === "string") {
      return item;
    }
    if (item instanceof File) {
      return URL.createObjectURL(item);
    }
    return null;
  }, []);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSize) {
        return `El archivo no debe exceder ${Math.round(maxSize / (1024 * 1024))}MB`;
      }

      const acceptedTypes = accept.split(",").map((type) => type.trim());
      if (!acceptedTypes.includes(file.type)) {
        return "Formato de archivo no soportado";
      }

      return null;
    },
    [maxSize, accept],
  );

  const handleFileSelect = useCallback(
    (files: FileList | File[]) => {
      if (disabled) return;

      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      let hasError = false;

      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          hasError = true;
          break;
        }
        validFiles.push(file);
      }

      if (!hasError) {
        const newImages = [...value, ...validFiles];
        if (newImages.length > maxImages) {
          setError(`No se pueden subir más de ${maxImages} imágenes`);
          return;
        }

        setError(null);
        onChange(newImages);
      }
    },
    [disabled, validateFile, value, maxImages, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelect(files);
      }
    },
    [disabled, handleFileSelect],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setDragActive(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files);
      }
    },
    [handleFileSelect],
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      if (!disabled) {
        const newImages = value.filter((_, i) => i !== index);
        onChange(newImages);
        setError(null);
      }
    },
    [disabled, value, onChange],
  );

  const canAddMore = value.length < maxImages;

  return (
    <div className={cn("w-full", className)}>
      {/* Grid de imágenes existentes */}
      {value.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {value.map((item, index) => {
            const imageSrc = getImageSrc(item);
            return (
              <div key={index} className={cn("group relative", aspectRatio)}>
                <div className="absolute inset-0 overflow-hidden rounded-lg border">
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt={`Imagen ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </div>

                {/* Botón de eliminar */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 z-10 rounded-full bg-red-500 p-1 text-white opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Número de imagen */}
                <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Área de subida */}
      {canAddMore && (
        <div
          className={cn(
            "relative w-full rounded-lg border-2 border-dashed p-8 transition-colors",
            dragActive && !disabled && "border-primaryColor bg-primaryColor/5",
            !dragActive && "border-gray-300 hover:border-gray-400",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-red-300",
            !disabled && "cursor-pointer",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center justify-center text-gray-500">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              {value.length === 0 ? (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              ) : (
                <Plus className="h-8 w-8 text-gray-400" />
              )}
            </div>

            <p className="mb-2 text-lg font-medium">
              {value.length === 0 ? placeholder : "Agregar más imágenes"}
            </p>

            <p className="mb-4 text-center text-sm">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>

            <div className="text-center text-xs text-gray-400">
              <p>
                JPG, PNG o WebP. Máximo {Math.round(maxSize / (1024 * 1024))}MB
                por imagen
              </p>
              <p>
                {value.length} / {maxImages} imágenes
              </p>
            </div>
          </div>

          {/* Input file oculto */}
          <input
            type="file"
            accept={accept}
            onChange={handleInputChange}
            disabled={disabled}
            multiple
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </div>
      )}

      {/* Mensaje cuando se alcanza el límite */}
      {!canAddMore && (
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600">
            Límite de {maxImages} imágenes alcanzado
          </p>
        </div>
      )}

      {/* Error message */}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
