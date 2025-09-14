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

  // Transform project data to ensure estimatedCompletion is a proper Date
  const transformedData = {
    ...projectData,
    estimatedCompletion: projectData.estimatedCompletion 
      ? (() => {
          const date = new Date(projectData.estimatedCompletion);
          return isNaN(date.getTime()) ? undefined : date;
        })()
      : undefined,
    amenities: projectData.amenities?.map((amenity: any) => 
      typeof amenity === "string" ? { text: amenity, icon: "" } : amenity
    ) || [],
    detalles: projectData.details?.map((detail: string) => ({
      text: detail,
    })) || [],
  };

  return (
    <ProjectFormMain
      onSubmit={onSubmit}
      isEditing={true}
      organizationId={projectData.organizationId}
      showBackButton={true}
      onBack={handleGoBack}
      initialData={transformedData}
    />
  );
}
