/*
  Warnings:

  - You are about to drop the column `requirement_id` on the `raw_requirements` table. All the data in the column will be lost.
  - Added the required column `project_id` to the `raw_requirements` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add raw_requirement_id column to requirements table (nullable)
ALTER TABLE "requirements" ADD COLUMN "raw_requirement_id" TEXT;

-- Step 2: Create a temporary project_id column with default value
ALTER TABLE "raw_requirements" ADD COLUMN "project_id" TEXT;

-- Step 3: Populate project_id from the requirements table
UPDATE "raw_requirements" rr
SET "project_id" = r."project_id"
FROM "requirements" r
WHERE rr."requirement_id" = r."id";

-- Step 4: Make project_id NOT NULL
ALTER TABLE "raw_requirements" ALTER COLUMN "project_id" SET NOT NULL;

-- Step 5: Update requirements to reference their raw requirement
UPDATE "requirements" r
SET "raw_requirement_id" = rr."id"
FROM "raw_requirements" rr
WHERE rr."requirement_id" = r."id";

-- Step 6: Drop old foreign key constraint and index
ALTER TABLE "raw_requirements" DROP CONSTRAINT "raw_requirements_requirement_id_fkey";
DROP INDEX "raw_requirements_requirement_id_idx";

-- Step 7: Drop old requirement_id column
ALTER TABLE "raw_requirements" DROP COLUMN "requirement_id";

-- Step 8: Create new indexes and foreign keys
CREATE INDEX "raw_requirements_project_id_idx" ON "raw_requirements"("project_id");

ALTER TABLE "requirements" ADD CONSTRAINT "requirements_raw_requirement_id_fkey" FOREIGN KEY ("raw_requirement_id") REFERENCES "raw_requirements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "raw_requirements" ADD CONSTRAINT "raw_requirements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
