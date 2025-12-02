/*
  Warnings:

  - You are about to alter the column `addressType` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(50)`.
  - You are about to alter the column `addressName` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(255)`.
  - You are about to alter the column `number` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(10)`.
  - You are about to alter the column `additionalInfo` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(255)`.
  - You are about to alter the column `neighborhood` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(100)`.
  - You are about to alter the column `postalCode` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(10)`.
  - You are about to alter the column `city` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(100)`.
  - You are about to alter the column `state` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(2)`.
  - You are about to alter the column `phone` on the `Client` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(20)`.
  - You are about to alter the column `companyName` on the `Company` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(255)`.
  - You are about to alter the column `tradeName` on the `Company` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(255)`.
  - You are about to alter the column `cnpj` on the `Company` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(18)`.
  - You are about to alter the column `firstName` on the `Individual` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `Individual` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(100)`.
  - You are about to alter the column `cpf` on the `Individual` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(14)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(255)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(255)`.
  - You are about to alter the column `resetToken` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "addressType" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "addressName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "number" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "additionalInfo" SET DATA TYPE VARCHAR(255),
-- Removido ajuste addressType
ALTER COLUMN "city" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "state" SET DATA TYPE VARCHAR(2);

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "companyName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "cnpj" SET DATA TYPE VARCHAR(18);

ALTER TABLE "Individual" ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "cpf" SET DATA TYPE VARCHAR(14);

ALTER TABLE "User" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "resetToken" SET DATA TYPE VARCHAR(255);
