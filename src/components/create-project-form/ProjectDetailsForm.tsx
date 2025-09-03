"use client";

import React, { useState } from "react";

import { Plus, X } from "lucide-react";

import { DetailsFormProps } from "@/types/project-form";

export function ProjectDetailsForm({
  value,
  onChange,
  error,
  disabled,
}: DetailsFormProps) {
  const [newAmenity, setNewAmenity] = useState({ icon: "", text: "" });

  const handleAmenitiesChange = (
    newAmenities: Array<{ icon: string; text: string }>,
  ) => {
    onChange({
      ...value,
      amenities: newAmenities,
    });
  };

  const addAmenity = () => {
    if (newAmenity.icon.trim() && newAmenity.text.trim()) {
      handleAmenitiesChange([...value.amenities, { ...newAmenity }]);
      setNewAmenity({ icon: "", text: "" });
    }
  };

  const removeAmenity = (index: number) => {
    const updatedAmenities = value.amenities.filter((_, i) => i !== index);
    handleAmenitiesChange(updatedAmenities);
  };

  const updateAmenity = (
    index: number,
    field: "icon" | "text",
    newValue: string,
  ) => {
    // Apply character limits
    const limitedValue =
      field === "icon"
        ? newValue.substring(0, 100)
        : newValue.substring(0, 255);

    const updatedAmenities = value.amenities.map((amenity, i) =>
      i === index ? { ...amenity, [field]: limitedValue } : amenity,
    );
    handleAmenitiesChange(updatedAmenities);
  };

  return (
    <div className="py-5">
      <div className="grid gap-8 md:grid-cols-3">
        {/* AMENIDADES - Sección editable */}
        <div>
          <div className="mb-6">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Amenidades
            </h3>

            {/* Formulario para nueva amenidad */}
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newAmenity.icon}
                  onChange={(e) => {
                    const newValue = e.target.value.substring(0, 100);
                    setNewAmenity((prev) => ({ ...prev, icon: newValue }));
                  }}
                  placeholder="Emoji o ícono (ej: 🏊‍♀️)"
                  disabled={disabled}
                  maxLength={100}
                  className="focus:ring-primaryColor w-full rounded border border-gray-300 p-2 outline-none focus:border-transparent focus:ring-2 disabled:opacity-50"
                />
                <input
                  type="text"
                  value={newAmenity.text}
                  onChange={(e) => {
                    const newValue = e.target.value.substring(0, 255);
                    setNewAmenity((prev) => ({ ...prev, text: newValue }));
                  }}
                  placeholder="Descripción (ej: Piscina)"
                  disabled={disabled}
                  maxLength={255}
                  className="focus:ring-primaryColor w-full rounded border border-gray-300 p-2 outline-none focus:border-transparent focus:ring-2 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  disabled={
                    disabled ||
                    !newAmenity.icon.trim() ||
                    !newAmenity.text.trim()
                  }
                  className="bg-primaryColor hover:bg-primaryColor/90 flex w-full items-center justify-center gap-2 rounded px-3 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Agregar amenidad
                </button>
              </div>
            </div>

            {/* Lista de amenidades existentes */}
            <div className="space-y-2">
              {value.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                >
                  <input
                    type="text"
                    value={amenity.icon}
                    onChange={(e) =>
                      updateAmenity(index, "icon", e.target.value)
                    }
                    disabled={disabled}
                    maxLength={100}
                    className="w-10 border-none bg-transparent text-center outline-none disabled:opacity-50"
                  />
                  <input
                    type="text"
                    value={amenity.text}
                    onChange={(e) =>
                      updateAmenity(index, "text", e.target.value)
                    }
                    disabled={disabled}
                    maxLength={255}
                    className="flex-1 border-none bg-transparent outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    disabled={disabled}
                    className="rounded p-1 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {value.amenities.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No hay amenidades agregadas. Usa el formulario arriba para
                agregar.
              </p>
            )}
          </div>

          {/* Preview de amenidades */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h4 className="mb-3 font-medium text-gray-900">Vista previa:</h4>
            <ul className="space-y-2">
              {value.amenities.map((amenity, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <span className="text-primaryColor text-lg">
                    {amenity.icon || "•"}
                  </span>
                  {amenity.text}
                </li>
              ))}
              {value.amenities.length === 0 && (
                <li className="text-gray-400 italic">Amenidades a confirmar</li>
              )}
            </ul>
          </div>
        </div>

        {/* CARACTERÍSTICAS ADICIONALES - Para futuras expansiones */}
        <div>
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Características adicionales
          </h3>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-gray-600 italic">
              Esta sección se expandirá en futuras versiones para incluir
              características específicas del proyecto.
            </p>
            <div className="mt-4 rounded border border-gray-200 bg-white p-3">
              <p className="text-gray-700">
                Características adicionales a definir
              </p>
            </div>
          </div>
        </div>

        {/* INVERSIÓN - Contenido estático informativo */}
        <div>
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Inversión
          </h3>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h4 className="mb-2 font-medium text-gray-900">Ley 18.795</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="bg-primaryColor h-1.5 w-1.5 rounded-full"></div>
                  Exoneración de impuestos nacionales
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primaryColor h-1.5 w-1.5 rounded-full"></div>
                  Beneficios fiscales por hasta 10 años
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primaryColor h-1.5 w-1.5 rounded-full"></div>
                  Inversión mínima desde USD 100.000
                </li>
              </ul>
            </div>

            <div className="bg-primaryColor/10 border-primaryColor/20 rounded-lg border p-4">
              <p className="text-sm text-gray-700">
                <strong>Importante:</strong> Los beneficios fiscales están
                sujetos a verificación legal y pueden variar según la situación
                particular de cada inversor.
              </p>
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
  );
}
