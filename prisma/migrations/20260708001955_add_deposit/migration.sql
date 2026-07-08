-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DepositMethod" AS ENUM ('PIX', 'TED', 'BOLETO');

-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "amount_in_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "status" "DepositStatus" NOT NULL DEFAULT 'PENDING',
    "method" "DepositMethod" NOT NULL DEFAULT 'PIX',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);
