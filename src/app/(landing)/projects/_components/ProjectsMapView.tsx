"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { formatCurrency } from "@/utils/utils";
import type { Project } from "@prisma/client";

import { getPublicProjectsAction } from "@/lib/actions/projects";
import ProjectCard from "@/components/custom-ui/ProjectCard";
import { useProjectCardImage } from "@/hooks/useProjectImages";
import { type ImagesData } from "@/types/project-images";

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
  images: unknown; // Project images data (legacy or new format)
  status: string;
  date: string;
  features: ProjectFeature[];
  latitude: number;
  longitude: number;
  neighborhood?: string;
  city?: string;
}

interface ProjectMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  popup?: string;
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
    ? formatCurrency(parseFloat(project.basePrice.toString()))
    : "Consultar precio";

  const status = project.neighborhood || project.city;
  const date = project.estimatedCompletion
    ? new Date(project.estimatedCompletion).toLocaleDateString("es-UY", {
        month: "short",
        year: "numeric",
      })
    : "Fecha TBD";

  // Images data will be processed by the ProjectMapCardWrapper component

  // Convert Decimal coordinates to numbers
  const convertToNumber = (value: unknown): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (
      typeof value === "object" &&
      value !== null &&
      "toNumber" in value &&
      typeof (value as { toNumber(): number }).toNumber === "function"
    ) {
      return (value as { toNumber(): number }).toNumber();
    }
    if (typeof value === "string") return parseFloat(value) || 0;
    return 0;
  };

  const latitude = convertToNumber(project.latitude);
  const longitude = convertToNumber(project.longitude);

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
    images: project.images, // Pass full images data instead of single image
    status,
    date,
    features,
    latitude,
    longitude,
    neighborhood: project.neighborhood || undefined,
    city: project.city || undefined,
  };
};

// Wrapper component to handle image selection with the new system
function ProjectMapCardWrapper({ projectData }: { projectData: ProjectDisplayData }) {
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

  const projectsWithValidCoordinates = projects.filter((project) => {
    const isValid =
      project.latitude !== undefined &&
      project.longitude !== undefined &&
      project.latitude !== null &&
      project.longitude !== null &&
      !isNaN(project.latitude) &&
      !isNaN(project.longitude) &&
      project.latitude >= -90 &&
      project.latitude <= 90 &&
      project.longitude >= -180 &&
      project.longitude <= 180 &&
      project.latitude !== 0 &&
      project.longitude !== 0 &&
      Math.abs(project.latitude) > 0.0001 &&
      Math.abs(project.longitude) > 0.0001;

    if (!isValid) {
      console.log("Filtered out project:", project.title, {
        latitude: project.latitude,
        longitude: project.longitude,
        latType: typeof project.latitude,
        lngType: typeof project.longitude,
      });
    }

    return isValid;
  });

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
    }),
  );

  // Calculate map center from all projects
  const calculateMapCenter = () => {
    if (projectsWithValidCoordinates.length === 0) {
      return { lat: -34.9011, lng: -56.1645 }; // Montevideo default
    }

    const avgLat =
      projectsWithValidCoordinates.reduce((sum, p) => sum + p.latitude, 0) /
      projectsWithValidCoordinates.length;
    const avgLng =
      projectsWithValidCoordinates.reduce((sum, p) => sum + p.longitude, 0) /
      projectsWithValidCoordinates.length;

    // Validate calculated center and fallback to default if invalid
    if (
      isNaN(avgLat) ||
      isNaN(avgLng) ||
      !isFinite(avgLat) ||
      !isFinite(avgLng)
    ) {
      console.warn("Invalid map center calculated, using default:", {
        avgLat,
        avgLng,
      });
      return { lat: -34.9011, lng: -56.1645 }; // Montevideo default
    }

    return { lat: avgLat, lng: avgLng };
  };

  // Calculate appropriate zoom level based on project spread
  const calculateZoom = () => {
    if (projectsWithValidCoordinates.length <= 1) {
      return 15; // Close zoom for single project
    }

    const lats = projectsWithValidCoordinates.map((p) => p.latitude);
    const lngs = projectsWithValidCoordinates.map((p) => p.longitude);

    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);

    // Adjust zoom based on spread
    if (maxSpread > 0.1) return 10; // Wide spread
    if (maxSpread > 0.05) return 12; // Medium spread
    if (maxSpread > 0.01) return 13; // Small spread
    return 14; // Very close projects
  };

  const mapCenter = calculateMapCenter();
  const mapZoom = calculateZoom();

  // Handle marker click to select project
  const handleMarkerClick = (marker: ProjectMarker) => {
    const project = projectsWithValidCoordinates.find(
      (p) => p.id === marker.id,
    );
    if (project) {
      setSelectedProject(project);
    }
  };

  return (
    <div className="mb-16">
      {/* Map and Sidebar Layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar with Selected Project */}
        <div className="w-full lg:w-96">
          {selectedProject ? (
            <div className="rounded-3xl border p-4">
              <ProjectMapCardWrapper projectData={selectedProject} />
            </div>
          ) : (
            <div className="rounded-lg border bg-gray-50 p-6 text-center">
              <p className="text-gray-600">
                Selecciona un proyecto en el mapa para ver sus detalles
              </p>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="lg:flex-1">
          <div className="h-[70dvh] w-full overflow-hidden">
            <Suspense fallback={<MapLoading />}>
              <InteractiveMap
                latitude={mapCenter.lat}
                longitude={mapCenter.lng}
                zoom={mapZoom}
                className="h-full"
                markerPopup={`${projectsWithValidCoordinates.length} proyecto${projectsWithValidCoordinates.length > 1 ? "s" : ""} en esta zona`}
                projects={projectMarkers}
                onMarkerClick={handleMarkerClick}
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
      </div>
    </div>
  );
}
