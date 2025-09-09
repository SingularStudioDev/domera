"use client";

import React, { useCallback, useRef, useState } from "react";

import { ImageIcon, Loader2 } from "lucide-react";

import type { MasterPlanFile } from "@/types/project-form";
import { uploadProjectDocuments } from "@/lib/actions/storage";
import { validateDocumentFiles } from "@/lib/utils/images";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OptimizedImageUpload } from "@/components/image-upload";

interface ProjectMainImageFormProps {
  value: {
    images: string[];
    name: string;
  };
  onChange: (data: { images: string[] }) => void;
  masterPlanFiles: MasterPlanFile[];
  onMasterPlanFilesChange: (files: MasterPlanFile[]) => void;
  disabled?: boolean;
  error?: string;
  projectId?: string;
}

interface ProjectMainImageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  value: {
    images: string[];
    name: string;
  };
  onChange: (data: { images: string[] }) => void;
  disabled?: boolean;
  projectId?: string;
}

function ProjectMainImageDialog({
  isOpen,
  onOpenChange,
  value,
  onChange,
  disabled = false,
  projectId,
}: ProjectMainImageDialogProps) {
  const handleMainImageChange = (imageUrls: string[]) => {
    const newImages = [...value.images];

    if (imageUrls.length > 0) {
      if (newImages.length < 2) {
        if (newImages.length === 0) newImages.push("");
        newImages.push(imageUrls[0]);
      } else {
        newImages[1] = imageUrls[0];
      }
    } else {
      if (newImages.length >= 2) {
        newImages.splice(1, 1);
      }
    }

    onChange({ images: newImages });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Imagen Principal del Proyecto</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-md mb-3 font-medium">
              Seleccionar Imagen Principal
            </h4>
            <OptimizedImageUpload
              value={
                value.images.length >= 2 && value.images[1]
                  ? [value.images[1]]
                  : []
              }
              onChange={handleMainImageChange}
              entityType="project"
              maxImages={1}
              placeholder="Seleccionar imagen principal"
              aspectRatio="aspect-video"
              disabled={disabled}
              showUploadButton={true}
              entityId={projectId}
              deferUpload={true}
            />
            <p className="mt-2 text-xs text-gray-500">
              Esta imagen aparecerá en las tarjetas de proyecto y será la imagen
              principal.
            </p>
          </div>

          <div>
            <h4 className="text-md mb-3 font-medium">
              Vista Previa en ProjectCard
            </h4>
            <div className="relative block overflow-hidden rounded-3xl border bg-white transition-shadow duration-300">
              <div className="group relative h-[300px] overflow-hidden">
                {value.images.length >= 2 && value.images[1] ? (
                  <img
                    src={value.images[1]}
                    alt={value.name || "Vista previa"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                    <div className="text-center text-gray-500">
                      <svg
                        className="mx-auto mb-2 h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm">No hay imagen seleccionada</p>
                    </div>
                  </div>
                )}

                <div className="absolute top-3 left-3 flex gap-2 text-black">
                  <span className="rounded-2xl bg-white px-4 py-1 text-lg shadow-sm">
                    Pre-venta
                  </span>
                  <span className="rounded-2xl bg-white px-4 py-1 text-lg shadow-sm">
                    2024
                  </span>
                </div>

                <div className="absolute bottom-0 flex w-full items-end gap-5">
                  <div className="relative flex w-full flex-col gap-2 bg-white py-3 pr-4 pl-6 text-black">
                    <h3 className="w-full bg-white text-2xl font-medium">
                      {value.name || "Nombre del Proyecto"}
                    </h3>
                    <p className="w-full bg-white text-lg">Desde: $XXX.XXX</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectMainImageForm({
  value,
  onChange,
  masterPlanFiles,
  onMasterPlanFilesChange,
  disabled = false,
  error,
  projectId,
}: ProjectMainImageFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0 || disabled || isUploading) return;

      const file = files[0];
      const { valid, invalid } = validateDocumentFiles([file]);

      if (invalid.length > 0) {
        setUploadError(`Archivo inválido: ${invalid[0].reason}`);
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append("document-0", file);

        const result = await uploadProjectDocuments(formData, projectId);

        if (result.success && result.documents && result.documents[0]) {
          const newFile: MasterPlanFile = {
            id: result.documents[0].id,
            name: result.documents[0].name,
            url: result.documents[0].url,
            path: result.documents[0].path,
            size: file.size,
          };

          // Usar unshift para colocar al principio
          const updatedFiles = [...masterPlanFiles];
          updatedFiles.unshift(newFile);
          onMasterPlanFilesChange(updatedFiles);
        } else {
          setUploadError(result.error || "Error al subir el archivo");
        }
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Error de conexión al subir el archivo");
      } finally {
        setIsUploading(false);
        // Reset input value
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [
      disabled,
      isUploading,
      masterPlanFiles,
      onMasterPlanFilesChange,
      projectId,
    ],
  );

  return (
    <>
      <ProjectMainImageDialog
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        value={value}
        onChange={onChange}
        disabled={disabled}
        projectId={projectId}
      />

      {/* Card para imagen principal */}
      <div className="flex gap-5">
        <div>
          <p className="mb-2 font-semibold">Imágen preview</p>
          <div className="h-[567px] w-full max-w-sm rounded-2xl bg-white shadow-sm">
            {/* Imagen actual o placeholder */}
            <div
              className="relative h-full overflow-hidden rounded-2xl border"
              onClick={() => setIsEditing(true)}
            >
              {value.images.length >= 2 && value.images[1] ? (
                <img
                  src={value.images[1]}
                  alt={value.name || "Imagen principal"}
                  className="h-full w-full cursor-pointer rounded-2xl object-cover"
                  onClick={() => !disabled && setIsEditing(true)}
                />
              ) : (
                <div
                  className="flex h-full w-full cursor-pointer items-center justify-center bg-gray-100 p-4 px-6"
                  onClick={() => !disabled && setIsEditing(true)}
                >
                  <div className="flex flex-col items-center justify-center gap-3 text-center text-gray-500">
                    <ImageIcon
                      className="h-20 w-20 text-gray-300"
                      strokeWidth={1.5}
                    />
                    <div>
                      <p className="text-sm">
                        Haz clic para seleccionar la imagen principal
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Esta imagen aparecerá en las tarjetas de proyecto
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-sm">
          <p className="mb-2 font-semibold">Brochure del proyecto</p>
          <div className="rounded-2xl border border-dashed border-gray-300 px-16 py-8 text-center">
            <p className="mb-4 text-sm text-black">
              Arrastra el archivo o selecciona desde tu dispositivo
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              id="brochure-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
            />
            <label
              htmlFor="brochure-upload"
              className={`border-primaryColor text-primaryColor hover:bg-primaryColor cursor-pointer rounded-full border bg-white px-6 py-2 transition-colors hover:text-white ${
                disabled || isUploading ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo...
                </span>
              ) : (
                "Cargar archivo"
              )}
            </label>
          </div>

          {/* Error message */}
          {uploadError && (
            <div className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">
              {uploadError}
            </div>
          )}

          {/* Show current brochure if exists */}
          {masterPlanFiles.length > 0 && masterPlanFiles[0] && (
            <div className="mt-3 rounded bg-green-50 p-3">
              <p className="text-sm font-medium text-green-700">
                Brochure actual:
              </p>
              <p className="truncate text-xs text-green-600">
                {masterPlanFiles[0].name}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
