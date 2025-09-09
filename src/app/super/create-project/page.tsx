import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ProjectFormData } from "@/types/project-form";
import { createProjectAction } from "@/lib/actions/projects";
import { validateSuperAdminSession } from "@/lib/auth/super-admin";
import { extractRealIP } from "@/lib/utils/security";

import ProjectFormWrapper from "./ProjectFormWrapper";

export default async function CreateProjectPage() {
  // Validar sesión de super admin
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie");

  const sessionCookies = cookieHeader
    ?.split(";")
    .filter((c) => c.trim().startsWith("super-admin-session="))
    .map((c) => c.split("=")[1]);

  const sessionCookie = sessionCookies?.pop();

  if (!sessionCookie) {
    redirect("/super");
  }

  const ipAddress = extractRealIP(headersList);
  const sessionValidation = await validateSuperAdminSession(
    sessionCookie,
    ipAddress,
  );

  if (!sessionValidation.valid || !sessionValidation.userId) {
    redirect("/super");
  }

  const handleCreateProject = async (data: ProjectFormData) => {
    "use server";

    try {
      // Get fresh headers inside the server action
      const actionHeaders = await headers();
      const actionIpAddress = extractRealIP(actionHeaders);
      const userAgent = actionHeaders.get("user-agent") || undefined;

      // Transformar los datos del formulario al formato requerido por las server actions
      // Validar que organizationId esté presente para super admin
      if (!data.organizationId || data.organizationId.trim() === "") {
        throw new Error("Organización es requerida para crear un proyecto");
      }

      // Validar datos requeridos
      if (!data.name?.trim()) {
        throw new Error("Nombre del proyecto es requerido");
      }

      if (!data.slug?.trim()) {
        throw new Error("Slug del proyecto es requerido");
      }

      if (!data.address?.trim()) {
        throw new Error("Dirección es requerida");
      }

      if (!data.city?.trim()) {
        throw new Error("Ciudad es requerida");
      }

      const projectData = {
        name: data.name,
        slug: data.slug,
        organizationId: data.organizationId,
        description: data.description || undefined,
        shortDescription: data.shortDescription || undefined,
        address: data.address,
        neighborhood: data.neighborhood || undefined,
        city: data.city,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        status: data.status,
        basePrice: data.basePrice ?? undefined,
        currency: data.currency,
        images: data.images || [],
        amenities:
          data.amenities?.map((amenity) =>
            typeof amenity === "string" ? amenity : amenity.text,
          ) || [],
        details: data.details || [],
        masterPlanFiles: data.masterPlanFiles || [],
        priority: data.priority || 0,
        startDate: undefined,
        estimatedCompletion: data.estimatedCompletion || undefined,
      };

      const result = await createProjectAction(
        projectData,
        actionIpAddress,
        userAgent,
      );

      if (result.success && result.data) {
        redirect("/super/dashboard/projects");
      } else {
        throw new Error(result.error || "Error al crear el proyecto");
      }
    } catch (error) {
      // Don't log redirect "errors" - they are normal Next.js behavior
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        throw error; // Re-throw redirect to let Next.js handle it
      }
      console.error("Error creating project:", error);
      throw error;
    }
  };

  return <ProjectFormWrapper onSubmit={handleCreateProject} />;
}
