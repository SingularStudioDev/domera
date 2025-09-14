"use client";

import { useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import ProjectMapCard from "./ProjectMapCard";
import type { ProjectDisplayData } from "./types";

interface ProjectMapSidebarProps {
  projects: ProjectDisplayData[];
  selectedProject: ProjectDisplayData | null;
  onProjectClick: (project: ProjectDisplayData) => void;
}

export default function ProjectMapSidebar({
  projects,
  selectedProject,
  onProjectClick,
}: ProjectMapSidebarProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 4;

  // Calculate pagination
  const totalProjects = projects.length;
  const totalPages = Math.ceil(totalProjects / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = projects.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="w-full lg:w-[450px]">
      <div className="space-y-4">
        {/* Projects Grid - 2x2 Layout with fixed height */}
        <div className="grid h-[63.2dvh] grid-cols-2 grid-rows-2 gap-3">
          {currentProjects.map((project) => (
            <ProjectMapCard
              key={project.id}
              projectData={project}
              isSelected={selectedProject?.id === project.id}
              onClick={() => onProjectClick(project)}
            />
          ))}
          {/* Fill empty slots to maintain grid structure */}
          {Array.from(
            { length: projectsPerPage - currentProjects.length },
            (_, index) => (
              <div key={`empty-${index}`} className="invisible" />
            ),
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex h-[5dvh] items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center bg-white text-sm text-gray-700 not-disabled:cursor-pointer disabled:cursor-not-allowed disabled:text-[#7B7B7B]"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`flex h-8 w-8 items-center justify-center text-sm font-medium ${
                      currentPage === page
                        ? "text-[#7B7B7B]"
                        : "hover:text-primaryColor cursor-pointer text-[#252A5A]"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="hover:text-primaryColor flex h-8 w-8 items-center justify-center bg-white text-sm text-[#252A5A] not-disabled:cursor-pointer disabled:cursor-not-allowed disabled:text-[#7B7B7B]"
              >
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Project Counter */}
            <div className="text-center text-sm text-[#252A5A]">
              {startIndex + 1} - {Math.min(endIndex, totalProjects)} de{" "}
              {totalProjects}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
