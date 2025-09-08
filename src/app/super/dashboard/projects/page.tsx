"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Plus, X } from "lucide-react";

import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Button } from "@/components/ui/button";

import ProjectsList from "./components/ProjectsList";

export default function ProjectsPage() {
  const router = useRouter();
  const { isLoading: isSessionLoading, isAuthenticated } = useSuperAdmin();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateProject = () => {
    router.push("/super/create-project");
  };

  const handleProjectCreated = () => {
    // Trigger refresh of the projects list
    setRefreshKey((prev) => prev + 1);
  };

  if (isSessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="dashboard-title">Gestión de Proyectos</h1>
          <Button
            onClick={handleCreateProject}
            className="flex cursor-pointer items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Proyecto Nuevo
          </Button>
        </div>

        {/* Projects List */}
        <ProjectsList key={refreshKey} />
      </div>
    </div>
  );
}
