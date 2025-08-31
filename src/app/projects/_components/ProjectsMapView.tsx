"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { formatCurrency } from "@/utils/utils";
import type { Project } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import { getPublicProjectsAction } from "@/lib/actions/projects";
import ProjectCard from "@/components/custom-ui/ProjectCard";

// Dynamically import the map component to avoid SSR issues
const InteractiveMap = dynamic(
  () => import("@/components/custom-ui/InteractiveMap"),
  {
    ssr: false,
    loading: () => <MapLoading />,
  },
);

interface ProjectsMapViewProps {
  searchParams: {
    neighborhood?: string;
    city?: string;
    status?: "pre_sale" | "construction" | "completed";
    rooms?: string;
    amenities?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  };
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
  image: string;
  status: string;
  date: string;
  features: ProjectFeature[];
  latitude: Decimal;
  longitude: Decimal;
  neighborhood?: string;
  city?: string;
}

/**
 * Loading component for map view
 */
function MapLoading() {
  return (
    <div className="flex h-[600px] w-full items-center justify-center rounded-lg border bg-gray-50">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-sm text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  );
}

/**
 * Formats a project from the database for display in the UI
 * Extracts features, formats pricing, dates, images, and location data
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

  // Use project slug for main image with fallback
  const image = `/images/${project.slug}-main.png`;

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
    latitude: project.latitude,
    longitude: project.longitude,
    neighborhood: project.neighborhood || undefined,
    city: project.city || undefined,
  };
};

/**
 * Map view component that displays projects on an interactive map
 * Shows project markers with popups and a sidebar with project details
 */
export default function ProjectsMapView({
  searchParams,
}: ProjectsMapViewProps) {
  const [projects, setProjects] = useState<ProjectDisplayData[]>([]);
  const [selectedProject, setSelectedProject] =
    useState<ProjectDisplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const pageSize = 100;

  console.log("projects", projects);

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
          const formattedProjects = data.data.map(formatProjectForDisplay);
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

  const projectsWithValidCoordinates = projects.filter(
    (project) =>
      project.latitude !== undefined &&
      project.longitude !== undefined &&
      project.latitude !== null &&
      project.longitude !== null &&
      !isNaN(project.latitude) &&
      !isNaN(project.longitude) &&
      project.latitude >= -90 &&
      project.latitude <= 90 &&
      project.longitude >= -180 &&
      project.longitude <= 180,
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

  return (
    <div className="mb-16">
      {/* Projects Count */}
      <div className="mb-8">
        <p className="text-sm text-gray-600">
          {projectsWithValidCoordinates.length === 1
            ? "1 proyecto en el mapa"
            : `${projectsWithValidCoordinates.length} proyectos en el mapa`}
        </p>
      </div>

      {/* Map and Sidebar Layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Map Container */}
        <div className="lg:flex-1">
          <div className="h-[600px] w-full overflow-hidden rounded-lg border">
            <Suspense fallback={<MapLoading />}>
              <InteractiveMap
                latitude={projectsWithValidCoordinates[0].latitude!}
                longitude={projectsWithValidCoordinates[0].longitude!}
                zoom={12}
                className="h-full"
                markerPopup={`${projectsWithValidCoordinates.length} proyecto${projectsWithValidCoordinates.length > 1 ? "s" : ""} en esta zona`}
              />
            </Suspense>
          </div>

          {/* Projects List Below Map on Mobile, Side on Desktop */}
          <div className="mt-4 lg:hidden">
            <div className="max-h-[300px] space-y-4 overflow-y-auto rounded-lg border bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-900">
                {projectsWithValidCoordinates.length === 1
                  ? "1 proyecto en el mapa"
                  : `${projectsWithValidCoordinates.length} proyectos en el mapa`}
              </h3>
              {projectsWithValidCoordinates.map((project) => (
                <div
                  key={project.id}
                  className="cursor-pointer rounded-lg border bg-white p-3 transition-colors hover:bg-blue-50"
                  onClick={() => setSelectedProject(project)}
                >
                  <h4 className="font-medium text-gray-900">{project.title}</h4>
                  <p className="text-sm text-gray-600">{project.status}</p>
                  <p className="text-sm font-semibold text-blue-600">
                    {project.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar with Selected Project */}
        <div className="w-full lg:w-96">
          {selectedProject ? (
            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-4 text-lg font-semibold">
                Proyecto seleccionado
              </h3>
              <ProjectCard
                id={selectedProject.id}
                slug={selectedProject.slug}
                title={selectedProject.title}
                price={selectedProject.price}
                image={selectedProject.image}
                status={selectedProject.status}
                date={selectedProject.date}
                features={selectedProject.features}
              />
            </div>
          ) : (
            <div className="rounded-lg border bg-gray-50 p-6 text-center">
              <p className="text-gray-600">
                Selecciona un proyecto en el mapa para ver sus detalles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
