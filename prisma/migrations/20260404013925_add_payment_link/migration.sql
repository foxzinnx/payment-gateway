-- CreateEnum
CREATE TYPE "PaymentLinkStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED');

-- CreateTable
CREATE TABLE "payment_links" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "amount_in_cents" INTEGER NOT NULL,
    "description" TEXT,
    "status" "PaymentLinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_code_key" ON "payment_links"("code");
