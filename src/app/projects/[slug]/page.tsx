import { notFound } from 'next/navigation';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import ProjectHero from './units/_components/ProjectHero';
import ProjectInfo from './units/_components/ProjectInfo';
import ProjectDescription from './units/_components/ProjectDescription';
import ProjectDetails from './units/_components/ProjectDetails';
import ProjectLocation from './units/_components/ProjectLocation';
import ProjectProgress from './units/_components/ProjectProgress';
import AvailableUnits from './units/_components/AvailableUnits';
import ProjectImageCarousel from '@/components/custom-ui/ProjectImageCarousel';
import { getProjectBySlug } from '@/lib/dal/projects';
import { getUnits } from '@/lib/dal/units';
import { formatCurrency } from '@/utils/utils';
import { getMultipleFavoriteStatusAction } from '@/lib/actions/favourites';

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

interface UnitForDisplay {
  id: string;
  title: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  orientation: string;
  price: string;
  type: string;
  image: string;
  available: boolean;
  statusIcon: boolean;
  isFavorite?: boolean;
}

const ProjectDetailPage = async ({ params }: ProjectPageProps) => {
  const projectSlug = params.slug;

  // Fetch project data by slug
  const projectResult = await getProjectBySlug(projectSlug);
  if (!projectResult.data) {
    notFound();
  }

  const project = projectResult.data;

  // Fetch units for this project
  const unitsResult = await getUnits({
    page: 1,
    pageSize: 100,
    projectId: project.id,
  });

  const units = unitsResult.data?.data || [];

  // Get favorite statuses for all units
  const unitIds = units.map((unit) => unit.id);
  const favoriteStatuses = await getMultipleFavoriteStatusAction(unitIds);

  // Transform units data for display
  const availableUnits: UnitForDisplay[] = units.map((unit) => ({
    id: unit.id,
    title: `Unidad ${unit.unitNumber} - Piso ${unit.floor}`,
    description: `${unit.bedrooms} dormitorios, ${unit.bathrooms} baños`,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    area: `${Number(unit.dimensions) || 0}m²`,
    orientation: unit.orientation || 'No especificado',
    price: formatCurrency(Number(unit.price), project.currency),
    type: unit.unitType,
    image: Array.isArray(unit.images)
      ? (unit.images[0] as string)
      : '/unit-placeholder.png',
    available: unit.status === 'available',
    statusIcon: unit.status !== 'available',
    isFavorite: favoriteStatuses[unit.id] || false,
  }));

  // Format project data
  const heroImage = Array.isArray(project.images)
    ? (project.images[0] as string)
    : '/project-placeholder.png';
  const basePrice = project.basePrice
    ? formatCurrency(Number(project.basePrice), project.currency)
    : 'Consultar';
  const estimatedDate = project.estimatedCompletion
    ? new Intl.DateTimeFormat('es-UY', {
        month: 'short',
        year: 'numeric',
      }).format(project.estimatedCompletion)
    : 'A definir';

  // Default content for sections that don't have database fields yet
  const amenitiesText = Array.isArray(project.amenities)
    ? JSON.stringify(project.amenities)
    : (project.amenities as string) || 'Amenidades a confirmar';
  const additionalFeatures = 'Características adicionales a definir';
  const planFiles: string[] = [];
  // Usar las imágenes del proyecto para mostrar el progreso (temporalmente)
  const progressImages = Array.isArray(project.images) 
    ? project.images as string[]
    : typeof project.images === 'string' 
      ? project.images
      : [];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <ProjectHero
          title={project.name}
          price={basePrice}
          location={`${project.neighborhood || project.city}`}
          date={estimatedDate}
        />

        <div>
          <ProjectInfo />

          <div className="container mx-auto flex flex-col gap-10 px-4 md:flex-row md:px-0">
            <div className="flex flex-col gap-5">
              <ProjectDescription
                description={project.description || 'Descripción próximamente'}
                adress={project.address || 'Direccion próximamente'}
              />


              <ProjectDetails
                amenities={amenitiesText}
                additionalFeatures={additionalFeatures}
              />

              <ProjectImageCarousel
                images={project.images as string[] || []}
                projectName={project.name}
                className="py-5 md:py-10"
              />

              <ProjectLocation 
                planFiles={planFiles} 
                latitude={project.latitude ? Number(project.latitude) : null}
                longitude={project.longitude ? Number(project.longitude) : null}
                projectName={project.name}
              />

              <ProjectProgress progressImages={progressImages} />
            </div>
          </div>

          <AvailableUnits units={availableUnits} projectId={project.id} />
        </div>
      </main>

      {/* Footer Component similar to header as shown in Figma */}
      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
