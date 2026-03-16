/*
  Warnings:

  - You are about to drop the `organization_projects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organizations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_organizations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "organization_projects" DROP CONSTRAINT "organization_projects_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_projects" DROP CONSTRAINT "organization_projects_project_id_fkey";

-- DropForeignKey
ALTER TABLE "user_organizations" DROP CONSTRAINT "user_organizations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "user_organizations" DROP CONSTRAINT "user_organizations_user_id_fkey";

-- DropTable
DROP TABLE "organization_projects";

-- DropTable
DROP TABLE "organizations";

-- DropTable
DROP TABLE "user_organizations";
