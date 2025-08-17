-- CreateEnum
CREATE TYPE "public"."RoleType" AS ENUM ('admin', 'organization_owner', 'sales_manager', 'finance_manager', 'site_manager', 'professional', 'user');

-- CreateEnum
CREATE TYPE "public"."OrganizationStatus" AS ENUM ('active', 'inactive', 'pending_approval', 'suspended');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('planning', 'pre_sale', 'construction', 'completed', 'delivered');

-- CreateEnum
CREATE TYPE "public"."UnitType" AS ENUM ('apartment', 'commercial_space', 'garage', 'storage', 'office');

-- CreateEnum
CREATE TYPE "public"."UnitStatus" AS ENUM ('available', 'reserved', 'sold', 'in_process');

-- CreateEnum
CREATE TYPE "public"."OperationStatus" AS ENUM ('initiated', 'documents_pending', 'documents_uploaded', 'under_validation', 'professional_assigned', 'waiting_signature', 'signature_completed', 'payment_pending', 'payment_confirmed', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."StepStatus" AS ENUM ('pending', 'in_progress', 'completed', 'skipped');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('boleto_reserva', 'compromiso_compraventa', 'comprobante_pago', 'cedula_identidad', 'certificado_ingresos', 'escritura', 'plano_unidad', 'reglamento_copropiedad', 'otros');

-- CreateEnum
CREATE TYPE "public"."DocumentStatus" AS ENUM ('pending', 'uploaded', 'validated', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "public"."ProfessionalType" AS ENUM ('escribania', 'contaduria', 'legal', 'otros');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('operation_update', 'document_upload', 'validation_required', 'payment_reminder', 'system_announcement', 'professional_assignment');

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "address" TEXT,
    "tax_id" VARCHAR(50),
    "status" "public"."OrganizationStatus" NOT NULL DEFAULT 'pending_approval',
    "logo_url" TEXT,
    "website_url" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "is_corrected" BOOLEAN NOT NULL DEFAULT false,
    "correction_of" UUID,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(50),
    "document_type" VARCHAR(20),
    "document_number" VARCHAR(50),
    "address" TEXT,
    "city" VARCHAR(100),
    "country" VARCHAR(100) NOT NULL DEFAULT 'Uruguay',
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "is_corrected" BOOLEAN NOT NULL DEFAULT false,
    "correction_of" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "organization_id" UUID,
    "role" "public"."RoleType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" UUID,
    "revoked_at" TIMESTAMPTZ,
    "revoked_by" UUID,
    "is_corrected" BOOLEAN NOT NULL DEFAULT false,
    "correction_of" UUID,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "short_description" VARCHAR(500),
    "address" TEXT NOT NULL,
    "neighborhood" VARCHAR(100),
    "city" VARCHAR(100) NOT NULL DEFAULT 'Montevideo',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'planning',
    "start_date" DATE,
    "estimated_completion" DATE,
    "actual_completion" DATE,
    "total_units" INTEGER NOT NULL DEFAULT 0,
    "available_units" INTEGER NOT NULL DEFAULT 0,
    "base_price" DECIMAL(12,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "legal_regime" VARCHAR(100),
    "images" JSONB NOT NULL DEFAULT '[]',
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "master_plan_files" JSONB NOT NULL DEFAULT '[]',
    "progress_updates" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "is_corrected" BOOLEAN NOT NULL DEFAULT false,
    "correction_of" UUID,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."units" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "unit_number" VARCHAR(50) NOT NULL,
    "floor" INTEGER,
    "unit_type" "public"."UnitType" NOT NULL,
    "status" "public"."UnitStatus" NOT NULL DEFAULT 'available',
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "bathrooms" INTEGER NOT NULL DEFAULT 0,
    "total_area" DECIMAL(8,2),
    "built_area" DECIMAL(8,2),
    "orientation" VARCHAR(50),
    "facing" VARCHAR(50),
    "price" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "features" JSONB NOT NULL DEFAULT '[]',
    "images" JSONB NOT NULL DEFAULT '[]',
    "floor_plan_url" TEXT,
    "dimensions" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "is_corrected" BOOLEAN NOT NULL DEFAULT false,
    "correction_of" UUID,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."operations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "status" "public"."OperationStatus" NOT NULL DEFAULT 'initiated',
    "total_amount" DECIMAL(15,2) NOT NULL,
    "platform_fee" DECIMAL(10,2) NOT NULL DEFAULT 3000.00,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,
    "cancelled_at" TIMESTAMPTZ,
    "cancelled_by" UUID,
    "cancellation_reason" TEXT,
    "created_by" UUID,
    "is_corrected" BOOLEAN NOT NULL DEFAULT false,
    "correction_of" UUID,

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."operation_units" (
    "id" UUID NOT NULL,
    "operation_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "price_at_reservation" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operation_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."operation_steps" (
    "id" UUID NOT NULL,
    "operation_id" UUID NOT NULL,
    "step_name" VARCHAR(100) NOT NULL,
    "step_order" INTEGER NOT NULL,
    "status" "public"."StepStatus" NOT NULL DEFAULT 'pending',
    "assigned_to" UUID,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "due_date" TIMESTAMPTZ,
    "notes" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "operation_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" UUID NOT NULL,
    "operation_id" UUID,
    "user_id" UUID NOT NULL,
    "organization_id" UUID,
    "document_type" "public"."DocumentType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "file_url" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "status" "public"."DocumentStatus" NOT NULL DEFAULT 'uploaded',
    "uploaded_by" UUID NOT NULL,
    "validated_by" UUID,
    "validated_at" TIMESTAMPTZ,
    "validation_notes" TEXT,
    "expires_at" TIMESTAMPTZ,
    "signature_url" TEXT,
    "is_signed" BOOLEAN NOT NULL DEFAULT false,
    "signed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "is_corrected" BOOLEAN NOT NULL DEFAULT false,
    "correction_of" UUID,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_templates" (
    "id" UUID NOT NULL,
    "organization_id" UUID,
    "document_type" "public"."DocumentType" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "template_content" TEXT,
    "file_url" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."professionals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "professional_type" "public"."ProfessionalType" NOT NULL,
    "company_name" VARCHAR(255),
    "registration_number" VARCHAR(100),
    "specializations" JSONB NOT NULL DEFAULT '[]',
    "service_areas" JSONB NOT NULL DEFAULT '[]',
    "hourly_rate" DECIMAL(10,2),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by" UUID,
    "verified_at" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "is_corrected" BOOLEAN NOT NULL DEFAULT false,
    "correction_of" UUID,

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."professional_assignments" (
    "id" UUID NOT NULL,
    "operation_id" UUID NOT NULL,
    "professional_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,
    "status" VARCHAR(50) NOT NULL DEFAULT 'assigned',
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "professional_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "operation_id" UUID,
    "type" "public"."NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "email_sent" BOOLEAN NOT NULL DEFAULT false,
    "email_sent_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "organization_id" UUID,
    "table_name" VARCHAR(100) NOT NULL,
    "record_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."data_corrections" (
    "id" UUID NOT NULL,
    "table_name" VARCHAR(100) NOT NULL,
    "record_id" UUID NOT NULL,
    "requested_by" UUID NOT NULL,
    "approved_by" UUID,
    "correction_reason" TEXT NOT NULL,
    "old_values" JSONB NOT NULL,
    "new_values" JSONB NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "requested_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ,
    "notes" TEXT,

    CONSTRAINT "data_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "public"."organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_tax_id_key" ON "public"."organizations"("tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_organization_id_role_key" ON "public"."user_roles"("user_id", "organization_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "projects_organization_id_slug_key" ON "public"."projects"("organization_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "units_project_id_unit_number_key" ON "public"."units"("project_id", "unit_number");

-- CreateIndex
CREATE UNIQUE INDEX "operation_units_operation_id_unit_id_key" ON "public"."operation_units"("operation_id", "unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "operation_steps_operation_id_step_name_key" ON "public"."operation_steps"("operation_id", "step_name");

-- AddForeignKey
ALTER TABLE "public"."organizations" ADD CONSTRAINT "organizations_correction_of_fkey" FOREIGN KEY ("correction_of") REFERENCES "public"."organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_correction_of_fkey" FOREIGN KEY ("correction_of") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_correction_of_fkey" FOREIGN KEY ("correction_of") REFERENCES "public"."user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_correction_of_fkey" FOREIGN KEY ("correction_of") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."units" ADD CONSTRAINT "units_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."units" ADD CONSTRAINT "units_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."units" ADD CONSTRAINT "units_correction_of_fkey" FOREIGN KEY ("correction_of") REFERENCES "public"."units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operations" ADD CONSTRAINT "operations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operations" ADD CONSTRAINT "operations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operations" ADD CONSTRAINT "operations_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operations" ADD CONSTRAINT "operations_correction_of_fkey" FOREIGN KEY ("correction_of") REFERENCES "public"."operations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operation_units" ADD CONSTRAINT "operation_units_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operation_units" ADD CONSTRAINT "operation_units_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operation_steps" ADD CONSTRAINT "operation_steps_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operation_steps" ADD CONSTRAINT "operation_steps_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_correction_of_fkey" FOREIGN KEY ("correction_of") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_templates" ADD CONSTRAINT "document_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_templates" ADD CONSTRAINT "document_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professionals" ADD CONSTRAINT "professionals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professionals" ADD CONSTRAINT "professionals_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professionals" ADD CONSTRAINT "professionals_correction_of_fkey" FOREIGN KEY ("correction_of") REFERENCES "public"."professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professional_assignments" ADD CONSTRAINT "professional_assignments_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professional_assignments" ADD CONSTRAINT "professional_assignments_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professional_assignments" ADD CONSTRAINT "professional_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."data_corrections" ADD CONSTRAINT "data_corrections_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."data_corrections" ADD CONSTRAINT "data_corrections_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
