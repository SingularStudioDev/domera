-- CreateEnum
CREATE TYPE "public"."OperationType" AS ENUM ('reservation', 'purchase');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."DocumentType" ADD VALUE 'recibo_pago';
ALTER TYPE "public"."DocumentType" ADD VALUE 'notificacion_vencimiento';
ALTER TYPE "public"."DocumentType" ADD VALUE 'estado_cuenta';
ALTER TYPE "public"."DocumentType" ADD VALUE 'comprobante_seña';

-- AlterEnum
ALTER TYPE "public"."OperationStatus" ADD VALUE 'pending_user_acceptance';

-- AlterTable
ALTER TABLE "public"."documents" ADD COLUMN     "step_id" UUID;

-- AlterTable
ALTER TABLE "public"."operations" ADD COLUMN     "operation_type" "public"."OperationType" NOT NULL DEFAULT 'reservation';

-- AlterTable
ALTER TABLE "public"."projects" ADD COLUMN     "details" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" UUID NOT NULL,
    "operation_id" UUID NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "due_date" TIMESTAMPTZ NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMPTZ,
    "paid_amount" DECIMAL(12,2),
    "payment_method" VARCHAR(50),
    "reference" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."two_factor_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."super_admin_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "session_token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "super_admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."security_logs" (
    "id" UUID NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "user_identifier" VARCHAR(255) NOT NULL,
    "result" VARCHAR(50) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_operation_id_installment_number_key" ON "public"."payments"("operation_id", "installment_number");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_tokens_user_id_key" ON "public"."two_factor_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "super_admin_sessions_user_id_key" ON "public"."super_admin_sessions"("user_id");

-- CreateIndex
CREATE INDEX "security_logs_event_type_timestamp_idx" ON "public"."security_logs"("event_type", "timestamp");

-- CreateIndex
CREATE INDEX "security_logs_user_identifier_timestamp_idx" ON "public"."security_logs"("user_identifier", "timestamp");

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "public"."operation_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."two_factor_tokens" ADD CONSTRAINT "two_factor_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."super_admin_sessions" ADD CONSTRAINT "super_admin_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
