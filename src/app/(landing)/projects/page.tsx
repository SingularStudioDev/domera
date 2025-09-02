import { getProjectFilterOptions } from "@/lib/dal/projects";

import ProjectsLayoutClient from "./_components/ProjectsLayout";

interface ProjectsPageProps {
  searchParams: {
    neighborhood?: string;
    city?: string;
    status?: "pre_sale" | "construction" | "completed";
    rooms?: string;
    amenities?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  };
}

const ProjectsPage = async ({ searchParams }: ProjectsPageProps) => {
  const filterOptionsResult = await getProjectFilterOptions();
  const filterOptions = filterOptionsResult.data || {
    cities: [],
    neighborhoods: [],
    amenities: [],
  };

  return (
    <ProjectsLayoutClient
      searchParams={searchParams}
      filterOptions={filterOptions}
    />
  );
};

export default ProjectsPage;
