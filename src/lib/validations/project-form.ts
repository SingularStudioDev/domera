import { z } from "zod";

export const projectFormSchema = z.object({
  // Información básica - Compatible con CreateProjectSchema del DAL
  name: z
    .string()
    .min(1, "El nombre del proyecto es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres"),

  slug: z
    .string()
    .min(1, "El slug es requerido")
    .max(255, "El slug no puede exceder 255 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "El slug solo puede contener letras minúsculas, números y guiones",
    ),

  description: z
    .string()
    .default("")
    .optional()
    .or(z.literal(""))
    .transform((val) => val || ""),

  shortDescription: z
    .string()
    .default("")
    .optional()
    .or(z.literal(""))
    .transform((val) => val || ""),

  address: z
    .string()
    .min(1, "La dirección es requerida")
    .max(500, "La dirección no puede exceder 500 caracteres"),

  neighborhood: z
    .string()
    .default("")
    .optional()
    .or(z.literal(""))
    .transform((val) => val || ""),

  city: z
    .string()
    .min(1, "La ciudad es requerida")
    .max(100, "La ciudad no puede exceder 100 caracteres"),

  latitude: z
    .number()
    .min(-90, "Latitud inválida")
    .max(90, "Latitud inválida")
    .nullable()
    .default(null)
    .optional(),

  longitude: z
    .number()
    .min(-180, "Longitud inválida")
    .max(180, "Longitud inválida")
    .nullable()
    .default(null)
    .optional(),

  basePrice: z
    .number()
    .positive("El precio base debe ser positivo")
    .nullable()
    .default(null),

  currency: z
    .enum(["USD", "UYU"], {
      errorMap: () => ({ message: "Moneda inválida. Debe ser USD o UYU" }),
    })
    .default("USD"),

  estimatedCompletion: z.date().nullable().default(null),

  // IMPORTANTE: organizationId puede ser opcional para super admins
  organizationId: z
    .string()
    .min(1, "Organización es requerida")
    .uuid("Organization ID debe ser un UUID válido")
    .optional(),

  status: z
    .enum(["planning", "pre_sale", "construction", "completed", "delivered"])
    .default("planning"),

  // Contenido - Compatible con el schema del DAL
  amenities: z
    .array(
      z.object({
        icon: z.string().default(""), // Allow empty icons for editing
        text: z.string().min(1, "Texto es requerido"),
      }),
    )
    .default([]),

  detalles: z
    .array(
      z.object({
        text: z.string().min(1, "Texto de detalle es requerido"),
      }),
    )
    .default([]),

  masterPlanFiles: z.array(z.string()).default([]),

  // Imágenes - URLs como strings (pueden estar vacías al principio)
  images: z.array(z.string()).default([]),

  // Campos adicionales faltantes
  details: z.array(z.string()).default([]),
  priority: z.number().min(0).max(1000).default(0).optional(),

  // Estados del formulario - opcional para no interferir con validación
  isEditing: z.boolean().optional().default(false),
  originalSlug: z.string().optional(),
});

export const heroFormSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  price: z.number().min(0).nullable(),
  location: z.string().min(1, "La ubicación es requerida"),
  date: z.date().nullable(),
  heroImage: z.any().nullable(),
});

export const descriptionFormSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  address: z.string().min(1, "La dirección es requerida"),
});

export const detailsFormSchema = z.object({
  amenities: z.array(z.string()),
  additionalFeatures: z.array(z.string()),
});

export const locationFormSchema = z.object({
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  masterPlanFiles: z.array(z.string()),
});

export const progressFormSchema = z.object({
  progressImages: z.array(z.any()),
});

export const imageCarouselFormSchema = z.object({
  projectImages: z.array(z.any()),
});

export const coordinatesFormSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Latitud inválida")
    .max(90, "Latitud inválida")
    .nullable(),
  longitude: z
    .number()
    .min(-180, "Longitud inválida")
    .max(180, "Longitud inválida")
    .nullable(),
});

// Validador de archivos de imagen
export const imageFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "El archivo no debe exceder 5MB",
  )
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Solo se permiten archivos JPG, PNG o WebP",
  );

// Validador para arrays de imágenes
export const imageArraySchema = z
  .array(z.union([z.string().url("URL de imagen inválida"), imageFileSchema]))
  .max(20, "No se pueden subir más de 20 imágenes");

// Type is defined in /types/project-form.ts to avoid conflicts
export type HeroFormData = z.infer<typeof heroFormSchema>;
export type DescriptionFormData = z.infer<typeof descriptionFormSchema>;
export type DetailsFormData = z.infer<typeof detailsFormSchema>;
export type LocationFormData = z.infer<typeof locationFormSchema>;
export type ProgressFormData = z.infer<typeof progressFormSchema>;
export type ImageCarouselFormData = z.infer<typeof imageCarouselFormSchema>;
export type CoordinatesFormData = z.infer<typeof coordinatesFormSchema>;
