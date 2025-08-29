import ProjectsLayoutClient from './_components/ProjectsLayout';
import { getProjectFilterOptions } from '@/lib/dal/projects';

interface ProjectsPageProps {
  searchParams: {
    neighborhood?: string;
    city?: string;
    status?: 'pre_sale' | 'construction' | 'completed';
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

  // console.log('filteroptions', filterOptionsResult)

  return (
    <ProjectsLayoutClient
      searchParams={searchParams}
      filterOptions={filterOptions}
    />
  );
};

export default ProjectsPage;
