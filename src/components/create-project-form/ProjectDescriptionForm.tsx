"use client";

import React, { useState } from "react";
import Image from "next/image";

import { DescriptionFormProps } from "@/types/project-form";

export function ProjectDescriptionForm({
  value,
  onChange,
  error,
  disabled,
}: DescriptionFormProps) {
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
      {/* Modal para editar descripción */}
      {isEditingDescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Editar Descripción</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Descripción principal
                </label>
                <textarea
                  value={value.description}
                  onChange={(e) => {
                    const newValue = e.target.value.substring(0, 5000);
                    handleFieldChange("description", newValue);
                  }}
                  placeholder="Descripción detallada del proyecto..."
                  disabled={disabled}
                  rows={8}
                  maxLength={5000}
                  className="focus:ring-primaryColor w-full resize-none rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2"
                />
                <div className="mt-1 text-right text-xs text-gray-500">
                  {value.description.length}/5000 caracteres
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Descripción corta
                </label>
                <textarea
                  value={value.shortDescription}
                  onChange={(e) => {
                    const newValue = e.target.value.substring(0, 500);
                    handleFieldChange("shortDescription", newValue);
                  }}
                  placeholder="Resumen breve del proyecto..."
                  disabled={disabled}
                  rows={3}
                  maxLength={500}
                  className="focus:ring-primaryColor w-full resize-none rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2"
                />
                <div className="mt-1 text-right text-xs text-gray-500">
                  {value.shortDescription.length}/500 caracteres
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setIsEditingDescription(false)}
                className="bg-primaryColor hover:bg-primaryColor/90 rounded px-4 py-2 text-white"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditingDescription(false)}
                className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar dirección */}
      {isEditingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Editar Dirección</h3>
            <input
              type="text"
              value={value.address}
              onChange={(e) => {
                const newValue = e.target.value.substring(0, 500);
                handleFieldChange("address", newValue);
              }}
              placeholder="Dirección completa del proyecto"
              disabled={disabled}
              maxLength={500}
              className="focus:ring-primaryColor w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2"
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              {value.address.length}/500 caracteres
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setIsEditingAddress(false)}
                className="bg-primaryColor hover:bg-primaryColor/90 rounded px-4 py-2 text-white"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditingAddress(false)}
                className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Componente principal - EXACTAMENTE igual al original */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-start justify-between md:flex-row">
          <div className="flex flex-col gap-2">
            <h2 className="mb-2 text-3xl font-bold text-black md:mb-6">
              Descripción
            </h2>
            <p
              className="mb-8 max-w-[600px] cursor-pointer rounded p-2 whitespace-pre-line text-black hover:bg-gray-50"
              onClick={() => !disabled && setIsEditingDescription(true)}
            >
              {value.description || "Haz clic para agregar descripción..."}
            </p>
          </div>

          <div>
            <div className="flex flex-col">
              <p className="mb-2 font-semibold text-black">Direccion:</p>
              <p
                className="mb-8 max-w-[600px] cursor-pointer rounded p-2 whitespace-pre-line text-black hover:bg-gray-50"
                onClick={() => !disabled && setIsEditingAddress(true)}
              >
                {value.address || "Haz clic para agregar dirección..."}
              </p>
            </div>

            <div className="flex gap-5 md:gap-10">
              <div>
                <p className="mb-2 font-semibold text-black">Desarrolla:</p>
                <div className="flex gap-4">
                  <Image
                    src="/developer-logo-7b3d8c.png"
                    alt="Developer"
                    width={154}
                    height={30}
                    className="h-7 w-auto md:h-8"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 font-semibold text-black">Construye:</p>
                <div className="flex gap-4">
                  <Image
                    src="/constructor-logo-7b3d8c.png"
                    alt="Constructor"
                    width={154}
                    height={30}
                    className="h-7 w-auto md:h-8"
                  />
                </div>
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
    </>
  );
}
