/*
  Warnings:

  - You are about to drop the column `type` on the `customers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customers" DROP COLUMN "type",
ADD COLUMN     "customer_type" TEXT DEFAULT 'appointment';
