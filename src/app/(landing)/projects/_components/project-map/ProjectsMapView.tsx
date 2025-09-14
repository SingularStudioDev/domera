"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import type { Project } from "@prisma/client";

import { getPublicProjectsAction } from "@/lib/actions/projects";

import MapLoading from "./MapLoading";
import ProjectMapSidebar from "./ProjectMapSidebar";
import type {
  ProjectDisplayData,
  ProjectMarker,
  ProjectsMapViewProps,
} from "./types";
import { useProjectMapHandlers } from "./useProjectMapHandlers";
import {
  calculateMapCenter,
  calculateZoom,
  filterProjectsWithValidCoordinates,
  formatProjectForDisplay,
} from "./utils";

// Dynamically import the map component to avoid SSR issues
const InteractiveMap = dynamic(
  () => import("@/components/custom-ui/InteractiveMap"),
  {
    ssr: false,
    loading: () => <MapLoading />,
  },
);

/**
 * Map view component that displays projects on an interactive map
 * Shows project markers with popups and a sidebar with project details
 */
export default function ProjectsMapView({
  searchParams,
}: ProjectsMapViewProps) {
  const [projects, setProjects] = useState<ProjectDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedProject, handleMarkerClick, handleProjectCardClick } =
    useProjectMapHandlers();

  // Parse search params
  const page = parseInt(searchParams.page || "1", 10);
  const neighborhood = searchParams.neighborhood;
  const city = searchParams.city;

  // Validate status to prevent invalid enum values
  const validStatuses: Array<"pre_sale" | "construction" | "completed"> = [
    "pre_sale",
    "construction",
    "completed",
  ];
  const status = validStatuses.includes(
    searchParams.status as "pre_sale" | "construction" | "completed",
  )
    ? searchParams.status
    : undefined;

  const rooms = searchParams.rooms;
  const amenities = searchParams.amenities;
  const minPrice = searchParams.minPrice;
  const maxPrice = searchParams.maxPrice;
  const pageSize = 20;

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

          console.log("Raw projects from DB:", data.data);
          console.log(
            "Projects with coordinates:",
            data.data.filter((p) => p.latitude && p.longitude),
          );

          const formattedProjects = data.data.map(formatProjectForDisplay);
          console.log("Formatted projects:", formattedProjects);
          console.log(
            "Formatted projects with coordinates:",
            formattedProjects.filter((p) => p.latitude && p.longitude),
          );

          setProjects(formattedProjects);
        } else {
          setProjects([]);
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
  }, [page, city, neighborhood, status, rooms, amenities, minPrice, maxPrice]);

  if (loading) {
    return <MapLoading />;
  }

  if (error) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center rounded-lg border bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">
            Error al cargar el mapa
          </p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const projectsWithValidCoordinates =
    filterProjectsWithValidCoordinates(projects);

  console.log(
    "Projects after coordinate filtering:",
    projectsWithValidCoordinates.length,
  );

  if (projects.length === 0) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center rounded-lg border bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">
            No hay proyectos para mostrar
          </p>
          <p className="text-sm text-gray-600">
            No se encontraron proyectos que coincidan con los filtros
            seleccionados.
          </p>
        </div>
      </div>
    );
  }

  if (projectsWithValidCoordinates.length === 0) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center rounded-lg border bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">
            No hay proyectos con ubicación para mostrar
          </p>
          <p className="text-sm text-gray-600">
            Los proyectos encontrados no tienen coordenadas válidas para mostrar
            en el mapa.
          </p>
        </div>
      </div>
    );
  }

  // Convert projects to markers for the map
  const projectMarkers: ProjectMarker[] = projectsWithValidCoordinates.map(
    (project) => ({
      id: project.id,
      latitude: project.latitude,
      longitude: project.longitude,
      title: project.title,
      popup: `${project.title} - ${project.price}`,
      isSelected: selectedProject?.id === project.id,
    }),
  );

  const mapCenter = calculateMapCenter(projectsWithValidCoordinates);
  const mapZoom = calculateZoom(projectsWithValidCoordinates);

  return (
    <div className="mb-16">
      {/* Map and Sidebar Layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar with Projects Grid */}
        <ProjectMapSidebar
          projects={projectsWithValidCoordinates}
          selectedProject={selectedProject}
          onProjectClick={handleProjectCardClick}
        />

        {/* Map Container */}
        <div className="lg:flex-1">
          <div className="h-[70dvh] w-full overflow-hidden">
            <Suspense fallback={<MapLoading />}>
              <InteractiveMap
                latitude={mapCenter.lat}
                longitude={mapCenter.lng}
                zoom={mapZoom}
                className="h-full"
                markerPopup={`${projectsWithValidCoordinates.length} proyecto${
                  projectsWithValidCoordinates.length > 1 ? "s" : ""
                } en esta zona`}
                projects={projectMarkers}
                onMarkerClick={(marker) =>
                  handleMarkerClick(marker, projectsWithValidCoordinates)
                }
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
