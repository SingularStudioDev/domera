"use client";

import { useRouter } from "next/navigation";

import { ProjectFormData } from "@/types/project-form";
import { ProjectFormMain } from "@/components/create-project-form/ProjectFormMain";

interface ProjectFormWrapperProps {
  onSubmit: (data: ProjectFormData) => Promise<void>;
}

export default function ProjectFormWrapper({
  onSubmit,
}: ProjectFormWrapperProps) {
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/super/dashboard/projects");
  };

  return (
    <ProjectFormMain
      onSubmit={onSubmit}
      isEditing={false}
      organizationId={undefined}
      hideHeaderFooter={true}
      showBackButton={true}
      onBack={handleGoBack}
    />
  );
}
