-- AlterTable
ALTER TABLE "artists" ALTER COLUMN "status" SET DEFAULT 'active';

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "image_url" TEXT,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'active';

-- AlterTable
ALTER TABLE "designers" ALTER COLUMN "status" SET DEFAULT 'active';
