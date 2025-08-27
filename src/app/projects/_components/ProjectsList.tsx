import ProjectCard from '@/components/custom-ui/ProjectCard';
import { getPublicProjects } from '@/lib/dal/projects';
import { formatCurrency } from '@/utils/utils';
import type { Project } from '@prisma/client';

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
  status?: 'pre_sale' | 'construction' | 'completed';
}

/**
 * Formats a project from the database for display in the UI
 * Extracts features, formats pricing, dates, and images
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
  };
};

export default async function ProjectsList({
  page = 1,
  pageSize = 50, // Show more projects than the landing page
  city,
  neighborhood,
  status,
}: ProjectsListProps = {}) {
  const projectsResult = await getPublicProjects({
    page,
    pageSize,
    city,
    neighborhood,
    status,
  });

  if (!projectsResult.data) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            No hay proyectos disponibles
          </h3>
          <p className="text-gray-600">
            No encontramos proyectos que coincidan con los filtros seleccionados.
            Intenta ajustar los criterios de búsqueda.
          </p>
        </div>
      </div>
    );
  }

  const projects = projectsResult.data.data;

  if (projects.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            No hay proyectos disponibles
          </h3>
          <p className="text-gray-600">
            No encontramos proyectos que coincidan con los filtros seleccionados.
            Intenta ajustar los criterios de búsqueda.
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
          {projectsResult.data.count === 1
            ? '1 proyecto encontrado'
            : `${projectsResult.data.count} proyectos encontrados`}
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => {
          const projectData = formatProjectForDisplay(project);

          return (
            <div
              key={project.id}
              className={
                index === projects.length - 1 && projects.length % 3 === 1
                  ? 'col-span-full max-w-md mx-auto'
                  : ''
              }
            >
              <ProjectCard
                slug={projectData.slug}
                id={projectData.id}
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
      {projectsResult.data.page < projectsResult.data.totalPages && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Mostrando {projects.length} de {projectsResult.data.count}{' '}
            proyectos
          </p>
        </div>
      )}
    </div>
  );
}