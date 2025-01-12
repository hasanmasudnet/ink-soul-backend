-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PHOTO_ID', 'TATTOO_DESIGN', 'CREDIT_CARD_AUTH', 'TATTOO_CONSENT');

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
