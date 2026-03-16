/*
  Warnings:

  - You are about to drop the column `organization_id` on the `projects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_organization_id_fkey";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "organization_id";

-- CreateTable
CREATE TABLE "organization_projects" (
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_projects_pkey" PRIMARY KEY ("organization_id","project_id")
);

-- AddForeignKey
ALTER TABLE "organization_projects" ADD CONSTRAINT "organization_projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_projects" ADD CONSTRAINT "organization_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
