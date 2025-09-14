"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { ProjectDisplayData, ProjectMarker } from "./types";

export function useProjectMapHandlers() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] =
    useState<ProjectDisplayData | null>(null);
  const [lastClickedProject, setLastClickedProject] = useState<string | null>(
    null,
  );
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle marker click to select project
  const handleMarkerClick = (
    marker: ProjectMarker,
    projects: ProjectDisplayData[],
  ) => {
    const project = projects.find((p) => p.id === marker.id);
    if (project) {
      setSelectedProject(project);
    }
  };

  // Handle project card click with double-click navigation
  const handleProjectCardClick = (project: ProjectDisplayData) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }

    if (lastClickedProject === project.id) {
      // Double click - navigate to project
      router.push(`/projects/${project.slug}`);
      setLastClickedProject(null);
    } else {
      // Single click - select project and show on map
      setSelectedProject(project);
      setLastClickedProject(project.id);

      // Clear the last clicked project after a delay
      const timeout = setTimeout(() => {
        setLastClickedProject(null);
      }, 300); // 300ms for double-click detection

      setClickTimeout(timeout);
    }
  };

  return {
    selectedProject,
    setSelectedProject,
    handleMarkerClick,
    handleProjectCardClick,
  };
}
