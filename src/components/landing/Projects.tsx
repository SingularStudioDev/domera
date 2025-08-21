import ProjectCard from '../custom-ui/ProjectCard';
import MainButton from '../custom-ui/MainButton';
import { getPublicProjects } from '@/lib/dal/projects';
import { formatCurrency } from '@/utils/utils';
import type { Project } from '@prisma/client';

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
  title: string;
  price: string;
  image: string;
  status: string;
  date: string;
  features: ProjectFeature[];
}

// TODO: Revisar esta funcion al detalle para que devuelva todo lo que se necesita 
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

  // Parse images from JSON field - handle different Prisma JSON return types
  let images: string[] = [];
  try {
    if (typeof project.images === 'string') {
      // If it's a JSON string, parse it
      images = JSON.parse(project.images);
    } else if (Array.isArray(project.images)) {
      // If it's already an array, use it directly
      images = project.images.filter((img) => typeof img === 'string');
    } else if (project.images && typeof project.images === 'object') {
      // If it's an object (Prisma JsonValue), extract array
      images = Array.isArray(project.images) ? project.images : [];
    }
  } catch (error) {
    console.error('Error parsing project images:', error);
    images = [];
  }

  const image =
    images.length > 0 && images[0]
      ? String(images[0])
      : '/project-placeholder.png';

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
    price,
    image,
    status,
    date,
    features,
  };
};

export default async function Projects({
  limit = 7,
  showLoadMore = true,
}: ProjectsProps = {}) {
  const projectsResult = await getPublicProjects({
    page: 1,
    pageSize: limit,
  });

  if (!projectsResult.data) {
    return (
      <section className="px-4 pb-10 md:px-0 md:pb-16">
        <div className="container mx-auto">
          <h2 className="dashboard-title">Proyectos</h2>
          <p className="text-center text-gray-600">
            No hay proyectos disponibles en este momento.
          </p>
        </div>
      </section>
    );
  }

  const projects = projectsResult.data.data;

  return (
    <section className="px-4 pb-10 md:px-0 md:pb-16">
      <div className="container mx-auto">
        {/* Section Header */}

        <h2 className="dashboard-title mb-6">Proyectos</h2>

        {/* Projects Grid */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const projectData = formatProjectForDisplay(project);

            console.log('projectData', projectData.features);

            return (
              <div
                key={project.id}
                className={
                  index === projects.length - 1 && projects.length % 3 === 1
                    ? 'col-span-full'
                    : ''
                }
              >
                <ProjectCard
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
