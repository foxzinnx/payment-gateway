-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'REFUNDED';

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "amount_in_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "reason" TEXT,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Refund_transaction_id_key" ON "Refund"("transaction_id");
