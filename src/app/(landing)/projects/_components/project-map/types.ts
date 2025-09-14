export interface ProjectFeature {
  name: string;
  hasFeature: boolean;
}

export interface ProjectDisplayData {
  id: string;
  slug: string;
  title: string;
  price: string;
  images: unknown;
  status: string;
  date: string;
  features: ProjectFeature[];
  latitude: number;
  longitude: number;
  neighborhood?: string;
  city?: string;
}

export interface ProjectMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  popup?: string;
  isSelected?: boolean;
}

export interface ProjectsMapViewProps {
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
