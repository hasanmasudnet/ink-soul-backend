-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "type" TEXT DEFAULT 'appointment',
ALTER COLUMN "status" SET DEFAULT 'active';
