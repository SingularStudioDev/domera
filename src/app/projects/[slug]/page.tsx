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
import { formatCurrency } from '@/utils/utils';

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

const ProjectDetailPage = async ({ params }: ProjectPageProps) => {
  const projectSlug = params.slug;

  // Fetch project data by slug
  const projectResult = await getProjectBySlug(projectSlug);
  if (!projectResult.data) {
    notFound();
  }

  const project = projectResult.data;

  // Format project data
  const basePrice = project.basePrice
    ? formatCurrency(Number(project.basePrice), project.currency)
    : 'Consultar';
  const estimatedDate = project.estimatedCompletion
    ? new Intl.DateTimeFormat('es-UY', {
        month: 'short',
        year: 'numeric',
      }).format(project.estimatedCompletion)
    : 'A definir';

  // Pass amenities data directly without converting to string
  const amenitiesData = project.amenities || 'Amenidades a confirmar';
  const planFiles: string[] = project.masterPlanFiles;
  // Parse and filter images following project patterns
  const allImages = Array.isArray(project.images)
    ? (project.images as string[])
    : typeof project.images === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(project.images as string);
            return Array.isArray(parsed) ? parsed : [project.images];
          } catch {
            return [project.images];
          }
        })()
      : [];

  // Filter images that match the pattern ${slug}-${number}
  const carouselImages = allImages.filter((imagePath) => {
    const imageName = imagePath.split('/').pop()?.split('.')[0];
    if (!imageName) return false;
    const regex = new RegExp(
      `^${projectSlug.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}-\\d+$`
    );
    return regex.test(imageName);
  });

  // Filter images that match the pattern ${slug}-progress-${number}
  const progressImages = allImages.filter((imagePath) => {
    const imageName = imagePath.split('/').pop()?.split('.')[0];
    if (!imageName) return false;
    const regex = new RegExp(
      `^${projectSlug.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}-progress-\\d+$`
    );
    return regex.test(imageName);
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <ProjectHero
          title={project.name}
          price={basePrice}
          location={`${project.neighborhood || project.city}`}
          date={estimatedDate}
          slug={projectSlug}
        />
        <div>
          <ProjectInfo />

          <div className="container mx-auto flex flex-col gap-10 px-4 md:flex-row md:px-0">
            <div className="flex flex-col gap-5">
              <ProjectDescription
                description={project.description || 'Descripción próximamente'}
                adress={project.address || 'Direccion próximamente'}
              />

              <ProjectDetails amenities={amenitiesData} />

              <ProjectImageCarousel
                images={carouselImages}
                projectName={project.name}
                slug={projectSlug}
                className="my-5 md:my-10"
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

          <AvailableUnits projectId={project.id} />
        </div>
      </main>

      {/* Footer Component similar to header as shown in Figma */}
      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
