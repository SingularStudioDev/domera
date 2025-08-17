-- =============================================================================
-- DOMERA PLATFORM DATABASE SCHEMA
-- Comprehensive schema for pre-construction real estate platform
-- Created: August 2025
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS AND ORGANIZATIONS
-- =============================================================================

-- User roles enum
CREATE TYPE user_role AS ENUM (
  'admin',
  'organization_owner', 
  'sales_manager',
  'finance_manager',
  'site_manager',
  'professional',
  'user'
);

-- Organization status enum
CREATE TYPE organization_status AS ENUM ('active', 'inactive', 'pending_approval', 'suspended');

-- Organizations table (developers/constructors)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  tax_id VARCHAR(50) UNIQUE,
  status organization_status DEFAULT 'pending_approval',
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  is_corrected BOOLEAN DEFAULT FALSE,
  correction_of UUID REFERENCES organizations(id)
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  document_type VARCHAR(20), -- 'cedula', 'passport', 'rut'
  document_number VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Uruguay',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_corrected BOOLEAN DEFAULT FALSE,
  correction_of UUID REFERENCES users(id)
);

-- User roles in organizations
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES users(id),
  is_corrected BOOLEAN DEFAULT FALSE,
  correction_of UUID REFERENCES user_roles(id),
  UNIQUE(user_id, organization_id, role)
);

-- =============================================================================
-- PROJECTS AND PROPERTIES
-- =============================================================================

-- Project status enum
CREATE TYPE project_status AS ENUM ('planning', 'pre_sale', 'construction', 'completed', 'delivered');

-- Unit types enum
CREATE TYPE unit_type AS ENUM ('apartment', 'commercial_space', 'garage', 'storage', 'office');

-- Unit status enum
CREATE TYPE unit_status AS ENUM ('available', 'reserved', 'sold', 'in_process');

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  short_description TEXT,
  address TEXT NOT NULL,
  neighborhood VARCHAR(100),
  city VARCHAR(100) NOT NULL DEFAULT 'Montevideo',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status project_status DEFAULT 'planning',
  start_date DATE,
  estimated_completion DATE,
  actual_completion DATE,
  total_units INTEGER DEFAULT 0,
  available_units INTEGER DEFAULT 0,
  base_price DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  legal_regime VARCHAR(100), -- 'Ley de Vivienda Promovida N°18.795'
  images JSONB DEFAULT '[]',
  amenities JSONB DEFAULT '[]',
  master_plan_files JSONB DEFAULT '[]',
  progress_updates JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_corrected BOOLEAN DEFAULT FALSE,
  correction_of UUID REFERENCES projects(id),
  UNIQUE(organization_id, slug)
);

-- Units table (apartments, garages, storage, etc.)
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  unit_number VARCHAR(50) NOT NULL,
  floor INTEGER,
  unit_type unit_type NOT NULL,
  status unit_status DEFAULT 'available',
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  total_area DECIMAL(8, 2), -- in square meters
  built_area DECIMAL(8, 2),
  orientation VARCHAR(50), -- 'Norte', 'Sur', 'Este', 'Oeste'
  facing VARCHAR(50), -- 'Frente', 'Contra-Frente', 'Lateral'
  price DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  features JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  floor_plan_url TEXT,
  dimensions VARCHAR(100), -- For garages/storage: '2.5x4m'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_corrected BOOLEAN DEFAULT FALSE,
  correction_of UUID REFERENCES units(id),
  UNIQUE(project_id, unit_number)
);

-- =============================================================================
-- OPERATIONS AND RESERVATIONS
-- =============================================================================

-- Operation status enum
CREATE TYPE operation_status AS ENUM (
  'initiated',
  'documents_pending', 
  'documents_uploaded',
  'under_validation',
  'professional_assigned',
  'waiting_signature',
  'signature_completed',
  'payment_pending',
  'payment_confirmed',
  'completed',
  'cancelled'
);

-- Step status enum
CREATE TYPE step_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped');

-- Operations table (replaces cart - one active operation per user)
CREATE TABLE operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status operation_status DEFAULT 'initiated',
  total_amount DECIMAL(15, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) DEFAULT 3000.00,
  currency VARCHAR(3) DEFAULT 'USD',
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,
  created_by UUID REFERENCES users(id),
  is_corrected BOOLEAN DEFAULT FALSE,
  correction_of UUID REFERENCES operations(id)
);

-- Operation units (many-to-many: operation can have multiple units)
CREATE TABLE operation_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  price_at_reservation DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(operation_id, unit_id)
);

-- Operation steps (workflow tracking)
CREATE TABLE operation_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL, -- 'document_upload', 'professional_validation', etc.
  step_order INTEGER NOT NULL,
  status step_status DEFAULT 'pending',
  assigned_to UUID REFERENCES users(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(operation_id, step_name)
);

-- =============================================================================
-- DOCUMENTS AND TEMPLATES
-- =============================================================================

-- Document types enum
CREATE TYPE document_type AS ENUM (
  'boleto_reserva',
  'compromiso_compraventa', 
  'comprobante_pago',
  'cedula_identidad',
  'certificado_ingresos',
  'escritura',
  'plano_unidad',
  'reglamento_copropiedad',
  'otros'
);

-- Document status enum  
CREATE TYPE document_status AS ENUM ('pending', 'uploaded', 'validated', 'rejected', 'expired');

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  status document_status DEFAULT 'uploaded',
  uploaded_by UUID NOT NULL REFERENCES users(id),
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  validation_notes TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  signature_url TEXT, -- External link to Abitab/Agesic
  is_signed BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_corrected BOOLEAN DEFAULT FALSE,
  correction_of UUID REFERENCES documents(id)
);

-- Document templates for professionals and organizations
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_content TEXT, -- HTML/text content with placeholders
  file_url TEXT, -- For downloadable PDF templates
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PROFESSIONALS AND VALIDATIONS
-- =============================================================================

-- Professional types enum
CREATE TYPE professional_type AS ENUM ('escribania', 'contaduria', 'legal', 'otros');

-- Professionals table (external service providers)
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professional_type professional_type NOT NULL,
  company_name VARCHAR(255),
  registration_number VARCHAR(100), -- Professional license number
  specializations JSONB DEFAULT '[]',
  service_areas JSONB DEFAULT '[]', -- Geographic areas they serve
  hourly_rate DECIMAL(10, 2),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_corrected BOOLEAN DEFAULT FALSE,
  correction_of UUID REFERENCES professionals(id)
);

-- Professional assignments to operations
CREATE TABLE professional_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'assigned',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- =============================================================================
-- NOTIFICATIONS AND COMMUNICATIONS
-- =============================================================================

-- Notification types enum
CREATE TYPE notification_type AS ENUM (
  'operation_update',
  'document_upload',
  'validation_required',
  'payment_reminder',
  'system_announcement',
  'professional_assignment'
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- =============================================================================
-- AUDIT AND DATA INTEGRITY
-- =============================================================================

-- Audit logs table (track all important actions)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'SELECT'
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data corrections table (track correction requests)
CREATE TABLE data_corrections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  requested_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  correction_reason TEXT NOT NULL,
  old_values JSONB NOT NULL,
  new_values JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_document ON users(document_type, document_number);
CREATE INDEX idx_users_active ON users(is_active);

-- Organizations
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- User roles
CREATE INDEX idx_user_roles_user_org ON user_roles(user_id, organization_id);
CREATE INDEX idx_user_roles_active ON user_roles(is_active);

-- Projects
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_city ON projects(city);

-- Units
CREATE INDEX idx_units_project ON units(project_id);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_units_type ON units(unit_type);

-- Operations
CREATE INDEX idx_operations_user ON operations(user_id);
CREATE INDEX idx_operations_organization ON operations(organization_id);
CREATE INDEX idx_operations_status ON operations(status);
CREATE INDEX idx_operations_started ON operations(started_at);

-- Documents
CREATE INDEX idx_documents_operation ON documents(operation_id);
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Audit logs
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operation_steps_updated_at BEFORE UPDATE ON operation_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies will be defined in a separate file for better organization