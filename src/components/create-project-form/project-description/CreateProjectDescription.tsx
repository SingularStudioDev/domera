"use client";

import React, { useCallback, useRef, useState } from "react";

import { ImageIcon } from "lucide-react";

import { CreateProjectDescriptionProps } from "@/types/project-form";
import { useProjectImages } from "@/hooks/useProjectImages";

import { EditAddressDialog } from "./EditAddressDialog";
import { EditDescriptionDialog } from "./EditDescriptionDialog";

export function CreateProjectDescription({
  value,
  onChange,
  onBuilderImageChange,
  selectedOrganization,
  error,
  disabled,
  projectId,
}: CreateProjectDescriptionProps) {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { builderImage } = useProjectImages(value.images);

  // Debug: Log the selected organization
  console.log("selectedOrganization:", selectedOrganization?.logoUrl);

  const handleFieldChange = (field: keyof typeof value, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  const handleBuilderImageClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Call the onChange callback if provided
      if (onBuilderImageChange) {
        onBuilderImageChange([file]);
      }

      // Reset input value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onBuilderImageChange],
  );

  return (
    <>
      <div className="flex flex-col gap-5">
        <h2 className="mb-2 text-3xl font-bold text-black md:mb-6">
          Descripción
        </h2>
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row">
          <div className="flex h-[40dvh] w-full flex-col gap-2">
            <p className="text-neutral-500">Descripción</p>
            <button
              type="button"
              className="flex h-full w-full cursor-pointer items-start justify-start rounded border px-4 py-4 text-start whitespace-pre-line text-black hover:bg-gray-50"
              onClick={() => !disabled && setIsEditingDescription(true)}
            >
              {value.description || "Haz clic para agregar descripción..."}
            </button>
          </div>

          <div className="flex h-[40dvh] w-2/3 flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-neutral-500">Direccion</p>
              <button
                type="button"
                className="flex cursor-pointer items-start justify-start rounded border p-4 whitespace-pre-line text-black hover:bg-gray-50"
                onClick={() => !disabled && setIsEditingAddress(true)}
              >
                {value.address || "Haz clic para agregar dirección..."}
              </button>
            </div>

            <div className="flex w-full gap-5 md:gap-10">
              <div className="flex w-full flex-col gap-2">
                <p className="text-neutral-500">Desarrolla</p>
                <div className="flex w-full items-center justify-center border p-6">
                  {selectedOrganization?.logoUrl ? (
                    <img
                      src={selectedOrganization.logoUrl}
                      alt={selectedOrganization.name}
                      className="h-7 w-auto object-contain md:h-8"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <span className="text-sm">
                        {selectedOrganization
                          ? selectedOrganization.name
                          : "Selecciona una organización"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex w-full flex-col gap-2">
                <p className="text-neutral-500">Construye:</p>
                <div
                  className="flex h-20 w-full cursor-pointer items-center justify-center border p-6 hover:bg-gray-50"
                  onClick={handleBuilderImageClick}
                >
                  {previewImage || builderImage ? (
                    <img
                      src={previewImage || builderImage?.url}
                      alt="Logo de la constructora"
                      className="h-7 w-auto object-contain md:h-8"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <ImageIcon
                        className="h-5 w-5 text-gray-300"
                        strokeWidth={1.5}
                      />
                      <span className="text-sm">Agregar logo</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Dialogs para edición */}
      <EditDescriptionDialog
        isOpen={isEditingDescription}
        onOpenChange={setIsEditingDescription}
        description={value.description}
        shortDescription={value.shortDescription}
        onDescriptionChange={(description) =>
          handleFieldChange("description", description)
        }
        onShortDescriptionChange={(shortDescription) =>
          handleFieldChange("shortDescription", shortDescription)
        }
        disabled={disabled}
      />

      <EditAddressDialog
        isOpen={isEditingAddress}
        onOpenChange={setIsEditingAddress}
        address={value.address}
        onAddressChange={(address) => handleFieldChange("address", address)}
        disabled={disabled}
      />
    </>
  );
}
