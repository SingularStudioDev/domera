'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { DetailsFormProps } from '@/types/project-form';

export const ProjectDetailsForm: React.FC<DetailsFormProps> = ({
  value,
  onChange,
  error,
  disabled,
}) => {
  const [newAmenity, setNewAmenity] = useState({ icon: '', text: '' });

  const handleAmenitiesChange = (newAmenities: Array<{icon: string; text: string}>) => {
    onChange({
      ...value,
      amenities: newAmenities
    });
  };

  const addAmenity = () => {
    if (newAmenity.icon.trim() && newAmenity.text.trim()) {
      handleAmenitiesChange([...value.amenities, { ...newAmenity }]);
      setNewAmenity({ icon: '', text: '' });
    }
  };

  const removeAmenity = (index: number) => {
    const updatedAmenities = value.amenities.filter((_, i) => i !== index);
    handleAmenitiesChange(updatedAmenities);
  };

  const updateAmenity = (index: number, field: 'icon' | 'text', newValue: string) => {
    const updatedAmenities = value.amenities.map((amenity, i) => 
      i === index ? { ...amenity, [field]: newValue } : amenity
    );
    handleAmenitiesChange(updatedAmenities);
  };

  return (
    <div className="py-5">
      <div className="grid gap-8 md:grid-cols-3">
        
        {/* AMENIDADES - Sección editable */}
        <div>
          <div className="mb-6">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">Amenidades</h3>
            
            {/* Formulario para nueva amenidad */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newAmenity.icon}
                  onChange={(e) => setNewAmenity(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="Emoji o ícono (ej: 🏊‍♀️)"
                  disabled={disabled}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primaryColor focus:border-transparent outline-none disabled:opacity-50"
                />
                <input
                  type="text"
                  value={newAmenity.text}
                  onChange={(e) => setNewAmenity(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Descripción (ej: Piscina)"
                  disabled={disabled}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primaryColor focus:border-transparent outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  disabled={disabled || !newAmenity.icon.trim() || !newAmenity.text.trim()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primaryColor text-white rounded hover:bg-primaryColor/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar amenidad
                </button>
              </div>
            </div>

            {/* Lista de amenidades existentes */}
            <div className="space-y-2">
              {value.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    value={amenity.icon}
                    onChange={(e) => updateAmenity(index, 'icon', e.target.value)}
                    disabled={disabled}
                    className="w-10 text-center border-none bg-transparent outline-none disabled:opacity-50"
                  />
                  <input
                    type="text"
                    value={amenity.text}
                    onChange={(e) => updateAmenity(index, 'text', e.target.value)}
                    disabled={disabled}
                    className="flex-1 border-none bg-transparent outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    disabled={disabled}
                    className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {value.amenities.length === 0 && (
              <p className="text-gray-500 text-sm italic">
                No hay amenidades agregadas. Usa el formulario arriba para agregar.
              </p>
            )}
          </div>

          {/* Preview de amenidades */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Vista previa:</h4>
            <ul className="space-y-2">
              {value.amenities.map((amenity, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-700">
                  <span className="text-primaryColor text-lg">{amenity.icon || '•'}</span>
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
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Características adicionales</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 italic">
              Esta sección se expandirá en futuras versiones para incluir características específicas del proyecto.
            </p>
            <div className="mt-4 p-3 bg-white border border-gray-200 rounded">
              <p className="text-gray-700">Características adicionales a definir</p>
            </div>
          </div>
        </div>

        {/* INVERSIÓN - Contenido estático informativo */}
        <div>
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Inversión</h3>
          <div className="space-y-4">
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Ley 18.795</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primaryColor rounded-full"></div>
                  Exoneración de impuestos nacionales
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primaryColor rounded-full"></div>
                  Beneficios fiscales por hasta 10 años
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primaryColor rounded-full"></div>
                  Inversión mínima desde USD 100.000
                </li>
              </ul>
            </div>

            <div className="p-4 bg-primaryColor/10 border border-primaryColor/20 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Importante:</strong> Los beneficios fiscales están sujetos a verificación legal y pueden variar según la situación particular de cada inversor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};