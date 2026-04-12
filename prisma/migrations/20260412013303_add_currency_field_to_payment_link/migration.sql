-- AlterTable
ALTER TABLE "merchants" ALTER COLUMN "refresh_token" DROP NOT NULL;

-- AlterTable
ALTER TABLE "payment_links" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BRL';
