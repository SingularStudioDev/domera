import ProjectsList from './ProjectsList';

interface ProjectsListViewProps {
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

/**
 * Client component that displays projects in a grid layout
 * Handles all search parameters and filtering for the list display mode
 */
export default function ProjectsListView({ searchParams }: ProjectsListViewProps) {
  // Parse search params
  const page = parseInt(searchParams.page || '1', 10);
  const neighborhood = searchParams.neighborhood;
  const city = searchParams.city;
  
  // Validate status to prevent invalid enum values
  const validStatuses: Array<'pre_sale' | 'construction' | 'completed'> = ['pre_sale', 'construction', 'completed'];
  const status = validStatuses.includes(searchParams.status as any) ? searchParams.status : undefined;
  
  const rooms = searchParams.rooms;
  const amenities = searchParams.amenities;
  const minPrice = searchParams.minPrice;
  const maxPrice = searchParams.maxPrice;

  return (
    <div className="w-full">
      <ProjectsList
        page={page}
        pageSize={50}
        neighborhood={neighborhood}
        city={city}
        status={status}
        rooms={rooms}
        amenities={amenities}
        minPrice={minPrice}
        maxPrice={maxPrice}
      />
    </div>
  );
}