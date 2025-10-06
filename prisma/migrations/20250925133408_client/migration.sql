-- CreateEnum
CREATE TYPE "public"."ClientType" AS ENUM ('individual', 'company');

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" SERIAL NOT NULL,
    "type" "public"."ClientType" NOT NULL,
    "phone" VARCHAR NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(6),

    CONSTRAINT "clients_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Individual" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR NOT NULL,
    "lastName" VARCHAR NOT NULL,
    "cpf" VARCHAR NOT NULL,
    "clientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(6),

    CONSTRAINT "individuals_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" SERIAL NOT NULL,
    "companyName" VARCHAR NOT NULL,
    "tradeName" VARCHAR NOT NULL,
    "cnpj" VARCHAR NOT NULL,
    "clientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(6),

    CONSTRAINT "companies_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" SERIAL NOT NULL,
    "addressType" VARCHAR NOT NULL,
    "addressName" VARCHAR NOT NULL,
    "number" VARCHAR NOT NULL,
    "additionalInfo" VARCHAR,
    "neighborhood" VARCHAR NOT NULL,
    "postalCode" VARCHAR NOT NULL,
    "city" VARCHAR NOT NULL,
    "state" VARCHAR NOT NULL,
    "clientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(6),

    CONSTRAINT "addresses_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_users_id_key" ON "public"."Client"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "individuals_unique" ON "public"."Individual"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "individuals_clients_id_key" ON "public"."Individual"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_unique" ON "public"."Company"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "companies_clients_id_key" ON "public"."Company"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_clients_id_key" ON "public"."Address"("clientId");

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "clients_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Individual" ADD CONSTRAINT "individuals_clients_id_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Company" ADD CONSTRAINT "companies_clients_id_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "addresses_clients_id_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
