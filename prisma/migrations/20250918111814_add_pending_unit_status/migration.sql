-- AlterEnum
ALTER TYPE "public"."UnitStatus" ADD VALUE 'pending';

-- AlterTable
ALTER TABLE "public"."units" ALTER COLUMN "status" SET DEFAULT 'pending';
