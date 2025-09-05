export interface ProjectFormData {
  // Información básica del proyecto
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  address: string;
  neighborhood: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  basePrice: number | null;
  currency: "USD" | "UYU";
  estimatedCompletion: Date | null;
  organizationId?: string;
  status: "planning" | "pre_sale" | "construction" | "completed" | "delivered";

  // Imágenes y archivos - URLs como strings tras ser subidas
  images: string[];
  masterPlanFiles: string[];

  // Contenido detallado - respetando el schema del DAL
  amenities: Array<{ icon: string; text: string }>;
  detalles: Array<{ text: string }>;

  // Estados del formulario
  isEditing?: boolean;
  originalSlug?: string;
}

export interface ProjectFormSection {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  order: number;
  required: boolean;
}

export interface ImageUploadProps {
  value: string | File | null;
  onChange: (file: File | null) => void;
  preview?: string;
  placeholder?: string;
  aspectRatio?: string;
  maxSize?: number;
  accept?: string;
}

export interface ImageArrayUploadProps {
  value: (string | File)[];
  onChange: (files: (string | File)[]) => void;
  maxImages?: number;
  placeholder?: string;
  maxSize?: number;
  accept?: string;
}

export interface FormFieldProps<T = any> {
  value: T;
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface HeroFormProps
  extends FormFieldProps<{
    name: string;
    basePrice: number | null;
    neighborhood: string;
    city: string;
    estimatedCompletion: Date | null;
    images: string[];
  }> {
  currency: string;
}

export interface DescriptionFormProps
  extends FormFieldProps<{
    description: string;
    shortDescription: string;
    address: string;
  }> {}

export interface DetailsFormProps
  extends FormFieldProps<{
    amenities: Array<{ icon: string; text: string }>;
    detalles: Array<{ text: string }>;
  }> {}

export interface LocationFormProps
  extends FormFieldProps<{
    latitude: number | null;
    longitude: number | null;
    masterPlanFiles: string[];
  }> {
  projectName: string;
}

export interface ImageCarouselFormProps
  extends FormFieldProps<{
    images: string[];
  }> {
  projectId: string;
  className: string;
  projectName: string;
}

export interface CoordinatesFormProps
  extends FormFieldProps<{
    latitude: number | null;
    longitude: number | null;
  }> {}
