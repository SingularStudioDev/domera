"use client";

import { ImagesData } from "@/types/project-images";
import { useProjectCardImage } from "@/hooks/useProjectImages";

interface ProjectFeature {
  name: string;
  hasFeature: boolean;
}

interface ProjectDisplayData {
  id: string;
  slug: string;
  title: string;
  price: string;
  images: unknown;
  status: string;
  date: string;
  features: ProjectFeature[];
  latitude: number;
  longitude: number;
  neighborhood?: string;
  city?: string;
}

interface ProjectMapCardProps {
  projectData: ProjectDisplayData;
  isSelected: boolean;
  onClick: () => void;
}

export default function ProjectMapCard({
  projectData,
  isSelected,
  onClick,
}: ProjectMapCardProps) {
  const { imageUrl } = useProjectCardImage(projectData.images as ImagesData);

  return (
    <div
      className={`hover:text-primaryColor cursor-pointer overflow-hidden rounded-lg border transition-all duration-200 ${
        isSelected
          ? "border-primaryColor text-primaryColor"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-42 overflow-hidden">
        <img
          src={imageUrl || "/project-fallback.png"}
          alt={projectData.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/project-fallback.png";
          }}
        />
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className="rounded-lg bg-white px-2 py-1 text-xs font-medium shadow-sm">
            {projectData.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="line-clamp-2 font-bold">{projectData.title}</h3>
        <p className="text-sm font-semibold">Desde: {projectData.price}</p>
        <p className="text-sm">{projectData.city}</p>
      </div>
    </div>
  );
}

export type { ProjectDisplayData, ProjectFeature };
