"use client";

import React, { useState } from "react";
import Image from "next/image";

import { DescriptionFormProps } from "@/types/project-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      {/* Dialog para editar descripción */}
      <Dialog
        open={isEditingDescription}
        onOpenChange={setIsEditingDescription}
      >
        <DialogContent className="max-h-[80vh] w-full max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Descripción</DialogTitle>
          </DialogHeader>
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
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsEditingDescription(false)}
              className="bg-primaryColor hover:bg-primaryColor/90 rounded px-4 py-2 text-white"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setIsEditingDescription(false)}
              className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar dirección */}
      <Dialog open={isEditingAddress} onOpenChange={setIsEditingAddress}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Dirección</DialogTitle>
          </DialogHeader>
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
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsEditingAddress(false)}
              className="bg-primaryColor hover:bg-primaryColor/90 rounded px-4 py-2 text-white"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setIsEditingAddress(false)}
              className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Componente principal - EXACTAMENTE igual al original */}
      <div className="flex flex-col gap-5">
        <h2 className="mb-2 text-3xl font-bold text-black md:mb-6">
          Descripción
        </h2>
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row">
          <div className="flex h-[40dvh] w-full flex-col gap-2">
            <p className="text-neutral-500">Descripción</p>
            <button
              type="button"
              className="h-full w-full cursor-pointer rounded border p-4 whitespace-pre-line text-black hover:bg-gray-50"
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
                className="cursor-pointer rounded border p-4 whitespace-pre-line text-black hover:bg-gray-50"
                onClick={() => !disabled && setIsEditingAddress(true)}
              >
                {value.address || "Haz clic para agregar dirección..."}
              </button>
            </div>

            <div className="flex w-full gap-5 md:gap-10">
              <div className="flex w-full flex-col gap-2">
                <p className="text-neutral-500">Desarrolla</p>
                <button type="button" className="flex w-full gap-4 border p-6">
                  <Image
                    src="/developer-logo-7b3d8c.png"
                    alt="Developer"
                    width={32}
                    height={32}
                    className="h-7 w-auto md:h-8"
                  />
                </button>
              </div>

              <div className="flex w-full flex-col gap-2">
                <p className="text-neutral-500">Construye:</p>
                <button type="button" className="flex w-full gap-4 border p-6">
                  <Image
                    src="/constructor-logo-7b3d8c.png"
                    alt="Constructor"
                    width={32}
                    height={32}
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
    </>
  );
}
