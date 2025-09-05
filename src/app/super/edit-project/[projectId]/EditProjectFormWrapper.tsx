"use client";

import { useRouter } from "next/navigation";

import { ProjectFormData } from "@/types/project-form";
import { ProjectFormMain } from "@/components/create-project-form/ProjectFormMain";

interface EditProjectFormWrapperProps {
  onSubmit: (data: ProjectFormData) => Promise<void>;
  projectData: any;
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
    latitude: projectData.latitude || undefined,
    longitude: projectData.longitude || undefined,
    status: projectData.status,
    basePrice: projectData.basePrice || undefined,
    currency: projectData.currency || "USD",
    images: projectData.images || [],
    amenities: projectData.amenities?.map((amenity: string) => ({ text: amenity })) || [],
    estimatedCompletion: projectData.estimatedCompletion ? new Date(projectData.estimatedCompletion) : undefined,
  };

  return (
    <ProjectFormMain
      onSubmit={onSubmit}
      isEditing={true}
      organizationId={projectData.organizationId}
      hideHeaderFooter={true}
      showBackButton={true}
      onBack={handleGoBack}
      initialData={initialData}
    />
  );
}