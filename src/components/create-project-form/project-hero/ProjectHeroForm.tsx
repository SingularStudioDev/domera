"use client";

import React, { useState } from "react";

import { formatCurrency } from "@/utils/utils";
import { CameraIcon, ImageIcon } from "lucide-react";

import { HeroFormProps } from "@/types/project-form";

import { HeroImageEditDialog } from "./HeroImageEditDialog";

interface ProjectHeroFormProps extends HeroFormProps {
  onHeroImageChange?: (files: File[]) => void;
}

export function ProjectHeroForm({
  value,
  onChange,
  error,
  disabled,
  currency,
  onHeroImageChange,
}: ProjectHeroFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleFieldChange = (
    field: keyof typeof value,
    newValue: string | number | Date | null | string[],
  ) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  const handleImagesChange = (imageUrls: string[]) => {
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
      <section className="relative h-[95vh] overflow-hidden">
        <div>
          <div className="relative h-full overflow-hidden">
            {heroImage ? (
              <img
                src={heroImage}
                alt={value.name || "Proyecto"}
                className="h-[95vh] w-full cursor-pointer rounded-b-3xl object-cover"
              />
            ) : (
              <div className="flex h-[95vh] w-full cursor-pointer items-center justify-center rounded-b-3xl bg-gray-200">
                <div className="flex flex-col items-center justify-center gap-1 text-center text-gray-500">
                  <ImageIcon
                    className="h-20 w-20 text-gray-400"
                    strokeWidth={1.5}
                  />
                  <p className="text-lg">No hay imagen seleccionada</p>
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
                        {value.city || "Ciudad"}
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
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-2 text-lg font-medium text-black">
                        <input
                          type="text"
                          value={value.city || ""}
                          onChange={(e) => {
                            const newValue = e.target.value.substring(0, 100);
                            handleFieldChange("city", newValue);
                          }}
                          placeholder="Ciudad"
                          maxLength={100}
                          className="w-24 min-w-0 border-none bg-transparent text-lg font-medium outline-none"
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
                          className="w-fit min-w-0 border-none bg-transparent text-lg font-medium outline-none"
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
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="bg-primaryColor hover:bg-primaryColor-hover absolute right-6 bottom-6 z-30 flex cursor-pointer items-center gap-2 rounded-full p-3 px-6 text-white shadow-lg transition-colors duration-200"
          title="Editar imágenes del proyecto"
        >
          Selecciona una imagen
          <ImageIcon className="mt-0.5 h-4 w-4" />
        </button>
      </section>

      {/* Mensajes de error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {/* Modal para edición de imágenes usando shadcn Dialog */}
      <HeroImageEditDialog
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        value={value}
        currency={currency}
        onImagesChange={handleImagesChange}
        onHeroImageChange={onHeroImageChange}
        disabled={disabled}
      />
    </>
  );
}
