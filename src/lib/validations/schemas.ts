// =============================================================================
// ZOD VALIDATION SCHEMAS FOR DOMERA PLATFORM
// Comprehensive validation schemas for all entities
// Created: August 2025
// =============================================================================

import { z } from "zod";

import type {
  DocumentStatus,
  DocumentType,
  NotificationType,
  OperationStatus,
  OrganizationStatus,
  ProfessionalType,
  ProjectStatus,
  UnitStatus,
  UnitType,
  UserRole,
} from "@/types/database";

// =============================================================================
// ENUM SCHEMAS
// =============================================================================

export const UserRoleSchema = z.enum([
  "admin",
  "organization_owner",
  "sales_manager",
  "finance_manager",
  "site_manager",
  "professional",
  "user",
] as const);

export const OrganizationStatusSchema = z.enum([
  "active",
  "inactive",
  "pending_approval",
  "suspended",
] as const);

export const ProjectStatusSchema = z.enum([
  "planning",
  "pre_sale",
  "construction",
  "completed",
  "delivered",
] as const);

export const UnitTypeSchema = z.enum([
  "apartment",
  "commercial_space",
  "garage",
  "storage",
  "office",
] as const);

export const UnitStatusSchema = z.enum([
  "available",
  "reserved",
  "sold",
  "in_process",
] as const);

export const OperationStatusSchema = z.enum([
  "initiated",
  "documents_pending",
  "documents_uploaded",
  "under_validation",
  "professional_assigned",
  "waiting_signature",
  "signature_completed",
  "payment_pending",
  "payment_confirmed",
  "completed",
  "cancelled",
] as const);

export const DocumentTypeSchema = z.enum([
  "boleto_reserva",
  "compromiso_compraventa",
  "comprobante_pago",
  "cedula_identidad",
  "certificado_ingresos",
  "escritura",
  "plano_unidad",
  "reglamento_copropiedad",
  "otros",
] as const);

export const DocumentStatusSchema = z.enum([
  "pending",
  "uploaded",
  "validated",
  "rejected",
  "expired",
] as const);

export const ProfessionalTypeSchema = z.enum([
  "escribania",
  "contaduria",
  "legal",
  "otros",
] as const);

export const NotificationTypeSchema = z.enum([
  "operation_update",
  "document_upload",
  "validation_required",
  "payment_reminder",
  "system_announcement",
  "professional_assignment",
] as const);

// =============================================================================
// COMMON VALIDATION HELPERS
// =============================================================================

export const UUIDSchema = z.string().uuid("ID debe ser un UUID válido");
export const EmailSchema = z.string().email("Email debe tener formato válido");
export const PhoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Teléfono debe tener formato válido");
export const CurrencySchema = z.enum(["USD", "UYU"] as const);
export const DocumentNumberSchema = z
  .string()
  .regex(/^\d{7,8}$/, "Número de documento debe tener 7-8 dígitos");
export const TaxIdSchema = z
  .string()
  .regex(/^\d{12}$/, "RUT debe tener 12 dígitos");

// Date validation helpers
export const DateStringSchema = z
  .string()
  .datetime("Fecha debe ser ISO string válido");
export const DateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe tener formato YYYY-MM-DD");

// Password validation helpers
export const PasswordSchema = z
  .string()
  .min(8, "Contraseña debe tener al menos 8 caracteres")
  .max(128, "Contraseña debe tener máximo 128 caracteres")
  .regex(/[A-Z]/, "Contraseña debe contener al menos una letra mayúscula")
  .regex(/[a-z]/, "Contraseña debe contener al menos una letra minúscula")
  .regex(/[0-9]/, "Contraseña debe contener al menos un número")
  .regex(
    /[^A-Za-z0-9]/,
    "Contraseña debe contener al menos un carácter especial",
  );

// =============================================================================
// ORGANIZATION SCHEMAS
// =============================================================================

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Nombre es requerido").max(255, "Nombre muy largo"),
  slug: z
    .string()
    .min(1, "Slug es requerido")
    .max(100, "Slug muy largo")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug solo puede contener letras minúsculas, números y guiones",
    ),
  email: EmailSchema,
  phone: PhoneSchema.optional(),
  address: z.string().max(500, "Dirección muy larga").optional(),
  taxId: TaxIdSchema.optional(),
  websiteUrl: z.string().url("URL inválida").optional(),
  description: z.string().max(1000, "Descripción muy larga").optional(),
  status: OrganizationStatusSchema.default("pending_approval"),
  logoUrl: z.string().url("URL de logo inválida").optional(),
});

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

// =============================================================================
// USER SCHEMAS
// =============================================================================

export const CreateUserSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  first_name: z
    .string()
    .min(1, "Nombre es requerido")
    .max(100, "Nombre muy largo"),
  last_name: z
    .string()
    .min(1, "Apellido es requerido")
    .max(100, "Apellido muy largo"),
  phone: PhoneSchema.optional(),
  document_type: z.enum(["cedula", "passport", "rut"]).optional(),
  document_number: z
    .string()
    .max(50, "Número de documento muy largo")
    .optional(),
  address: z.string().max(500, "Dirección muy larga").optional(),
  city: z.string().max(100, "Ciudad muy larga").optional(),
  country: z.string().max(100, "País muy largo").default("Uruguay"),
});

export const UpdateUserSchema = CreateUserSchema.omit({
  password: true,
}).partial();

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Contraseña es requerida"),
});

export const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Contraseña actual es requerida"),
    new_password: PasswordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

export const AssignUserRoleSchema = z.object({
  user_id: UUIDSchema,
  organization_id: UUIDSchema.optional(),
  role: UserRoleSchema,
});

// =============================================================================
// PROJECT SCHEMAS
// =============================================================================

export const ProjectAmenitySchema = z.string().min(1, "Texto de amenidad es requerido");

export const ProjectDetalleSchema = z.string().min(1, "Texto de característica es requerido");

export const ProjectProgressUpdateSchema = z.object({
  date: DateOnlySchema,
  title: z.string().min(1, "Título es requerido"),
  description: z.string().min(1, "Descripción es requerida"),
  images: z.array(z.string().url("URL de imagen inválida")),
});

export const CreateProjectSchema = z.object({
  organization_id: UUIDSchema,
  name: z.string().min(1, "Nombre es requerido").max(255, "Nombre muy largo"),
  slug: z
    .string()
    .min(1, "Slug es requerido")
    .max(255, "Slug muy largo")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug solo puede contener letras minúsculas, números y guiones",
    ),
  description: z.string().max(5000, "Descripción muy larga").optional(),
  short_description: z
    .string()
    .max(500, "Descripción corta muy larga")
    .optional(),
  address: z
    .string()
    .min(1, "Dirección es requerida")
    .max(500, "Dirección muy larga"),
  neighborhood: z.string().max(100, "Barrio muy largo").optional(),
  city: z.string().min(1, "Ciudad es requerida").max(100, "Ciudad muy larga"),
  latitude: z.number().min(-90).max(90, "Latitud inválida").optional(),
  longitude: z.number().min(-180).max(180, "Longitud inválida").optional(),
  status: ProjectStatusSchema.default("planning"),
  start_date: DateOnlySchema.optional(),
  estimated_completion: DateOnlySchema.optional(),
  base_price: z.number().positive("Precio base debe ser positivo").optional(),
  currency: CurrencySchema.default("USD"),
  legal_regime: z.string().max(100, "Régimen legal muy largo").optional(),
  images: z.array(z.string().url("URL de imagen inválida")).default([]),
  amenities: z.array(ProjectAmenitySchema).default([]),
  detalles: z.array(ProjectDetalleSchema).default([]),
  master_plan_files: z.array(z.string()).default([]),
});

export const UpdateProjectSchema = CreateProjectSchema.partial().omit([
  "organization_id",
]);

// =============================================================================
// UNIT SCHEMAS
// =============================================================================

export const CreateUnitSchema = z.object({
  project_id: UUIDSchema,
  unit_number: z
    .string()
    .min(1, "Número de unidad es requerido")
    .max(50, "Número muy largo"),
  floor: z
    .number()
    .int("Piso debe ser un entero")
    .min(-10, "Piso muy bajo (mínimo: -10 para garages profundos)")
    .max(100, "Piso muy alto")
    .optional(),
  unit_type: UnitTypeSchema,
  bedrooms: z
    .number()
    .int("Dormitorios debe ser un entero")
    .min(0, "No puede ser negativo")
    .default(0),
  bathrooms: z
    .number()
    .int("Baños debe ser un entero")
    .min(0, "No puede ser negativo")
    .default(0),
  total_area: z.number().positive("Área total debe ser positiva").optional(),
  built_area: z
    .number()
    .positive("Área construida debe ser positiva")
    .optional(),
  orientation: z.string().max(50, "Orientación muy larga").optional(),
  facing: z.string().max(50, "Frente muy largo").optional(),
  price: z.number().positive("Precio debe ser positivo"),
  currency: CurrencySchema.default("USD"),
  description: z.string().max(1000, "Descripción muy larga").optional(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string().url("URL de imagen inválida")).default([]),
  floor_plan_url: z.string().url("URL de plano inválida").optional(),
  dimensions: z.string().max(100, "Dimensiones muy largas").optional(),
});

export const UpdateUnitSchema = CreateUnitSchema.partial().omit(["project_id"]);

// =============================================================================
// BULK UNIT SCHEMAS
// =============================================================================

export const BulkCreateUnitsSchema = z.object({
  project_id: UUIDSchema,
  units: z
    .array(CreateUnitSchema.omit({ project_id: true }))
    .min(1, "Debe incluir al menos una unidad")
    .max(500, "Máximo 500 unidades por lote para mantener rendimiento")
    .refine(
      (units) => {
        // Check for duplicate unit numbers within the batch
        const unitNumbers = units.map((u) => u.unit_number.toLowerCase());
        const uniqueNumbers = new Set(unitNumbers);
        return unitNumbers.length === uniqueNumbers.size;
      },
      {
        message: "Se encontraron números de unidad duplicados en el lote",
      },
    )
    .refine(
      (units) => {
        // Validate garage unit types for negative floors
        const invalidGarageUnits = units.filter(
          (unit) =>
            unit.floor !== undefined &&
            unit.floor < 0 &&
            !["garage", "cochera", "deposito", "storage"].includes(
              unit.unit_type.toLowerCase(),
            ),
        );
        return invalidGarageUnits.length === 0;
      },
      {
        message:
          "Unidades en pisos negativos (garages) deben tener tipo: garage, cochera, deposito o storage",
      },
    )
    .refine(
      (units) => {
        // Validate bedroom/bathroom consistency
        const invalidUnits = units.filter(
          (unit) => unit.bedrooms > 0 && unit.bathrooms === 0,
        );
        return invalidUnits.length === 0;
      },
      {
        message: "Unidades con dormitorios deben tener al menos 1 baño",
      },
    )
    .refine(
      (units) => {
        // Validate reasonable price ranges
        const invalidPriceUnits = units.filter(
          (unit) => unit.price < 1000 || unit.price > 10000000,
        );
        return invalidPriceUnits.length === 0;
      },
      {
        message: "Precios deben estar entre $1,000 y $10,000,000 USD",
      },
    ),
});

// =============================================================================
// BULK OPERATION RESULT TYPES
// =============================================================================

export interface BulkUnitValidationError {
  index: number;
  unitNumber?: string;
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface BulkOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: BulkUnitValidationError[];
  performance?: {
    processedCount: number;
    duration: number;
    itemsPerSecond: number;
  };
}

export const UpdateUnitStatusSchema = z.object({
  status: UnitStatusSchema,
});

// =============================================================================
// OPERATION SCHEMAS
// =============================================================================

export const CreateOperationSchema = z.object({
  unitIds: z.array(UUIDSchema).min(1, "Debe seleccionar al menos una unidad"),
  organizationId: UUIDSchema,
  totalAmount: z.number().min(0, "Monto total debe ser positivo"),
  notes: z.string().max(1000, "Notas muy largas").optional(),
});

export const UpdateOperationSchema = z.object({
  status: OperationStatusSchema.optional(),
  notes: z.string().max(1000, "Notas muy largas").optional(),
  cancellation_reason: z
    .string()
    .max(500, "Razón de cancelación muy larga")
    .optional(),
});

// =============================================================================
// DOCUMENT SCHEMAS
// =============================================================================

export const CreateDocumentSchema = z.object({
  operation_id: UUIDSchema.optional(),
  document_type: DocumentTypeSchema,
  title: z.string().min(1, "Título es requerido").max(255, "Título muy largo"),
  description: z.string().max(1000, "Descripción muy larga").optional(),
  file_name: z
    .string()
    .min(1, "Nombre de archivo es requerido")
    .max(255, "Nombre muy largo"),
  file_size: z.number().positive("Tamaño de archivo inválido").optional(),
  mime_type: z.string().max(100, "Tipo MIME muy largo").optional(),
  expires_at: DateStringSchema.optional(),
});

export const UpdateDocumentSchema = z.object({
  title: z
    .string()
    .min(1, "Título es requerido")
    .max(255, "Título muy largo")
    .optional(),
  description: z.string().max(1000, "Descripción muy larga").optional(),
  status: DocumentStatusSchema.optional(),
  validation_notes: z
    .string()
    .max(1000, "Notas de validación muy largas")
    .optional(),
  signature_url: z.string().url("URL de firma inválida").optional(),
  is_signed: z.boolean().optional(),
});

export const ValidateDocumentSchema = z.object({
  status: z.enum(["validated", "rejected"]),
  validation_notes: z.string().max(1000, "Notas muy largas").optional(),
});

// =============================================================================
// PROFESSIONAL SCHEMAS
// =============================================================================

export const CreateProfessionalSchema = z.object({
  user_id: UUIDSchema,
  professional_type: ProfessionalTypeSchema,
  company_name: z.string().max(255, "Nombre de empresa muy largo").optional(),
  registration_number: z
    .string()
    .max(100, "Número de registro muy largo")
    .optional(),
  specializations: z.array(z.string()).default([]),
  service_areas: z.array(z.string()).default([]),
  hourly_rate: z.number().positive("Tarifa debe ser positiva").optional(),
});

export const UpdateProfessionalSchema = CreateProfessionalSchema.partial().omit(
  ["user_id"],
);

export const AssignProfessionalSchema = z.object({
  operation_id: UUIDSchema,
  professional_id: UUIDSchema,
  notes: z.string().max(1000, "Notas muy largas").optional(),
});

// =============================================================================
// NOTIFICATION SCHEMAS
// =============================================================================

export const CreateNotificationSchema = z.object({
  user_id: UUIDSchema,
  operation_id: UUIDSchema.optional(),
  type: NotificationTypeSchema,
  title: z.string().min(1, "Título es requerido").max(255, "Título muy largo"),
  message: z
    .string()
    .min(1, "Mensaje es requerido")
    .max(1000, "Mensaje muy largo"),
  metadata: z.record(z.any()).default({}),
});

// =============================================================================
// FILTER AND QUERY SCHEMAS
// =============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().positive("Página debe ser positiva").default(1),
  pageSize: z
    .number()
    .int()
    .positive("Tamaño de página debe ser positivo")
    .min(1)
    .max(100)
    .default(20),
});

export const ProjectFiltersSchema = z
  .object({
    organizationId: UUIDSchema.optional(),
    status: ProjectStatusSchema.optional(),
    city: z.string().optional(),
    neighborhood: z.string().optional(),
    minPrice: z.number().positive().optional(),
    maxPrice: z.number().positive().optional(),
    search: z.string().optional(),
    rooms: z.string().optional(),
    amenities: z.string().optional(),
  })
  .merge(PaginationSchema);

export const UnitFiltersSchema = z
  .object({
    project_id: UUIDSchema.optional(),
    unit_type: UnitTypeSchema.optional(),
    status: UnitStatusSchema.optional(),
    min_bedrooms: z.number().int().min(0).optional(),
    max_bedrooms: z.number().int().min(0).optional(),
    min_price: z.number().positive().optional(),
    max_price: z.number().positive().optional(),
    orientation: z.string().optional(),
    floor: z.number().int().optional(),
  })
  .merge(PaginationSchema);

export const OperationFiltersSchema = z
  .object({
    user_id: UUIDSchema.optional(),
    organization_id: UUIDSchema.optional(),
    status: OperationStatusSchema.optional(),
    date_from: DateOnlySchema.optional(),
    date_to: DateOnlySchema.optional(),
  })
  .merge(PaginationSchema);

// =============================================================================
// BULK OPERATION SCHEMAS
// =============================================================================

export const BulkUpdateUnitsSchema = z.object({
  unit_ids: z.array(UUIDSchema).min(1, "Debe seleccionar al menos una unidad"),
  updates: UpdateUnitSchema,
});

export const BulkStatusUpdateSchema = z.object({
  ids: z.array(UUIDSchema).min(1, "Debe seleccionar al menos un elemento"),
  status: z.string().min(1, "Estado es requerido"),
});

// =============================================================================
// AUDIT AND CORRECTION SCHEMAS
// =============================================================================

export const CreateDataCorrectionSchema = z.object({
  table_name: z.string().min(1, "Nombre de tabla es requerido"),
  record_id: UUIDSchema,
  correction_reason: z
    .string()
    .min(1, "Razón de corrección es requerida")
    .max(1000, "Razón muy larga"),
  old_values: z.record(z.any()),
  new_values: z.record(z.any()),
});

export const ProcessDataCorrectionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  notes: z.string().max(1000, "Notas muy largas").optional(),
});

// =============================================================================
// DASHBOARD AND REPORTING SCHEMAS
// =============================================================================

export const DashboardDateRangeSchema = z
  .object({
    start_date: DateOnlySchema,
    end_date: DateOnlySchema,
  })
  .refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
    message: "Fecha de inicio debe ser anterior a fecha de fin",
    path: ["start_date"],
  });

// =============================================================================
// FILE UPLOAD SCHEMAS
// =============================================================================

export const FileUploadSchema = z.object({
  file: z.instanceof(File, "Debe ser un archivo válido"),
  document_type: DocumentTypeSchema.optional(),
  max_size: z.number().default(10 * 1024 * 1024), // 10MB default
  allowed_types: z
    .array(z.string())
    .default(["application/pdf", "image/jpeg", "image/png"]),
});

// =============================================================================
// EXPORT TYPE DEFINITIONS
// =============================================================================

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type CreateUnitInput = z.infer<typeof CreateUnitSchema>;
export type BulkCreateUnitsInput = z.infer<typeof BulkCreateUnitsSchema>;
export type UpdateUnitInput = z.infer<typeof UpdateUnitSchema>;
export type CreateOperationInput = z.infer<typeof CreateOperationSchema>;
export type UpdateOperationInput = z.infer<typeof UpdateOperationSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>;
export type CreateProfessionalInput = z.infer<typeof CreateProfessionalSchema>;
export type UpdateProfessionalInput = z.infer<typeof UpdateProfessionalSchema>;
export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
export type ProjectFiltersInput = z.infer<typeof ProjectFiltersSchema>;
export type UnitFiltersInput = z.infer<typeof UnitFiltersSchema>;
export type OperationFiltersInput = z.infer<typeof OperationFiltersSchema>;
