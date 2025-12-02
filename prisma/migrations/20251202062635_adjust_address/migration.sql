/*
  Warnings:

  - You are about to alter the column `neighborhood` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(100)`.
  - You are about to alter the column `postalCode` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(10)`.
  - You are about to alter the column `tradeName` on the `Company` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "neighborhood" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "postalCode" SET DATA TYPE VARCHAR(10);

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "tradeName" SET DATA TYPE VARCHAR(255);
