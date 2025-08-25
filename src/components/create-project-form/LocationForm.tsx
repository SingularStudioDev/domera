'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ExternalLink } from 'lucide-react';
import { LocationFormProps } from '@/types/project-form';

// Importar el mapa de manera dinámica para evitar problemas con SSR
const InteractiveMap = dynamic(
  () => import('@/components/custom-ui/InteractiveMap'),
  { 
    ssr: false,
    loading: () => <div className="w-full h-[200px] md:h-[500px] bg-gray-100 rounded-lg animate-pulse" />
  }
);

export const LocationFormComponent: React.FC<LocationFormProps> = ({
  value,
  onChange,
  projectName,
  disabled,
  error,
}) => {
  const [isEditingCoordinates, setIsEditingCoordinates] = useState(false);
  const [isEditingMasterPlan, setIsEditingMasterPlan] = useState(false);
  const [newMasterPlanFile, setNewMasterPlanFile] = useState('');

  const handleFieldChange = (field: keyof typeof value, newValue: any) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  const addMasterPlanFile = () => {
    if (newMasterPlanFile.trim()) {
      handleFieldChange('masterPlanFiles', [...value.masterPlanFiles, newMasterPlanFile.trim()]);
      setNewMasterPlanFile('');
    }
  };

  const removeMasterPlanFile = (index: number) => {
    const updatedFiles = value.masterPlanFiles.filter((_, i) => i !== index);
    handleFieldChange('masterPlanFiles', updatedFiles);
  };

  return (
    <>
      {/* Modal para editar coordenadas */}
      {isEditingCoordinates && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Editar Ubicación</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitud
                </label>
                <input
                  type="number"
                  step="any"
                  value={value.latitude || ''}
                  onChange={(e) => handleFieldChange('latitude', e.target.value ? Number(e.target.value) : null)}
                  placeholder="-34.9011"
                  disabled={disabled}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitud
                </label>
                <input
                  type="number"
                  step="any"
                  value={value.longitude || ''}
                  onChange={(e) => handleFieldChange('longitude', e.target.value ? Number(e.target.value) : null)}
                  placeholder="-56.1645"
                  disabled={disabled}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsEditingCoordinates(false)}
                className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-primaryColor/90"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditingCoordinates(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar master plan */}
      {isEditingMasterPlan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Editar Archivos Master Plan</h3>
            
            {/* Agregar nuevo archivo */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMasterPlanFile}
                  onChange={(e) => setNewMasterPlanFile(e.target.value)}
                  placeholder="URL del archivo (ej: https://ejemplo.com/masterplan.pdf)"
                  disabled={disabled}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primaryColor focus:border-transparent outline-none"
                />
                <button
                  onClick={addMasterPlanFile}
                  disabled={disabled || !newMasterPlanFile.trim()}
                  className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-primaryColor/90 disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Lista de archivos existentes */}
            <div className="space-y-2">
              {value.masterPlanFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 text-sm truncate">{file}</span>
                  <button
                    onClick={() => removeMasterPlanFile(index)}
                    disabled={disabled}
                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              {value.masterPlanFiles.length === 0 && (
                <p className="text-gray-500 text-sm italic p-4 text-center">
                  No hay archivos de master plan. Usa el campo arriba para agregar.
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsEditingMasterPlan(false)}
                className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-primaryColor/90"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditingMasterPlan(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Componente principal - EXACTAMENTE igual al original ProjectLocation */}
      <div className="py-5">
        <div className="grid gap-8 md:grid-cols-2">
          
          {/* UBICACIÓN */}
          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-900">Ubicación</h3>
            
            {/* Mapa */}
            <div className="relative">
              {value.latitude && value.longitude ? (
                <div 
                  className="cursor-pointer"
                  onClick={() => !disabled && setIsEditingCoordinates(true)}
                >
                  <InteractiveMap
                    latitude={value.latitude}
                    longitude={value.longitude}
                    projectName={projectName}
                    className="w-full h-[200px] md:h-[500px] rounded-lg"
                  />
                  {/* Overlay para indicar que es editable */}
                  {!disabled && (
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 bg-white/90 rounded-lg px-4 py-2 text-gray-900 font-medium">
                        Haz clic para editar coordenadas
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="w-full h-[200px] md:h-[500px] bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => !disabled && setIsEditingCoordinates(true)}
                >
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📍</div>
                    <p className="font-medium">Ubicación no disponible</p>
                    {!disabled && (
                      <p className="text-sm">Haz clic para agregar coordenadas</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MASTER PLAN */}
          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-900">Master plan</h3>
            
            <div className="space-y-3">
              {value.masterPlanFiles.length > 0 ? (
                value.masterPlanFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <ExternalLink className="w-4 h-4 text-primaryColor" />
                    <a
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-primaryColor hover:underline truncate"
                    >
                      Ver master plan {index + 1}
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="font-medium">No hay archivos de master plan</p>
                </div>
              )}
              
              {!disabled && (
                <button
                  onClick={() => setIsEditingMasterPlan(true)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primaryColor hover:bg-primaryColor/5 transition-colors text-gray-600 hover:text-primaryColor"
                >
                  + Agregar archivos de master plan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </>
  );
};