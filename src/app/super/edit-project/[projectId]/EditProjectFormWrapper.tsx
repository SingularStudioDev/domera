"use client";

import { useRouter } from "next/navigation";

import { MasterPlanFile, ProjectFormData } from "@/types/project-form";
import { ProjectFormMain } from "@/components/create-project-form/ProjectFormMain";

interface Amenity {
  text: string;
  icon?: string;
}

interface Detalle {
  text: string;
}

interface EditProjectFormWrapperProps {
  onSubmit: (data: ProjectFormData) => Promise<void>;
  projectData: {
    name: string;
    slug: string;
    organizationId: string;
    description?: string;
    shortDescription?: string;
    address: string;
    neighborhood?: string;
    city: string;
    latitude?: number | null;
    longitude?: number | null;
    status:
      | "planning"
      | "pre_sale"
      | "construction"
      | "completed"
      | "delivered";
    basePrice?: number;
    currency?: "USD" | "UYU";
    images?: string[];
    masterPlanFiles?: MasterPlanFile[];
    priority?: number;
    details?: string[];
    amenities?: (string | Amenity)[];
    // detalles no existe en DB, se construye desde details
    estimatedCompletion?: string | Date;
    hasParking?: boolean;
    hasStudio?: boolean;
    has1Bedroom?: boolean;
    has2Bedroom?: boolean;
    has3Bedroom?: boolean;
    has4Bedroom?: boolean;
    has5Bedroom?: boolean;
    hasCommercial?: boolean;
  };
}

export default function EditProjectFormWrapper({
  onSubmit,
  projectData,
}: EditProjectFormWrapperProps) {
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/super/dashboard/projects");
  };

  // Transform project data to form format
  const initialData: Partial<ProjectFormData> = {
    name: projectData.name,
    slug: projectData.slug,
    organizationId: projectData.organizationId,
    description: projectData.description || "",
    shortDescription: projectData.shortDescription || "",
    address: projectData.address,
    neighborhood: projectData.neighborhood || "",
    city: projectData.city,
    latitude: projectData.latitude || null,
    longitude: projectData.longitude || null,
    status: projectData.status,
    basePrice: projectData.basePrice || undefined,
    currency: projectData.currency || "USD",
    images: projectData.images || [],
    masterPlanFiles: projectData.masterPlanFiles || [],
    priority: projectData.priority || 0,
    details: projectData.details || [],
    amenities:
      projectData.amenities?.map((amenity) => {
        if (typeof amenity === "string") {
          return { text: amenity, icon: "" };
        }
        return {
          text: amenity.text || amenity.text,
          icon: amenity.icon || "",
        };
      }) || [],
    detalles: (projectData.details || []).map((detail: string) => ({
      text: detail,
    })),
    estimatedCompletion: projectData.estimatedCompletion
      ? new Date(projectData.estimatedCompletion)
      : undefined,
    hasParking: projectData.hasParking ?? false,
    hasStudio: projectData.hasStudio ?? false,
    has1Bedroom: projectData.has1Bedroom ?? false,
    has2Bedroom: projectData.has2Bedroom ?? false,
    has3Bedroom: projectData.has3Bedroom ?? false,
    has4Bedroom: projectData.has4Bedroom ?? false,
    has5Bedroom: projectData.has5Bedroom ?? false,
    hasCommercial: projectData.hasCommercial ?? false,
  };

  return (
    <ProjectFormMain
      onSubmit={onSubmit}
      isEditing={true}
      organizationId={projectData.organizationId}
      showBackButton={true}
      onBack={handleGoBack}
      initialData={initialData}
    />
  );
}
