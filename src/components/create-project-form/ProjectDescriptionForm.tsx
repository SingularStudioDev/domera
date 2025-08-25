'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DescriptionFormProps } from '@/types/project-form';

export const ProjectDescriptionForm: React.FC<DescriptionFormProps> = ({
  value,
  onChange,
  error,
  disabled,
}) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const handleFieldChange = (field: keyof typeof value, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  return (
    <>
      {/* Modal para editar descripción */}
      {isEditingDescription && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Editar Descripción</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción principal
                </label>
                <textarea
                  value={value.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Descripción detallada del proyecto..."
                  disabled={disabled}
                  rows={8}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primaryColor focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción corta
                </label>
                <textarea
                  value={value.shortDescription}
                  onChange={(e) => handleFieldChange('shortDescription', e.target.value)}
                  placeholder="Resumen breve del proyecto..."
                  disabled={disabled}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primaryColor focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsEditingDescription(false)}
                className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-primaryColor/90"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditingDescription(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar dirección */}
      {isEditingAddress && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Editar Dirección</h3>
            <input
              type="text"
              value={value.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              placeholder="Dirección completa del proyecto"
              disabled={disabled}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent outline-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsEditingAddress(false)}
                className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-primaryColor/90"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditingAddress(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
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
              className="mb-8 max-w-[600px] whitespace-pre-line text-black cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={() => !disabled && setIsEditingDescription(true)}
            >
              {value.description || 'Haz clic para agregar descripción...'}
            </p>
          </div>

          <div>
            <div className="flex flex-col">
              <p className="mb-2 font-semibold text-black">Direccion:</p>
              <p 
                className="mb-8 max-w-[600px] whitespace-pre-line text-black cursor-pointer hover:bg-gray-50 p-2 rounded"
                onClick={() => !disabled && setIsEditingAddress(true)}
              >
                {value.address || 'Haz clic para agregar dirección...'}
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
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </>
  );
};