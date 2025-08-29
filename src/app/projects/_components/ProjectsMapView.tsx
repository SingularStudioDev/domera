'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getPublicProjectsAction } from '@/lib/actions/projects';
import { formatCurrency } from '@/utils/utils';
import type { Project } from '@prisma/client';
import ProjectCard from '@/components/custom-ui/ProjectCard';

// Dynamically import the map component to avoid SSR issues
const InteractiveMap = dynamic(
  () => import('@/components/custom-ui/InteractiveMap'),
  { 
    ssr: false,
    loading: () => <MapLoading />
  }
);

interface ProjectsMapViewProps {
  searchParams: {
    neighborhood?: string;
    city?: string;
    status?: 'pre_sale' | 'construction' | 'completed';
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
  latitude?: number;
  longitude?: number;
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
    : 'Consultar precio';

  const status = project.neighborhood || project.city;
  const date = project.estimatedCompletion
    ? new Date(project.estimatedCompletion).toLocaleDateString('es-UY', {
        month: 'short',
        year: 'numeric',
      })
    : 'Fecha TBD';

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
    { name: 'parking', hasFeature: projectWithFeatures.hasParking || false },
    { name: 'studio', hasFeature: projectWithFeatures.hasStudio || false },
    { name: '1_bedroom', hasFeature: projectWithFeatures.has1Bedroom || false },
    { name: '2_bedroom', hasFeature: projectWithFeatures.has2Bedroom || false },
    { name: '3_bedroom', hasFeature: projectWithFeatures.has3Bedroom || false },
    { name: '4_bedroom', hasFeature: projectWithFeatures.has4Bedroom || false },
    { name: '5_bedroom', hasFeature: projectWithFeatures.has5Bedroom || false },
    {
      name: 'commercial',
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
    latitude: (project.latitude !== null && project.latitude !== undefined) ? 
      (typeof project.latitude === 'number' ? project.latitude : parseFloat(project.latitude.toString())) : 
      undefined,
    longitude: (project.longitude !== null && project.longitude !== undefined) ? 
      (typeof project.longitude === 'number' ? project.longitude : parseFloat(project.longitude.toString())) : 
      undefined,
    neighborhood: project.neighborhood || undefined,
    city: project.city || undefined,
  };
};

/**
 * Map view component that displays projects on an interactive map
 * Shows project markers with popups and a sidebar with project details
 */
export default function ProjectsMapView({ searchParams }: ProjectsMapViewProps) {
  const [projects, setProjects] = useState<ProjectDisplayData[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectDisplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse search params
  const page = parseInt(searchParams.page || '1', 10);
  const neighborhood = searchParams.neighborhood;
  const city = searchParams.city;
  
  // Validate status to prevent invalid enum values
  const validStatuses: Array<'pre_sale' | 'construction' | 'completed'> = ['pre_sale', 'construction', 'completed'];
  const status = validStatuses.includes(searchParams.status as 'pre_sale' | 'construction' | 'completed') ? searchParams.status : undefined;
  
  const rooms = searchParams.rooms;
  const amenities = searchParams.amenities;
  const minPrice = searchParams.minPrice;
  const maxPrice = searchParams.maxPrice;

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const projectsResult = await getPublicProjectsAction({
          page,
          pageSize: 100, // Get more projects for map view
          city,
          neighborhood,
          status,
          ...(minPrice && { minPrice: parseFloat(minPrice) }),
          ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
        });

        if (projectsResult.success && projectsResult.data) {
          const data = projectsResult.data as { data: Project[]; count: number };
          
          const formattedProjects = data.data.map(formatProjectForDisplay);
          
          // Filter out projects without coordinates
          const projectsWithCoordinates = formattedProjects.filter(
            (project) => project.latitude && project.longitude
          );
          
          setProjects(projectsWithCoordinates);
        } else {
          setProjects([]);
          if (!projectsResult.success) {
            setError(projectsResult.error || 'Error al cargar proyectos');
          }
        }
      } catch (err) {
        setError('Error al cargar los proyectos');
        console.error('Error fetching projects for map:', err);
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
          <p className="text-lg font-semibold text-gray-900">Error al cargar el mapa</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  console.log('projects', projects)

  if (projects.length === 0) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center rounded-lg border bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">No hay proyectos para mostrar</p>
          <p className="text-sm text-gray-600">
            No se encontraron proyectos con ubicación que coincidan con los filtros seleccionados.
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
          {projects.length === 1
            ? '1 proyecto en el mapa'
            : `${projects.length} proyectos en el mapa`}
        </p>
      </div>

      {/* Map and Sidebar Layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Map Container */}
        <div className="lg:flex-1">
          <div className="h-[600px] w-full overflow-hidden rounded-lg border">
            <Suspense fallback={<MapLoading />}>
              {projects.length > 0 ? (
                <InteractiveMap
                  latitude={projects[0].latitude!}
                  longitude={projects[0].longitude!}
                  zoom={12}
                  className="h-full"
                  markerPopup={`${projects.length} proyecto${projects.length > 1 ? 's' : ''} en esta zona`}
                />
              ) : (
                <InteractiveMap
                  latitude={-34.9011}
                  longitude={-56.1645}
                  zoom={10}
                  className="h-full"
                  markerPopup="Montevideo, Uruguay"
                />
              )}
            </Suspense>
          </div>
          
          {/* Projects List Below Map on Mobile, Side on Desktop */}
          <div className="mt-4 lg:hidden">
            <div className="max-h-[300px] space-y-4 overflow-y-auto rounded-lg border bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-900">
                {projects.length === 1
                  ? '1 proyecto en el mapa'
                  : `${projects.length} proyectos en el mapa`}
              </h3>
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="cursor-pointer rounded-lg border bg-white p-3 transition-colors hover:bg-blue-50"
                  onClick={() => setSelectedProject(project)}
                >
                  <h4 className="font-medium text-gray-900">{project.title}</h4>
                  <p className="text-sm text-gray-600">{project.status}</p>
                  <p className="text-sm font-semibold text-blue-600">{project.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar with Selected Project */}
        <div className="w-full lg:w-96">
          {selectedProject ? (
            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-4 text-lg font-semibold">Proyecto seleccionado</h3>
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