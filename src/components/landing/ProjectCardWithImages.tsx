"use client";

import { useProjectCardImage } from "@/hooks/useProjectImages";
import type { ImagesData } from "@/types/project-images";

import ProjectCard from "../custom-ui/ProjectCard";

interface ProjectFeature {
  name: string;
  hasFeature: boolean;
}

interface ProjectDisplayData {
  id: string;
  slug: string;
  title: string;
  price: string;
  images: ImagesData;
  status: string;
  date: string;
  features: ProjectFeature[];
}

interface ProjectCardWithImagesProps {
  projectData: ProjectDisplayData;
}

export default function ProjectCardWithImages({
  projectData,
}: ProjectCardWithImagesProps) {
  const { imageUrl } = useProjectCardImage(projectData.images);

  return (
    <ProjectCard
      slug={projectData.slug}
      title={projectData.title}
      price={projectData.price}
      image={imageUrl}
      status={projectData.status}
      date={projectData.date}
      features={projectData.features}
    />
  );
}