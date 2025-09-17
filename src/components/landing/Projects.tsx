"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/utils/utils";
import type { Project } from "@prisma/client";

import type { ImagesData } from "@/types/project-images";
import { getPublicProjectsAction } from "@/lib/actions/projects";

import MainButton from "../custom-ui/MainButton";
import ProjectCardWithImages from "./ProjectCardWithImages";

interface ProjectsProps {
  limit?: number;
  showLoadMore?: boolean;
}

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

/**
 * Formats a project from the database for display in the UI
 * Extracts features, formats pricing, dates, and images
 */
const formatProjectForDisplay = (project: Project): ProjectDisplayData => {
  const price = project.basePrice
    ? formatCurrency(Number(project.basePrice))
    : "Consultar precio";

  const status = project.neighborhood || project.city;
  const date = project.estimatedCompletion
    ? new Date(project.estimatedCompletion).toLocaleDateString("es-UY", {
        month: "short",
        year: "numeric",
      })
    : "Fecha TBD";

  // Images data will be processed by the ProjectCardWrapper component

  // Create features array from boolean fields
  const projectWithFeatures = project as Project & {
    hasParking?: boolean;
    hasStudio?: boolean;
    has1Bedroom?: boolean;
    has2Bedroom?: boolean;
    has3Bedroom?: boolean;
    has4Bedroom?: boolean;
    has5Bedroom?: boolean;
    hasCommercial?: boolean;
  };

  const features: ProjectFeature[] = [
    { name: "parking", hasFeature: projectWithFeatures.hasParking || false },
    { name: "studio", hasFeature: projectWithFeatures.hasStudio || false },
    { name: "1_bedroom", hasFeature: projectWithFeatures.has1Bedroom || false },
    { name: "2_bedroom", hasFeature: projectWithFeatures.has2Bedroom || false },
    { name: "3_bedroom", hasFeature: projectWithFeatures.has3Bedroom || false },
    { name: "4_bedroom", hasFeature: projectWithFeatures.has4Bedroom || false },
    { name: "5_bedroom", hasFeature: projectWithFeatures.has5Bedroom || false },
    {
      name: "commercial",
      hasFeature: projectWithFeatures.hasCommercial || false,
    },
  ];

  return {
    id: project.id,
    title: project.name,
    slug: project.slug,
    price,
    images: project.images as ImagesData, // Cast JsonValue to ImagesData
    status,
    date,
    features,
  };
};

export default function Projects({
  limit = 7,
  showLoadMore = true,
}: ProjectsProps = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const projectsResult = await getPublicProjectsAction({
          page: 1,
          pageSize: limit,
        });

        if (projectsResult.success && projectsResult.data) {
          setProjects(projectsResult.data.data);
        } else {
          setProjects([]);
          setError(projectsResult.error || 'Error al cargar proyectos');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar proyectos');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [limit]);

  if (loading) {
    return (
      <section className="px-4 pb-10 md:px-0 md:pb-16">
        <div className="container mx-auto">
          <h2 className="dashboard-title">Proyectos</h2>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || projects.length === 0) {
    return (
      <section className="px-4 pb-10 md:px-0 md:pb-16">
        <div className="container mx-auto">
          <h2 className="dashboard-title">Proyectos</h2>
          <p className="text-center text-gray-600">
            {error || "No hay proyectos disponibles en este momento."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 pb-10 md:px-0 md:pb-16">
      <div className="container mx-auto">
        {/* Section Header */}

        <h2 className="dashboard-title mb-6">Proyectos</h2>

        {/* Projects Grid */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const projectData = formatProjectForDisplay(project);

            return (
              <div
                key={project.id}
                className={index === 0 ? "col-span-full" : ""}
              >
                <ProjectCardWithImages projectData={projectData} />
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {showLoadMore && (
          <div className="mx-auto flex w-full items-center justify-center text-center">
            <MainButton href="/projects" showArrow>
              Proyectos
            </MainButton>
          </div>
        )}
      </div>
    </section>
  );
}
