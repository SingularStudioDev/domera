"use client";

import { Download, ExternalLink, FileText } from "lucide-react";

import type { MasterPlanFile } from "@/types/project-form";
import StaticMap from "@/components/custom-ui/StaticMap";

interface ProjectLocationProps {
  masterPlanFiles: MasterPlanFile[];
  latitude?: number | null;
  longitude?: number | null;
  projectName?: string;
}

export default function ProjectLocation({
  masterPlanFiles,
  latitude,
  longitude,
  projectName = "Proyecto",
}: ProjectLocationProps) {
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFileOpen = (file: MasterPlanFile) => {
    window.open(file.url, "_blank", "noopener,noreferrer");
  };

  const handleFileDownload = (file: MasterPlanFile) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex w-full flex-col items-start md:flex-row md:gap-10">
      <div className="w-full">
        <h3 className="mb-6 text-3xl font-semibold text-black">Ubicación</h3>
        <div className="mb-8">
          {latitude !== null && longitude !== null && latitude && longitude ? (
            <StaticMap
              latitude={Number(latitude)}
              longitude={Number(longitude)}
              height="400px"
              markerPopup={`Ubicación de ${projectName}`}
              className="md:h-[400px]"
            />
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-2xl border border-gray-300 bg-gray-50 md:h-[400px]">
              <div className="text-center text-gray-500">
                <p className="text-sm">Ubicación no disponible</p>
                <p className="text-xs">Coordenadas no especificadas</p>
                <p className="mt-2 text-xs">
                  lat: {latitude}, lng: {longitude}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full">
        <h3 className="mb-6 text-3xl font-semibold text-black">Master plan</h3>
        <div className="space-y-0">
          {masterPlanFiles.length > 0 ? (
            masterPlanFiles.map((file, index) => (
              <button
                onClick={() => handleFileOpen(file)}
                type="submit"
                key={file.id}
                className={`${index === 0 ? "border-t" : ""} hover:text-primaryColor group flex w-full cursor-pointer items-center justify-between border-b border-black py-3 text-start text-black transition duration-300`}
              >
                <div className="flex flex-1 items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{file.name}</p>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-2">
                  <div
                    className="cursor-pointer rounded p-2"
                    title="Abrir archivo"
                  >
                    <ExternalLink strokeWidth={1.8} className="h-5 w-5" />
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p>Proximamente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
