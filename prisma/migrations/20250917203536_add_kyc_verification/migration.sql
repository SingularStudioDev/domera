-- CreateEnum
CREATE TYPE "public"."VerificationStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'IN_REVIEW', 'APPROVED', 'DECLINED', 'EXPIRED', 'ABANDONED');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verification_completed_at" TIMESTAMPTZ;

-- CreateTable
CREATE TABLE "public"."verification_sessions" (
    "id" UUID NOT NULL,
    "session_id" VARCHAR(255) NOT NULL,
    "session_token" VARCHAR(255),
    "status" "public"."VerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "user_id" UUID NOT NULL,
    "verification_url" TEXT,
    "decision" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "verification_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "verification_sessions_session_id_key" ON "public"."verification_sessions"("session_id");

-- CreateIndex
CREATE INDEX "verification_sessions_user_id_status_idx" ON "public"."verification_sessions"("user_id", "status");

-- CreateIndex
CREATE INDEX "verification_sessions_session_id_idx" ON "public"."verification_sessions"("session_id");

-- AddForeignKey
ALTER TABLE "public"."verification_sessions" ADD CONSTRAINT "verification_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
