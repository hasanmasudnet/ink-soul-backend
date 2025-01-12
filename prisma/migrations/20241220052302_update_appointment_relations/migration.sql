-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_referral_source_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_tattoo_artist_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_tattoo_designer_id_fkey";

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "customer_id" DROP NOT NULL,
ALTER COLUMN "tattoo_artist_id" DROP NOT NULL,
ALTER COLUMN "tattoo_designer_id" DROP NOT NULL,
ALTER COLUMN "referral_source_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tattoo_artist_id_fkey" FOREIGN KEY ("tattoo_artist_id") REFERENCES "artists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tattoo_designer_id_fkey" FOREIGN KEY ("tattoo_designer_id") REFERENCES "designers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_referral_source_id_fkey" FOREIGN KEY ("referral_source_id") REFERENCES "referral_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
