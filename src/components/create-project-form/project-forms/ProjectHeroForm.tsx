"use client";

import React, { useState } from "react";

import { formatCurrency } from "@/utils/utils";

import { HeroFormProps } from "@/types/project-form";

import { OptimizedImageUpload } from "@/components/image-upload";

export function ProjectHeroForm({
  value,
  onChange,
  error,
  disabled,
  currency,
}: HeroFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFieldChange = (field: keyof typeof value, newValue: any) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  const handleImagesChange = (imageUrls: string[]) => {
    // Las URLs ya están procesadas por OptimizedImageUpload
    // Actualizar el preview si hay una imagen nueva
    if (imageUrls.length > 0) {
      setPreviewImage(imageUrls[0]);
    } else {
      setPreviewImage(null);
    }

    handleFieldChange("images", imageUrls);
  };

  // Formatear precio para preview
  const formattedPrice = value.basePrice
    ? formatCurrency(value.basePrice)
    : "Consultar";

  // Formatear ubicación para preview - igual que el original
  const location = value.neighborhood
    ? `${value.neighborhood}, ${value.city}`
    : value.city || "Ubicación";

  // Formatear fecha para preview - igual que el original
  const formattedDate = value.estimatedCompletion
    ? new Intl.DateTimeFormat("es-UY", {
        month: "short",
        year: "numeric",
      }).format(value.estimatedCompletion)
    : "A definir";

  const heroImage =
    value.images && value.images.length > 0 ? value.images[0] : null;

  return (
    <>
      {/* Modal/Overlay para edición de imágenes */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Editar Imágenes del Proyecto
            </h3>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Panel de selección de imágenes */}
              <div>
                <h4 className="text-md mb-3 font-medium">
                  Seleccionar Imágenes
                </h4>
                <OptimizedImageUpload
                  value={value.images || []}
                  onChange={handleImagesChange}
                  entityType="project"
                  maxImages={5}
                  placeholder="Seleccionar imágenes del proyecto"
                  aspectRatio="aspect-video"
                  disabled={disabled}
                  showUploadButton={true}
                />
              </div>

              {/* Panel de preview */}
              <div>
                <h4 className="text-md mb-3 font-medium">
                  Vista Previa del Hero
                </h4>
                <div className="relative h-64 overflow-hidden rounded-lg border">
                  {previewImage || heroImage ? (
                    <img
                      src={previewImage || heroImage || ""}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <div className="text-center text-gray-500">
                        <svg
                          className="mx-auto mb-2 h-12 w-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm">No hay imagen seleccionada</p>
                      </div>
                    </div>
                  )}

                  {/* Overlay del preview similar al hero real */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50"></div>
                  <div className="absolute right-2 bottom-2 left-2">
                    <div className="rounded-lg bg-white/90 p-2">
                      <h5 className="truncate text-sm font-semibold text-black">
                        {value.name || "Nombre del Proyecto"}
                      </h5>
                      <p className="text-xs text-gray-600">
                        Desde: {formattedPrice}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setPreviewImage(null);
                }}
                className="bg-primaryColor hover:bg-primaryColor/90 rounded px-4 py-2 text-white"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setPreviewImage(null);
                }}
                className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - EXACTAMENTE igual al original */}
      <section className="relative h-[95vh] overflow-hidden">
        <div>
          <div className="relative h-full overflow-hidden">
            {heroImage ? (
              <img
                src={heroImage}
                alt={value.name || "Proyecto"}
                className="h-[95vh] w-full cursor-pointer rounded-b-3xl object-cover"
                onClick={() => !disabled && setIsEditing(true)}
              />
            ) : (
              <div
                className="flex h-[95vh] w-full cursor-pointer items-center justify-center rounded-b-3xl bg-gray-200"
                onClick={() => !disabled && setIsEditing(true)}
              >
                <div className="text-center text-gray-500">
                  <svg
                    className="mx-auto mb-4 h-16 w-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-lg">
                    Haz clic para seleccionar una imagen
                  </p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 z-10 rounded-b-3xl bg-gradient-to-b from-black/10 to-black/50"></div>

            {/* Project Info Overlay - EXACTAMENTE igual al original */}
            <div className="absolute bottom-0 left-0 z-20 h-full w-full">
              <div className="container mx-auto flex h-full w-full flex-col items-start justify-between px-4 pt-28 pb-6 md:px-0">
                {/* Badges superiores - EXACTAMENTE igual al original */}
                <div className="mb-4 flex gap-4">
                  {disabled ? (
                    <>
                      <span className="rounded-2xl bg-white px-4 py-2 text-lg font-medium text-black">
                        {location}
                      </span>
                      <span className="rounded-2xl bg-white px-4 py-2 text-lg font-medium text-black">
                        {formattedDate}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl bg-white px-4 py-2 text-lg font-medium text-black">
                        <input
                          type="text"
                          value={value.neighborhood || ""}
                          onChange={(e) => {
                            const newValue = e.target.value.substring(0, 100);
                            handleFieldChange("neighborhood", newValue);
                          }}
                          placeholder="Barrio"
                          maxLength={100}
                          className="w-20 min-w-0 border-none bg-transparent text-lg font-medium outline-none"
                        />
                        <span>, </span>
                        <input
                          type="text"
                          value={value.city}
                          onChange={(e) => {
                            const newValue = e.target.value.substring(0, 100);
                            handleFieldChange("city", newValue);
                          }}
                          placeholder="Ciudad"
                          maxLength={100}
                          className="w-16 min-w-0 border-none bg-transparent text-lg font-medium outline-none"
                        />
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-2 text-lg font-medium text-black">
                        <input
                          type="date"
                          value={
                            value.estimatedCompletion
                              ? value.estimatedCompletion
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              "estimatedCompletion",
                              e.target.value ? new Date(e.target.value) : null,
                            )
                          }
                          className="w-24 min-w-0 border-none bg-transparent text-lg font-medium outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Card inferior - EXACTAMENTE igual al original */}
                <div className="flex w-full items-center justify-between">
                  <div className="flex w-fit flex-col gap-3 rounded-2xl bg-white px-6 py-2 text-black">
                    {disabled ? (
                      <h1 className="text-3xl font-semibold md:text-6xl">
                        {value.name || "Nombre del Proyecto"}
                      </h1>
                    ) : (
                      <input
                        type="text"
                        value={value.name}
                        onChange={(e) => {
                          const newValue = e.target.value.substring(0, 255);
                          handleFieldChange("name", newValue);
                        }}
                        placeholder="Nombre del proyecto"
                        maxLength={255}
                        className="border-none bg-transparent text-3xl font-semibold placeholder-gray-400 outline-none md:text-6xl"
                      />
                    )}

                    {disabled ? (
                      <p className="text-xl font-medium md:text-4xl">
                        Desde: {formattedPrice}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-medium md:text-4xl">
                          Desde:
                        </span>
                        <input
                          type="number"
                          value={value.basePrice || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "basePrice",
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                          placeholder="0"
                          className="w-32 border-none bg-transparent text-xl font-medium placeholder-gray-400 outline-none md:w-48 md:text-4xl"
                        />
                        <span className="text-xl font-medium md:text-4xl">
                          {currency}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón flotante para editar imágenes */}
        {!disabled && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primaryColor hover:bg-primaryColor/90 absolute right-6 bottom-6 z-30 rounded-full p-3 text-white shadow-lg transition-colors duration-200"
            title="Editar imágenes del proyecto"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        )}
      </section>

      {/* Mensajes de error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}
    </>
  );
}
