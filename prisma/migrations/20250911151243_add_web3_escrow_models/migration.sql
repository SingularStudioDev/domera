-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('escrow', 'traditional', 'bank_transfer', 'credit_card');

-- CreateEnum
CREATE TYPE "public"."EscrowStatus" AS ENUM ('created', 'funded', 'disputed', 'completed', 'refunded', 'expired');

-- CreateEnum
CREATE TYPE "public"."TraditionalPaymentStatus" AS ENUM ('initiated', 'pending_confirmation', 'confirmed', 'failed', 'cancelled');

-- AlterTable
ALTER TABLE "public"."projects" ADD COLUMN     "details" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;

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

-- CreateTable
CREATE TABLE "public"."reservation_payments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "operation_id" UUID,
    "payment_method" "public"."PaymentMethod" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "property_data" JSONB NOT NULL,
    "form_data" JSONB NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'initiated',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "reservation_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."escrow_transactions" (
    "id" UUID NOT NULL,
    "reservation_payment_id" UUID NOT NULL,
    "contract_address" VARCHAR(42) NOT NULL,
    "transaction_hash" VARCHAR(66),
    "block_number" BIGINT,
    "kleros_tx_id" TEXT,
    "sender_address" VARCHAR(42) NOT NULL,
    "receiver_address" VARCHAR(42) NOT NULL,
    "arbitrator_address" VARCHAR(42) NOT NULL,
    "timeout_payment" INTEGER NOT NULL,
    "timeout_dispute" INTEGER NOT NULL,
    "status" "public"."EscrowStatus" NOT NULL DEFAULT 'created',
    "created_on_chain" BOOLEAN NOT NULL DEFAULT false,
    "funded_at" TIMESTAMPTZ,
    "disputed_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "meta_evidence" JSONB NOT NULL,
    "dispute_id" TEXT,
    "ruling" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "escrow_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."traditional_payments" (
    "id" UUID NOT NULL,
    "reservation_payment_id" UUID NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "reference" TEXT,
    "processor_name" VARCHAR(100),
    "processor_tx_id" VARCHAR(255),
    "processor_response" JSONB,
    "status" "public"."TraditionalPaymentStatus" NOT NULL DEFAULT 'initiated',
    "confirmed_at" TIMESTAMPTZ,
    "failed_at" TIMESTAMPTZ,
    "failure_reason" TEXT,
    "payment_instructions" JSONB,
    "bank_details" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "traditional_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_tokens_user_id_key" ON "public"."two_factor_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "super_admin_sessions_user_id_key" ON "public"."super_admin_sessions"("user_id");

-- CreateIndex
CREATE INDEX "security_logs_event_type_timestamp_idx" ON "public"."security_logs"("event_type", "timestamp");

-- CreateIndex
CREATE INDEX "security_logs_user_identifier_timestamp_idx" ON "public"."security_logs"("user_identifier", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "escrow_transactions_reservation_payment_id_key" ON "public"."escrow_transactions"("reservation_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "traditional_payments_reservation_payment_id_key" ON "public"."traditional_payments"("reservation_payment_id");

-- AddForeignKey
ALTER TABLE "public"."two_factor_tokens" ADD CONSTRAINT "two_factor_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."super_admin_sessions" ADD CONSTRAINT "super_admin_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservation_payments" ADD CONSTRAINT "reservation_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservation_payments" ADD CONSTRAINT "reservation_payments_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."escrow_transactions" ADD CONSTRAINT "escrow_transactions_reservation_payment_id_fkey" FOREIGN KEY ("reservation_payment_id") REFERENCES "public"."reservation_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."traditional_payments" ADD CONSTRAINT "traditional_payments_reservation_payment_id_fkey" FOREIGN KEY ("reservation_payment_id") REFERENCES "public"."reservation_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
