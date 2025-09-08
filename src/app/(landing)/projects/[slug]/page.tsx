import { notFound } from "next/navigation";

import { formatCurrency } from "@/utils/utils";

import type { MasterPlanFile } from "@/types/project-form";
import { getProjectBySlug } from "@/lib/dal/projects";
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
  // Parse and filter images following project patterns
  const allImages = Array.isArray(project.images)
    ? (project.images as string[])
    : typeof project.images === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(project.images as string);
            return Array.isArray(parsed) ? parsed : [project.images];
          } catch {
            return [project.images];
          }
        })()
      : [];

  // Use first image for hero, rest for carousel
  const heroImage =
    allImages.length > 0 ? allImages[0] : `/images/${projectSlug}-hero.png`;
  const carouselImages = allImages.length > 0 ? allImages : [];

  // Filter images that match the pattern ${slug}-progress-${number}
  const progressImages = allImages.filter((imagePath) => {
    const imageName = imagePath.split("/").pop()?.split(".")[0];
    if (!imageName) return false;
    const regex = new RegExp(
      `^${projectSlug.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}-progress-\\d+$`,
    );
    return regex.test(imageName);
  });

  console.log("Project images debug:", {
    projectSlug,
    allImages,
    heroImage,
    carouselImages,
    progressImages,
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
          <ProjectInfo />

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

              <ProjectProgress progressImages={progressImages} />
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
