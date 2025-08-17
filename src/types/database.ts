// =============================================================================
// DATABASE TYPES FOR DOMERA PLATFORM
// TypeScript types matching Supabase schema
// Generated: August 2025
// =============================================================================

// =============================================================================
// ENUMS
// =============================================================================

export type UserRole = 
  | 'admin'
  | 'organization_owner' 
  | 'sales_manager'
  | 'finance_manager'
  | 'site_manager'
  | 'professional'
  | 'user';

export type OrganizationStatus = 'active' | 'inactive' | 'pending_approval' | 'suspended';

export type ProjectStatus = 'planning' | 'pre_sale' | 'construction' | 'completed' | 'delivered';

export type UnitType = 'apartment' | 'commercial_space' | 'garage' | 'storage' | 'office';

export type UnitStatus = 'available' | 'reserved' | 'sold' | 'in_process';

export type OperationStatus = 
  | 'initiated'
  | 'documents_pending' 
  | 'documents_uploaded'
  | 'under_validation'
  | 'professional_assigned'
  | 'waiting_signature'
  | 'signature_completed'
  | 'payment_pending'
  | 'payment_confirmed'
  | 'completed'
  | 'cancelled';

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export type DocumentType = 
  | 'boleto_reserva'
  | 'compromiso_compraventa' 
  | 'comprobante_pago'
  | 'cedula_identidad'
  | 'certificado_ingresos'
  | 'escritura'
  | 'plano_unidad'
  | 'reglamento_copropiedad'
  | 'otros';

export type DocumentStatus = 'pending' | 'uploaded' | 'validated' | 'rejected' | 'expired';

export type ProfessionalType = 'escribania' | 'contaduria' | 'legal' | 'otros';

export type NotificationType = 
  | 'operation_update'
  | 'document_upload'
  | 'validation_required'
  | 'payment_reminder'
  | 'system_announcement'
  | 'professional_assignment';

// =============================================================================
// BASE TYPES
// =============================================================================

export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
  is_corrected: boolean;
  correction_of: string | null;
}

// =============================================================================
// MAIN TABLE TYPES
// =============================================================================

export interface Organization extends BaseRecord {
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  status: OrganizationStatus;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  created_by: string | null;
}

export interface User extends BaseRecord {
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  document_type: string | null;
  document_number: string | null;
  address: string | null;
  city: string | null;
  country: string;
  avatar_url: string | null;
  is_active: boolean;
  last_login: string | null;
  created_by: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  organization_id: string | null;
  role: UserRole;
  is_active: boolean;
  assigned_at: string;
  assigned_by: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  is_corrected: boolean;
  correction_of: string | null;
}

export interface Project extends BaseRecord {
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  address: string;
  neighborhood: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
  status: ProjectStatus;
  start_date: string | null;
  estimated_completion: string | null;
  actual_completion: string | null;
  total_units: number;
  available_units: number;
  base_price: number | null;
  currency: string;
  legal_regime: string | null;
  images: string[];
  amenities: ProjectAmenity[];
  master_plan_files: string[];
  progress_updates: ProjectProgressUpdate[];
  created_by: string | null;
  
  // Relations
  organization?: Organization;
  units?: Unit[];
}

export interface Unit extends BaseRecord {
  project_id: string;
  unit_number: string;
  floor: number | null;
  unit_type: UnitType;
  status: UnitStatus;
  bedrooms: number;
  bathrooms: number;
  total_area: number | null;
  built_area: number | null;
  orientation: string | null;
  facing: string | null;
  price: number;
  currency: string;
  description: string | null;
  features: string[];
  images: string[];
  floor_plan_url: string | null;
  dimensions: string | null;
  created_by: string | null;

  // Relations
  project?: Project;
}

export interface Operation {
  id: string;
  user_id: string;
  organization_id: string;
  status: OperationStatus;
  total_amount: number;
  platform_fee: number;
  currency: string;
  notes: string | null;
  started_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  created_by: string | null;
  is_corrected: boolean;
  correction_of: string | null;

  // Relations
  user?: User;
  organization?: Organization;
  units?: Unit[];
  operation_units?: OperationUnit[];
  steps?: OperationStep[];
  professional_assignments?: ProfessionalAssignment[];
  documents?: Document[];
}

export interface OperationUnit {
  id: string;
  operation_id: string;
  unit_id: string;
  price_at_reservation: number;
  created_at: string;

  // Relations
  operation?: Operation;
  unit?: Unit;
}

export interface OperationStep {
  id: string;
  operation_id: string;
  step_name: string;
  step_order: number;
  status: StepStatus;
  assigned_to: string | null;
  started_at: string | null;
  completed_at: string | null;
  due_date: string | null;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;

  // Relations
  operation?: Operation;
  assigned_user?: User;
}

export interface Document extends BaseRecord {
  operation_id: string | null;
  user_id: string;
  organization_id: string | null;
  document_type: DocumentType;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  status: DocumentStatus;
  uploaded_by: string;
  validated_by: string | null;
  validated_at: string | null;
  validation_notes: string | null;
  expires_at: string | null;
  signature_url: string | null;
  is_signed: boolean;
  signed_at: string | null;

  // Relations
  operation?: Operation;
  user?: User;
  organization?: Organization;
  uploader?: User;
  validator?: User;
}

export interface DocumentTemplate {
  id: string;
  organization_id: string | null;
  document_type: DocumentType;
  name: string;
  description: string | null;
  template_content: string | null;
  file_url: string | null;
  version: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;

  // Relations
  organization?: Organization;
  creator?: User;
}

export interface Professional extends BaseRecord {
  user_id: string;
  professional_type: ProfessionalType;
  company_name: string | null;
  registration_number: string | null;
  specializations: string[];
  service_areas: string[];
  hourly_rate: number | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  is_active: boolean;

  // Relations
  user?: User;
  verifier?: User;
}

export interface ProfessionalAssignment {
  id: string;
  operation_id: string;
  professional_id: string;
  assigned_by: string;
  assigned_at: string;
  completed_at: string | null;
  status: string;
  notes: string | null;
  is_active: boolean;

  // Relations
  operation?: Operation;
  professional?: Professional;
  assigner?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  operation_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  created_at: string;
  metadata: Record<string, any>;

  // Relations
  user?: User;
  operation?: Operation;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  table_name: string;
  record_id: string;
  action: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;

  // Relations
  user?: User;
  organization?: Organization;
}

export interface DataCorrection {
  id: string;
  table_name: string;
  record_id: string;
  requested_by: string;
  approved_by: string | null;
  correction_reason: string;
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  status: string;
  requested_at: string;
  processed_at: string | null;
  notes: string | null;

  // Relations
  requester?: User;
  approver?: User;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface ProjectAmenity {
  icon: string;
  text: string;
}

export interface ProjectProgressUpdate {
  date: string;
  title: string;
  description: string;
  images: string[];
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface CreateOperationRequest {
  unitIds: string[];
  notes?: string;
}

export interface UpdateOperationRequest {
  status?: OperationStatus;
  notes?: string;
}

export interface CreateDocumentRequest {
  operationId?: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  file: File;
}

export interface AssignProfessionalRequest {
  operationId: string;
  professionalId: string;
  notes?: string;
}

// =============================================================================
// DASHBOARD TYPES
// =============================================================================

export interface DashboardStats {
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  reservedUnits: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeOperations: number;
  pendingValidations: number;
}

export interface SalesData {
  month: string;
  sales: number;
  revenue: number;
}

// =============================================================================
// SUPABASE DATABASE TYPE
// =============================================================================

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at' | 'is_corrected' | 'correction_of'>;
        Update: Partial<Omit<Organization, 'id' | 'created_at'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at' | 'is_corrected' | 'correction_of'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      user_roles: {
        Row: UserRole;
        Insert: Omit<UserRole, 'id' | 'assigned_at' | 'is_corrected' | 'correction_of'>;
        Update: Partial<Omit<UserRole, 'id'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'is_corrected' | 'correction_of'>;
        Update: Partial<Omit<Project, 'id' | 'created_at'>>;
      };
      units: {
        Row: Unit;
        Insert: Omit<Unit, 'id' | 'created_at' | 'updated_at' | 'is_corrected' | 'correction_of'>;
        Update: Partial<Omit<Unit, 'id' | 'created_at'>>;
      };
      operations: {
        Row: Operation;
        Insert: Omit<Operation, 'id' | 'started_at' | 'is_corrected' | 'correction_of'>;
        Update: Partial<Omit<Operation, 'id'>>;
      };
      operation_units: {
        Row: OperationUnit;
        Insert: Omit<OperationUnit, 'id' | 'created_at'>;
        Update: Partial<Omit<OperationUnit, 'id' | 'created_at'>>;
      };
      operation_steps: {
        Row: OperationStep;
        Insert: Omit<OperationStep, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<OperationStep, 'id' | 'created_at'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at' | 'is_corrected' | 'correction_of'>;
        Update: Partial<Omit<Document, 'id' | 'created_at'>>;
      };
      document_templates: {
        Row: DocumentTemplate;
        Insert: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DocumentTemplate, 'id' | 'created_at'>>;
      };
      professionals: {
        Row: Professional;
        Insert: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'is_corrected' | 'correction_of'>;
        Update: Partial<Omit<Professional, 'id' | 'created_at'>>;
      };
      professional_assignments: {
        Row: ProfessionalAssignment;
        Insert: Omit<ProfessionalAssignment, 'id' | 'assigned_at'>;
        Update: Partial<Omit<ProfessionalAssignment, 'id' | 'assigned_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: never;
      };
      data_corrections: {
        Row: DataCorrection;
        Insert: Omit<DataCorrection, 'id' | 'requested_at'>;
        Update: Partial<Omit<DataCorrection, 'id' | 'requested_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      organization_status: OrganizationStatus;
      project_status: ProjectStatus;
      unit_type: UnitType;
      unit_status: UnitStatus;
      operation_status: OperationStatus;
      step_status: StepStatus;
      document_type: DocumentType;
      document_status: DocumentStatus;
      professional_type: ProfessionalType;
      notification_type: NotificationType;
    };
  };
}