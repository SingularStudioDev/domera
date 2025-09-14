"use client";

import { useCallback, useRef, useState } from "react";

import { ImageIcon, Loader2 } from "lucide-react";

import type { MasterPlanFile } from "@/types/project-form";
import { ProjectImage } from "@/types/project-images";
import { uploadProjectDocuments } from "@/lib/actions/storage";
import { validateDocumentFiles } from "@/lib/utils/images";
import { useProjectImages } from "@/hooks/useProjectImages";

import { ProjectMainImageDialog, ProjectBuilderImageDialog } from "./UploadImageDialog";

interface CreateProjectUploadProps {
  value: {
    images: string[] | ProjectImage[];
    name: string;
  };
  onChange: (data: { images: string[] | ProjectImage[] }) => void;
  onCardImageChange?: (files: File[]) => void;
  onBuilderImageChange?: (files: File[]) => void;
  masterPlanFiles: MasterPlanFile[];
  onMasterPlanFilesChange: (files: MasterPlanFile[]) => void;
  disabled?: boolean;
  error?: string;
  projectId?: string;
}

export function CreateProjectUpload({
  value,
  onChange,
  onCardImageChange,
  onBuilderImageChange,
  masterPlanFiles,
  onMasterPlanFilesChange,
  disabled = false,
  error,
  projectId,
}: CreateProjectUploadProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingBuilder, setIsEditingBuilder] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { cardImage, builderImage } = useProjectImages(value.images);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0 || disabled || isUploading) return;

      const file = files[0];
      const { invalid } = validateDocumentFiles([file]);

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
      {/* Cards para imágenes */}
      <div className="flex gap-5">
        {/* Imagen principal */}
        <div>
          <p className="mb-2 font-semibold">Imágen preview</p>
          <div className="h-[567px] w-full max-w-sm rounded-2xl bg-white shadow-sm">
            {/* Imagen actual o placeholder */}
            <div
              className="relative h-full overflow-hidden rounded-2xl border"
              onClick={() => setIsEditing(true)}
            >
              {cardImage ? (
                <img
                  src={cardImage.url}
                  alt={
                    cardImage.metadata?.altText ||
                    value.name ||
                    "Imagen principal"
                  }
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

        {/* Logo de la constructora */}
        <div>
          <p className="mb-2 font-semibold">Logo de la constructora</p>
          <div className="h-[280px] w-full max-w-[280px] rounded-2xl bg-white shadow-sm">
            <div
              className="relative h-full cursor-pointer overflow-hidden rounded-2xl border"
              onClick={() => setIsEditingBuilder(true)}
            >
              {builderImage ? (
                <img
                  src={builderImage.url}
                  alt="Logo de la constructora"
                  className="h-full w-full cursor-pointer rounded-2xl object-contain p-4"
                  onClick={() => !disabled && setIsEditingBuilder(true)}
                />
              ) : (
                <div
                  className="flex h-full w-full cursor-pointer items-center justify-center bg-gray-100 p-4"
                  onClick={() => !disabled && setIsEditingBuilder(true)}
                >
                  <div className="flex flex-col items-center justify-center gap-3 text-center text-gray-500">
                    <ImageIcon
                      className="h-16 w-16 text-gray-300"
                      strokeWidth={1.5}
                    />
                    <div>
                      <p className="text-sm">Haz clic para agregar logo</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Logo de la constructora del proyecto
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
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

      <ProjectMainImageDialog
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        value={value}
        onChange={onChange}
        onCardImageChange={onCardImageChange}
        disabled={disabled}
        projectId={projectId}
      />

      <ProjectBuilderImageDialog
        isOpen={isEditingBuilder}
        onOpenChange={setIsEditingBuilder}
        value={value}
        onChange={onChange}
        onBuilderImageChange={onBuilderImageChange}
        disabled={disabled}
        projectId={projectId}
      />
    </>
  );
}
