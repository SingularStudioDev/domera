import { Download, ExternalLink, FileText } from "lucide-react";

import StaticMap from "@/components/custom-ui/StaticMap";
import type { MasterPlanFile } from "@/types/project-form";

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
          {masterPlanFiles.length > 0
            ? masterPlanFiles.map((file, index) => (
                <div
                  key={file.id}
                  className={`${index === 0 ? "border-t" : ""} flex items-center justify-between border-b border-gray-300 p-4 text-black transition duration-300 hover:bg-gray-50`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      {file.size && (
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleFileOpen(file)}
                      className="rounded p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Abrir archivo"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleFileDownload(file)}
                      className="rounded p-2 text-green-600 hover:bg-green-50 transition-colors"
                      title="Descargar archivo"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            : <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Proximamente</p>
              </div>}
        </div>
      </div>
    </div>
  );
}
