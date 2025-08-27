import { Suspense } from 'react';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import ProjectsList from './_components/ProjectsList';
import ProjectsFilter from './_components/ProjectsFilter';
import { getProjectFilterOptions } from '@/lib/dal/projects';

interface ProjectsPageProps {
  searchParams: {
    neighborhood?: string;
    city?: string;
    status?: 'pre_sale' | 'construction' | 'completed';
    page?: string;
  };
}

// Loading component for Suspense
function ProjectsLoading() {
  return (
    <div className="mb-16">
      <div className="mb-8">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-[567px] rounded-3xl bg-gray-200 md:h-[547px]"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ProjectsPage = async ({ searchParams }: ProjectsPageProps) => {
  // Parse search params
  const page = parseInt(searchParams.page || '1', 10);
  const neighborhood = searchParams.neighborhood;
  const city = searchParams.city;
  const status = searchParams.status;

  // Get filter options
  const filterOptionsResult = await getProjectFilterOptions();
  const filterOptions = filterOptionsResult.data || { cities: [], neighborhoods: [] };

  // TODO: Esto lo tengo que revisar para dejar los filtos bien tranquilos todos | Paso a Paso
  return (
    <>
      <Header />
      <main className="bg-white pt-32">
        <div className="container mx-auto px-4 md:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="dashboard-title mb-4">Proyectos</h1>
            <p className="text-lg text-gray-600">
              Descubre todos nuestros proyectos inmobiliarios disponibles
            </p>
          </div>

          {/* Filters */}
          <ProjectsFilter 
            cities={filterOptions.cities}
            neighborhoods={filterOptions.neighborhoods}
          />
          
          {/* Projects List */}
          <Suspense fallback={<ProjectsLoading />}>
            <ProjectsList 
              page={page}
              pageSize={50}
              neighborhood={neighborhood}
              city={city}
              status={status}
            />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProjectsPage;
