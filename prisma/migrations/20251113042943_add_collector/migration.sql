-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'COLLECTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "CollectionType" AS ENUM ('HOME_PICKUP', 'DROP_OFF_POINT', 'BOTH');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CLIENT';

-- CreateTable
CREATE TABLE "Collector" (
    "id" SERIAL NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "tradeName" VARCHAR(255) NOT NULL,
    "cnpj" VARCHAR(18) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "operatingHours" VARCHAR(255),
    "collectionType" "CollectionType" NOT NULL DEFAULT 'BOTH',
    "acceptedMaterials" TEXT[],
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(6),

    CONSTRAINT "collectors_pk" PRIMARY KEY ("id")
);

CREATE TABLE "CollectorHeadquarters" (
    "id" SERIAL NOT NULL,
    "addressName" VARCHAR(255) NOT NULL,
    "number" VARCHAR(10) NOT NULL,
    "additionalInfo" VARCHAR(255),
    "neighborhood" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(10) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "collectorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(6),

    CONSTRAINT "collector_headquarters_pk" PRIMARY KEY ("id")
);
     -- "addressType" removido

CREATE TABLE "CollectionPoint" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "addressName" VARCHAR(255) NOT NULL,
    "number" VARCHAR(10) NOT NULL,
    "additionalInfo" VARCHAR(255),
    "neighborhood" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(10) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "operatingHours" VARCHAR(255),
    "acceptedMaterials" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "collectorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(6),

    CONSTRAINT "collection_points_pk" PRIMARY KEY ("id")
);
     -- "addressType" removido

-- CreateIndex
CREATE UNIQUE INDEX "collectors_unique" ON "Collector"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "collectors_users_id_key" ON "Collector"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "collector_headquarters_collectors_id_key" ON "CollectorHeadquarters"("collectorId");

-- CreateIndex
CREATE INDEX "collection_points_collector_id_idx" ON "CollectionPoint"("collectorId");

-- CreateIndex
CREATE INDEX "collection_points_location_idx" ON "CollectionPoint"("city", "state");

-- AddForeignKey
ALTER TABLE "Collector" ADD CONSTRAINT "collectors_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectorHeadquarters" ADD CONSTRAINT "collector_headquarters_collectors_id_fkey" FOREIGN KEY ("collectorId") REFERENCES "Collector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionPoint" ADD CONSTRAINT "collection_points_collectors_id_fkey" FOREIGN KEY ("collectorId") REFERENCES "Collector"("id") ON DELETE CASCADE ON UPDATE CASCADE;
