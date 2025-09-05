"use client";

import { useEffect, useState } from "react";

import { formatCurrency } from "@/utils/utils";
import type { Project } from "@prisma/client";

import { getPublicProjectsAction } from "@/lib/actions/projects";
import ProjectCard from "@/components/custom-ui/ProjectCard";

interface ProjectFeature {
  name: string;
  hasFeature: boolean;
}

interface ProjectDisplayData {
  id: string;
  slug: string;
  title: string;
  price: string;
  image: string;
  status: string;
  date: string;
  features: ProjectFeature[];
}

interface ProjectsListProps {
  page?: number;
  pageSize?: number;
  city?: string;
  neighborhood?: string;
  status?: "pre_sale" | "construction" | "completed";
  rooms?: string;
  amenities?: string;
  minPrice?: string;
  maxPrice?: string;
}

/**
 * Formats a project from the database for display in the UI
 * Extracts features, formats pricing, dates, and images
 */
const formatProjectForDisplay = (project: Project): ProjectDisplayData => {
  const price = project.basePrice
    ? formatCurrency(parseFloat(project.basePrice.toString()), project.currency)
    : "Consultar precio";

  const status = project.neighborhood || project.city;
  const date = project.estimatedCompletion
    ? new Date(project.estimatedCompletion).toLocaleDateString("es-UY", {
        month: "short",
        year: "numeric",
      })
    : "Fecha TBD";

  // Use second image from project images array (index 1) for ProjectCard
  const projectImages = Array.isArray(project.images) 
    ? project.images.filter((img): img is string => typeof img === 'string') 
    : [];
  const image = projectImages.length >= 2 && projectImages[1] 
    ? projectImages[1] 
    : projectImages.length > 0 
      ? projectImages[0] 
      : `/images/${project.slug}-main.png`;

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
    image,
    status,
    date,
    features,
  };
};

export default function ProjectsList({
  page = 1,
  pageSize = 50,
  city,
  neighborhood,
  status,
  rooms,
  amenities,
  minPrice,
  maxPrice,
}: ProjectsListProps = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("projec", projects);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const projectsResult = await getPublicProjectsAction({
          page,
          pageSize,
          city,
          neighborhood,
          status,
          ...(minPrice && { minPrice: parseFloat(minPrice) }),
          ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
        });

        if (projectsResult.success && projectsResult.data) {
          const data = projectsResult.data as {
            data: Project[];
            count: number;
          };
          setProjects(data.data);
          setTotalCount(data.count);
        } else {
          setProjects([]);
          setTotalCount(0);
          setError(projectsResult.error || "Error al cargar proyectos");
        }
      } catch (err) {
        setError("Error al cargar los proyectos");
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [
    page,
    pageSize,
    city,
    neighborhood,
    status,
    rooms,
    amenities,
    minPrice,
    maxPrice,
  ]);

  if (loading) {
    return (
      <div className="mb-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-[567px] rounded-3xl bg-gray-200 md:h-[547px]"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="mx-auto max-w-md">
          <h3 className="mb-4 text-xl font-semibold text-red-600">
            Error al cargar proyectos
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            No hay proyectos disponibles
          </h3>
          <p className="text-gray-600">
            No encontramos proyectos que coincidan con los filtros
            seleccionados. Intenta ajustar los criterios de búsqueda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => {
          const projectData = formatProjectForDisplay(project);

          return (
            <div
              key={project.id}
              className={
                index === projects.length - 1 && projects.length % 3 === 1
                  ? "col-span-full mx-auto max-w-md"
                  : ""
              }
            >
              <ProjectCard
                slug={projectData.slug}
                title={projectData.title}
                price={projectData.price}
                image={projectData.image}
                status={projectData.status}
                date={projectData.date}
                features={projectData.features}
              />
            </div>
          );
        })}
      </div>

      {/* Pagination Info */}
      {totalCount > projects.length && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Mostrando {projects.length} de {totalCount} proyectos
          </p>
        </div>
      )}
    </div>
  );
}
