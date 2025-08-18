-- AlterTable
ALTER TABLE "public"."projects" ADD COLUMN     "has_1_bedroom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_2_bedroom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_3_bedroom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_4_bedroom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_5_bedroom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_commercial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_parking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_studio" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."user_favorites" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "added_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_favorites_user_id_unit_id_key" ON "public"."user_favorites"("user_id", "unit_id");

-- AddForeignKey
ALTER TABLE "public"."user_favorites" ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_favorites" ADD CONSTRAINT "user_favorites_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
