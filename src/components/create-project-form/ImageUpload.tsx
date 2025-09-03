"use client";

import React, { useCallback, useState } from "react";

import { cn } from "@/utils/utils";
import { ImageIcon, Upload, X } from "lucide-react";

interface ImageUploadProps {
  value: string | File | null;
  onChange: (file: File | null) => void;
  preview?: string;
  placeholder?: string;
  aspectRatio?: string;
  maxSize?: number;
  accept?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  preview,
  placeholder = "Seleccionar imagen",
  aspectRatio = "aspect-video",
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = "image/jpeg,image/png,image/webp",
  className,
  disabled = false,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getImageSrc = useCallback(() => {
    if (!value) return null;

    if (typeof value === "string") {
      return value;
    }

    if (value instanceof File) {
      return URL.createObjectURL(value);
    }

    return preview || null;
  }, [value, preview]);

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
    (file: File) => {
      if (disabled) return;

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      onChange(file);
    },
    [disabled, validateFile, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleFileSelect(files[0]);
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
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        onChange(null);
        setError(null);
      }
    },
    [disabled, onChange],
  );

  const imageSrc = getImageSrc();

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className={cn(
          "relative w-full rounded-lg border-2 border-dashed transition-colors",
          aspectRatio,
          dragActive && !disabled && "border-primaryColor bg-primaryColor/5",
          !dragActive && "border-gray-300 hover:border-gray-400",
          disabled && "cursor-not-allowed opacity-50",
          error && "border-red-300",
          !imageSrc && "cursor-pointer",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {imageSrc ? (
          <>
            {/* Imagen de preview */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <img
                src={imageSrc}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              {/* Overlay oscuro */}
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 hover:opacity-100" />
            </div>

            {/* Botón de eliminar */}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 z-10 rounded-full bg-red-500 p-1 text-white opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-600 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Indicador de cambiar imagen */}
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 hover:opacity-100">
                <div className="rounded-lg bg-white/90 px-3 py-2 text-sm font-medium text-gray-900">
                  <Upload className="mr-1 inline h-4 w-4" />
                  Cambiar imagen
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Estado vacío */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-gray-500">
              <ImageIcon className="mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-lg font-medium">{placeholder}</p>
              <p className="mb-4 text-center text-sm">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG o WebP. Máximo {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </div>
          </>
        )}

        {/* Input file oculto */}
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </div>

      {/* Error message */}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
