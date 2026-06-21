/*
  Warnings:

  - A unique constraint covering the columns `[supabase_user_id]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "supabase_user_id" TEXT,
ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tenants_supabase_user_id_key" ON "tenants"("supabase_user_id");
