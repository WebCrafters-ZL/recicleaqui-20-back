/*
  Warnings:

  - You are about to drop the column `acceptedMaterials` on the `CollectionPoint` table. All the data in the column will be lost.
  - You are about to drop the column `acceptedMaterials` on the `Collector` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MaterialLine" AS ENUM ('VERDE', 'MARROM', 'AZUL', 'BRANCA');

-- CreateEnum
CREATE TYPE "DiscardMode" AS ENUM ('COLLECTION_POINT', 'PICKUP');

-- CreateEnum
CREATE TYPE "DiscardStatus" AS ENUM ('PENDING', 'OFFERED', 'SCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "CollectionPoint" DROP COLUMN "acceptedMaterials",
ADD COLUMN     "acceptedLines" "MaterialLine"[];

-- AlterTable
ALTER TABLE "Collector" DROP COLUMN "acceptedMaterials",
ADD COLUMN     "acceptedLines" "MaterialLine"[];

-- CreateTable
CREATE TABLE "Discard" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "mode" "DiscardMode" NOT NULL,
    "lines" "MaterialLine"[],
    "description" TEXT,
    "collectionPointId" INTEGER,
    "status" "DiscardStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledSlot" JSONB,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(6),

    CONSTRAINT "Discard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" SERIAL NOT NULL,
    "discardId" INTEGER NOT NULL,
    "collectorId" INTEGER NOT NULL,
    "proposedSlots" JSONB NOT NULL,
    "acceptedSlot" JSONB,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(6),

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "discard_client_idx" ON "Discard"("clientId");

-- CreateIndex
CREATE INDEX "discard_status_idx" ON "Discard"("status");

-- AddForeignKey
ALTER TABLE "Discard" ADD CONSTRAINT "Discard_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discard" ADD CONSTRAINT "Discard_collectionPointId_fkey" FOREIGN KEY ("collectionPointId") REFERENCES "CollectionPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_discardId_fkey" FOREIGN KEY ("discardId") REFERENCES "Discard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES "Collector"("id") ON DELETE CASCADE ON UPDATE CASCADE;
