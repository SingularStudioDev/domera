"use client";

import React, { useState } from "react";

import { CreateProjectDescriptionProps } from "@/types/project-form";

import { EditAddressDialog } from "./EditAddressDialog";
import { EditDescriptionDialog } from "./EditDescriptionDialog";

export function CreateProjectDescription({
  value,
  onChange,
  error,
  disabled,
}: CreateProjectDescriptionProps) {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const handleFieldChange = (field: keyof typeof value, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

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
                <button type="button" className="flex w-full gap-4 border p-6">
                  <img
                    src="/developer-logo-7b3d8c.png"
                    alt="Developer"
                    className="h-7 w-auto md:h-8"
                  />
                </button>
              </div>

              <div className="flex w-full flex-col gap-2">
                <p className="text-neutral-500">Construye:</p>
                <button type="button" className="flex w-full gap-4 border p-6">
                  <img
                    src="/constructor-logo-7b3d8c.png"
                    alt="Constructor"
                    className="h-7 w-auto md:h-8"
                  />
                </button>
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
