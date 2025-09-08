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
  const [newAmenity, setNewAmenity] = useState("");
  const [newDetalle, setNewDetalle] = useState("");
  const [newDetail, setNewDetail] = useState("");

  // Valores por defecto para evitar errores de undefined
  const amenities = value.amenities || [];
  const detalles = value.detalles || [];
  const details = value.details || [];

  const handleAmenitiesChange = (
    newAmenities: Array<{ icon: string; text: string }>,
  ) => {
    onChange({
      ...value,
      amenities: newAmenities,
    });
  };

  const handleDetallesChange = (newDetalles: Array<{ text: string }>) => {
    onChange({
      ...value,
      detalles: newDetalles,
    });
  };

  const handleDetailsChange = (newDetails: string[]) => {
    onChange({
      ...value,
      details: newDetails,
    });
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      handleAmenitiesChange([...amenities, { icon: "", text: newAmenity }]);
      setNewAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    const updatedAmenities = amenities.filter((_, i) => i !== index);
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

    const updatedAmenities = amenities.map((amenity, i) =>
      i === index ? { ...amenity, [field]: limitedValue } : amenity,
    );
    handleAmenitiesChange(updatedAmenities);
  };

  const addDetalle = () => {
    if (newDetalle.trim()) {
      handleDetallesChange([...detalles, { text: newDetalle }]);
      setNewDetalle("");
    }
  };

  const addDetail = () => {
    if (newDetail.trim() && details.length < 20) {
      handleDetailsChange([...details, newDetail.substring(0, 255)]);
      setNewDetail("");
    }
  };

  const removeDetalle = (index: number) => {
    const updatedDetalles = detalles.filter((_, i) => i !== index);
    handleDetallesChange(updatedDetalles);
  };

  const updateDetalle = (index: number, newValue: string) => {
    const limitedValue = newValue.substring(0, 255);
    const updatedDetalles = detalles.map((detalle, i) =>
      i === index ? { text: limitedValue } : detalle,
    );
    handleDetallesChange(updatedDetalles);
  };

  const removeDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    handleDetailsChange(updatedDetails);
  };

  const updateDetail = (index: number, newValue: string) => {
    const limitedValue = newValue.substring(0, 255);
    const updatedDetails = details.map((detail, i) =>
      i === index ? limitedValue : detail,
    );
    handleDetailsChange(updatedDetails);
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
                  value={newAmenity}
                  onChange={(e) => {
                    const newValue = e.target.value.substring(0, 255);
                    setNewAmenity(newValue);
                  }}
                  placeholder="Descripción (ej: Piscina)"
                  disabled={disabled}
                  maxLength={255}
                  className="focus:ring-primaryColor w-full rounded border border-gray-300 p-2 outline-none focus:border-transparent focus:ring-2 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  disabled={disabled || !newAmenity.trim()}
                  className="bg-primaryColor hover:bg-primaryColor/90 flex w-full items-center justify-center gap-2 rounded px-3 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Agregar amenidad
                </button>
              </div>
            </div>

            {/* Lista de amenidades existentes */}
            <div className="space-y-2">
              {amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                >
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

            {amenities.length === 0 && (
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
              {amenities.map((amenity, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <span className="text-primaryColor text-lg">-</span>
                  {amenity.text}
                </li>
              ))}
              {amenities.length === 0 && (
                <li className="text-gray-400 italic">Amenidades a confirmar</li>
              )}
            </ul>
          </div>
        </div>

        {/* CARACTERÍSTICAS ADICIONALES - Sección editable */}
        <div>
          <div className="mb-6">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Características adicionales
            </h3>

            {/* Formulario para nueva característica */}
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newDetalle}
                  onChange={(e) => {
                    const newValue = e.target.value.substring(0, 255);
                    setNewDetalle(newValue);
                  }}
                  placeholder="Característica (ej: Cocina equipada)"
                  disabled={disabled}
                  maxLength={255}
                  className="focus:ring-primaryColor w-full rounded border border-gray-300 p-2 outline-none focus:border-transparent focus:ring-2 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={addDetalle}
                  disabled={disabled || !newDetalle.trim()}
                  className="bg-primaryColor hover:bg-primaryColor/90 flex w-full items-center justify-center gap-2 rounded px-3 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Agregar característica
                </button>
              </div>
            </div>

            {/* Lista de características existentes */}
            <div className="space-y-2">
              {detalles.map((detalle, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                >
                  <input
                    type="text"
                    value={detalle.text}
                    onChange={(e) => updateDetalle(index, e.target.value)}
                    disabled={disabled}
                    maxLength={255}
                    className="flex-1 border-none bg-transparent outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => removeDetalle(index)}
                    disabled={disabled}
                    className="rounded p-1 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {detalles.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No hay características adicionales. Usa el formulario arriba
                para agregar.
              </p>
            )}
          </div>

          {/* Preview de características adicionales */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h4 className="mb-3 font-medium text-gray-900">Vista previa:</h4>
            <ul className="space-y-2">
              {detalles.map((detalle, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <span className="text-primaryColor text-lg">-</span>
                  {detalle.text}
                </li>
              ))}
              {detalles.length === 0 && (
                <li className="text-gray-400 italic">
                  Características adicionales a definir
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* DETAILS - Detalles personalizables del proyecto */}
        <div>
          <div className="mb-6">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Detalles del Proyecto
            </h3>

            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newDetail}
                  onChange={(e) => {
                    const limitedValue = e.target.value.substring(0, 255);
                    setNewDetail(limitedValue);
                  }}
                  placeholder="Agregar detalle del proyecto..."
                  disabled={disabled || details.length >= 20}
                  maxLength={255}
                  className="focus:ring-primaryColor w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-transparent focus:ring-2 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={addDetail}
                  disabled={
                    disabled || !newDetail.trim() || details.length >= 20
                  }
                  className="bg-primaryColor hover:bg-primaryColor/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Detalle {details.length >= 20 && "(Máximo alcanzado)"}
                </button>
                <p className="text-xs text-gray-500">
                  {details.length}/20 detalles • Máximo 255 caracteres por
                  detalle
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {details.map((detail, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={detail}
                      onChange={(e) => updateDetail(index, e.target.value)}
                      disabled={disabled}
                      maxLength={255}
                      className="w-full border-none bg-transparent text-sm outline-none focus:bg-gray-50 disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDetail(index)}
                    disabled={disabled}
                    className="rounded-lg p-1 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Eliminar detalle"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {details.length === 0 && (
                <div className="py-8 text-center text-gray-400 italic">
                  No hay detalles agregados
                </div>
              )}
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
