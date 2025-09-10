import { notFound } from "next/navigation";

import { formatCurrency } from "@/utils/utils";

import type { MasterPlanFile } from "@/types/project-form";
import { type ImagesData } from "@/types/project-images";
import { getProjectBySlug } from "@/lib/dal/projects";
import { ProjectImagesManager } from "@/lib/utils/project-images";
import ProjectImageCarousel from "@/components/custom-ui/ProjectImageCarousel";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";

import AvailableUnits from "./units/_components/AvailableUnits";
import ProjectDescription from "./units/_components/ProjectDescription";
import ProjectDetails from "./units/_components/ProjectDetails";
import ProjectHero from "./units/_components/ProjectHero";
import ProjectInfo from "./units/_components/ProjectInfo";
import ProjectLocation from "./units/_components/ProjectLocation";
import ProjectProgress from "./units/_components/ProjectProgress";

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

const ProjectDetailPage = async ({ params }: ProjectPageProps) => {
  const { slug } = await params;
  const projectSlug = slug;

  // Fetch project data by slug
  const projectResult = await getProjectBySlug(projectSlug);
  if (!projectResult.data) {
    notFound();
  }

  const project = projectResult.data;

  // Format project data
  const basePrice = project.basePrice
    ? formatCurrency(Number(project.basePrice))
    : "Consultar";
  const estimatedDate = project.estimatedCompletion
    ? new Intl.DateTimeFormat("es-UY", {
        month: "short",
        year: "numeric",
      }).format(project.estimatedCompletion)
    : "A definir";

  // Parse amenities and details data from JSON fields
  const amenitiesData = project.amenities;
  const detailsData = project.details;

  // Parse master plan files
  const masterPlanFiles: MasterPlanFile[] = Array.isArray(
    project.masterPlanFiles,
  )
    ? (project.masterPlanFiles as unknown as MasterPlanFile[])
    : typeof project.masterPlanFiles === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(project.masterPlanFiles as string);
            return Array.isArray(parsed) ? (parsed as MasterPlanFile[]) : [];
          } catch {
            return [];
          }
        })()
      : [];
  // Use new image management system
  const imageManager = new ProjectImagesManager(project.images as ImagesData);

  // Extract images by type with smart fallbacks
  const heroImage =
    imageManager.getHeroImage()?.url ||
    imageManager.getCardImage()?.url ||
    imageManager.getMainImage()?.url ||
    `/images/${projectSlug}-hero.png`;

  const carouselImages = imageManager.getCarouselImages().map((img) => img.url);

  // For progress images, check both the new system and legacy pattern matching
  const progressFromManager = imageManager
    .getProgressImages()
    .map((img) => img.url);

  // Legacy pattern matching for progress images (for compatibility)
  const allImagesUrls = imageManager.getAllImages().map((img) => img.url);
  const legacyProgressImages = allImagesUrls.filter((imagePath) => {
    const imageName = imagePath.split("/").pop()?.split(".")[0];
    if (!imageName) return false;
    const regex = new RegExp(
      `^${projectSlug.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}-progress-\\d+$`,
    );
    return regex.test(imageName);
  });

  // Combine progress images from both sources
  const progressImages = [
    ...progressFromManager,
    ...legacyProgressImages,
  ].filter((url, index, arr) => arr.indexOf(url) === index); // Remove duplicates

  console.log("Project images debug:", {
    projectSlug,
    heroImage,
    carouselImages,
    progressImages,
    isLegacyFormat: imageManager.isFromLegacyFormat(),
    totalImages: imageManager.getImageCount(),
  });

  console.log("Project location debug:", {
    projectSlug,
    latitude: project.latitude,
    longitude: project.longitude,
    latitudeNumber: project.latitude ? Number(project.latitude) : null,
    longitudeNumber: project.longitude ? Number(project.longitude) : null,
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
          heroImage={heroImage}
        />
        <div>
          <ProjectInfo masterPlanFiles={masterPlanFiles} />

          <div className="container mx-auto flex flex-col gap-10 px-4 md:flex-row md:px-0">
            <div className="flex flex-col gap-5">
              <ProjectDescription
                description={project.description || "Descripción próximamente"}
                adress={project.address || "Direccion próximamente"}
                organization={
                  (project as any).organization || {
                    name: "Organización próximamente",
                  }
                }
              />

              <ProjectDetails amenities={amenitiesData} details={detailsData} />

              <ProjectImageCarousel
                images={carouselImages}
                projectName={project.name}
                slug={projectSlug}
                className="my-5 md:my-10"
              />

              <ProjectLocation
                masterPlanFiles={masterPlanFiles}
                latitude={project.latitude ? Number(project.latitude) : null}
                longitude={project.longitude ? Number(project.longitude) : null}
                projectName={project.name}
              />

              <ProjectProgress
                date={estimatedDate}
                progressImages={progressImages}
              />
            </div>
          </div>

          <AvailableUnits projectId={project.id} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
