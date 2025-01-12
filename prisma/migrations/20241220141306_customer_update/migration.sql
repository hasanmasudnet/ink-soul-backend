/*
  Warnings:

  - Added the required column `status` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "status" TEXT NOT NULL;
