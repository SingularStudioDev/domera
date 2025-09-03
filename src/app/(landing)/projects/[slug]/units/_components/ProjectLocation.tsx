import { SquareArrowOutUpRightIcon } from "lucide-react";

import StaticMap from "@/components/custom-ui/StaticMap";

interface ProjectLocationProps {
  planFiles: string[];
  latitude?: number | null;
  longitude?: number | null;
  projectName?: string;
}

export default function ProjectLocation({
  planFiles,
  latitude,
  longitude,
  projectName = "Proyecto",
}: ProjectLocationProps) {
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

      {/* TODO: Revisar que esto funcione con una seed mejor */}
      <div className="w-full">
        <h3 className="mb-6 text-3xl font-semibold text-black">Master plan</h3>
        <div className="space-y-0">
          {planFiles.length > 0
            ? planFiles.map((file, index) => (
                <div
                  key={index}
                  className={`${index === 0 ? "border-t" : ""} hover:text-primaryColor flex cursor-pointer items-center justify-between border-b border-gray-300 p-4 text-black transition duration-300`}
                >
                  <span className="font-medium">{file}</span>
                  <button className="cursor-pointer text-xl">
                    <SquareArrowOutUpRightIcon className="h-5 w-5" />
                  </button>
                </div>
              ))
            : "Proximamente"}
        </div>
      </div>
    </div>
  );
}
