"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import type { MasterPlanFile } from "@/types/project-form";

interface ProjectInfoProps {
  masterPlanFiles: MasterPlanFile[];
}

export default function ProjectInfo({ masterPlanFiles }: ProjectInfoProps) {
  return (
    <div className="container mx-auto mb-10 flex h-[10dvh] flex-col items-start justify-between gap-4 px-4 transition-colors duration-300 md:flex-row md:items-center md:gap-0 md:px-0">
      <Link
        href="/projects"
        className="text-primaryColor hover:text-primaryColor-hover inline-flex items-center gap-2 font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a lista de proyectos
      </Link>

      <button 
        className="text-primaryColor hover:text-primaryColor-hover cursor-pointer font-medium"
        onClick={() => {
          // Descargar el primer master plan file [0]
          if (masterPlanFiles.length > 0) {
            const firstFile = masterPlanFiles[0];
            const link = document.createElement("a");
            link.href = firstFile.url;
            link.download = firstFile.name;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }}
        disabled={!masterPlanFiles.length}
      >
        Descargar PDF
      </button>
    </div>
  );
}
