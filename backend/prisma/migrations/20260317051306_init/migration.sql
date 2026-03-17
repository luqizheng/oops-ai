-- DropForeignKey
ALTER TABLE "requirements" DROP CONSTRAINT "requirements_project_id_fkey";

-- CreateTable
CREATE TABLE "raw_requirements" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'manual_input',
    "source_meta" JSONB,
    "proposed_by" TEXT,
    "proposed_at" TIMESTAMP(3) NOT NULL,
    "scenario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raw_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stories" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "want" TEXT NOT NULL,
    "soThat" TEXT,
    "acceptance_notes" TEXT,
    "story_points" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acceptance_criteria" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "given" TEXT[],
    "when" TEXT NOT NULL,
    "then" TEXT[],
    "and" TEXT[],
    "scenario_type" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "tested_by_id" TEXT,
    "tested_at" TIMESTAMP(3),
    "test_evidence" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acceptance_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_cases" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "acceptance_criteria_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "preconditions" TEXT[],
    "test_steps" JSONB NOT NULL,
    "test_data" JSONB,
    "automation_status" TEXT NOT NULL DEFAULT 'manual',
    "automation_script" TEXT,
    "automation_framework" TEXT,
    "last_run_status" TEXT,
    "last_run_at" TIMESTAMP(3),
    "last_run_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_executions" (
    "id" TEXT NOT NULL,
    "test_case_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "duration" INTEGER,
    "error_message" TEXT,
    "screenshot_urls" TEXT[],
    "log_urls" TEXT[],
    "executed_by_id" TEXT,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "environment" TEXT,
    "build_version" TEXT,

    CONSTRAINT "test_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_rules" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL DEFAULT 'constraint',
    "rule_expression" TEXT NOT NULL,
    "rule_description" TEXT NOT NULL,
    "condition" TEXT,
    "action" TEXT,
    "else_action" TEXT,
    "effective_from" TIMESTAMP(3),
    "effective_to" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "affected_modules" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfr_requirements" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "nfr_type" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "target_value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "comparison" TEXT NOT NULL DEFAULT '<=',
    "warning_threshold" DOUBLE PRECISION,
    "critical_threshold" DOUBLE PRECISION,
    "measurement_method" TEXT,
    "measurement_tool" TEXT,
    "verification_status" TEXT NOT NULL DEFAULT 'not_verified',
    "last_verified_at" TIMESTAMP(3),
    "last_verified_value" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfr_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_dependencies" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "depends_on_id" TEXT NOT NULL,
    "dependency_type" TEXT NOT NULL DEFAULT 'blocks',
    "description" TEXT,
    "strength" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requirement_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acceptance_signoffs" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "signoff_type" TEXT NOT NULL DEFAULT 'functional',
    "signoff_status" TEXT NOT NULL DEFAULT 'pending',
    "signed_by_id" TEXT,
    "signed_at" TIMESTAMP(3),
    "signoff_evidence" TEXT,
    "comments" TEXT,
    "criteria_ids" TEXT[],
    "milestone" TEXT,
    "release_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acceptance_signoffs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "raw_requirements_requirement_id_idx" ON "raw_requirements"("requirement_id");

-- CreateIndex
CREATE INDEX "raw_requirements_sourceType_idx" ON "raw_requirements"("sourceType");

-- CreateIndex
CREATE INDEX "user_stories_requirement_id_idx" ON "user_stories"("requirement_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_stories_requirement_id_role_want_key" ON "user_stories"("requirement_id", "role", "want");

-- CreateIndex
CREATE INDEX "acceptance_criteria_requirement_id_idx" ON "acceptance_criteria"("requirement_id");

-- CreateIndex
CREATE INDEX "acceptance_criteria_status_idx" ON "acceptance_criteria"("status");

-- CreateIndex
CREATE UNIQUE INDEX "acceptance_criteria_requirement_id_scenario_key" ON "acceptance_criteria"("requirement_id", "scenario");

-- CreateIndex
CREATE INDEX "test_cases_requirement_id_idx" ON "test_cases"("requirement_id");

-- CreateIndex
CREATE INDEX "test_cases_automation_status_idx" ON "test_cases"("automation_status");

-- CreateIndex
CREATE INDEX "test_cases_acceptance_criteria_id_idx" ON "test_cases"("acceptance_criteria_id");

-- CreateIndex
CREATE INDEX "test_executions_test_case_id_idx" ON "test_executions"("test_case_id");

-- CreateIndex
CREATE INDEX "test_executions_executed_at_idx" ON "test_executions"("executed_at");

-- CreateIndex
CREATE INDEX "business_rules_requirement_id_idx" ON "business_rules"("requirement_id");

-- CreateIndex
CREATE INDEX "business_rules_rule_type_idx" ON "business_rules"("rule_type");

-- CreateIndex
CREATE UNIQUE INDEX "business_rules_requirement_id_rule_id_key" ON "business_rules"("requirement_id", "rule_id");

-- CreateIndex
CREATE INDEX "nfr_requirements_requirement_id_idx" ON "nfr_requirements"("requirement_id");

-- CreateIndex
CREATE INDEX "nfr_requirements_nfr_type_idx" ON "nfr_requirements"("nfr_type");

-- CreateIndex
CREATE UNIQUE INDEX "nfr_requirements_requirement_id_nfr_type_metric_key" ON "nfr_requirements"("requirement_id", "nfr_type", "metric");

-- CreateIndex
CREATE INDEX "requirement_dependencies_requirement_id_idx" ON "requirement_dependencies"("requirement_id");

-- CreateIndex
CREATE INDEX "requirement_dependencies_depends_on_id_idx" ON "requirement_dependencies"("depends_on_id");

-- CreateIndex
CREATE INDEX "requirement_dependencies_dependency_type_idx" ON "requirement_dependencies"("dependency_type");

-- CreateIndex
CREATE UNIQUE INDEX "requirement_dependencies_requirement_id_depends_on_id_key" ON "requirement_dependencies"("requirement_id", "depends_on_id");

-- CreateIndex
CREATE INDEX "acceptance_signoffs_requirement_id_idx" ON "acceptance_signoffs"("requirement_id");

-- CreateIndex
CREATE INDEX "acceptance_signoffs_signoff_status_idx" ON "acceptance_signoffs"("signoff_status");

-- CreateIndex
CREATE INDEX "acceptance_signoffs_signed_by_id_idx" ON "acceptance_signoffs"("signed_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "acceptance_signoffs_requirement_id_signoff_type_milestone_key" ON "acceptance_signoffs"("requirement_id", "signoff_type", "milestone");

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_requirements" ADD CONSTRAINT "raw_requirements_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stories" ADD CONSTRAINT "user_stories_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acceptance_criteria" ADD CONSTRAINT "acceptance_criteria_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acceptance_criteria" ADD CONSTRAINT "acceptance_criteria_tested_by_id_fkey" FOREIGN KEY ("tested_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_acceptance_criteria_id_fkey" FOREIGN KEY ("acceptance_criteria_id") REFERENCES "acceptance_criteria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_last_run_by_id_fkey" FOREIGN KEY ("last_run_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_executions" ADD CONSTRAINT "test_executions_test_case_id_fkey" FOREIGN KEY ("test_case_id") REFERENCES "test_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_executions" ADD CONSTRAINT "test_executions_executed_by_id_fkey" FOREIGN KEY ("executed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_rules" ADD CONSTRAINT "business_rules_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfr_requirements" ADD CONSTRAINT "nfr_requirements_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_dependencies" ADD CONSTRAINT "requirement_dependencies_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_dependencies" ADD CONSTRAINT "requirement_dependencies_depends_on_id_fkey" FOREIGN KEY ("depends_on_id") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acceptance_signoffs" ADD CONSTRAINT "acceptance_signoffs_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acceptance_signoffs" ADD CONSTRAINT "acceptance_signoffs_signed_by_id_fkey" FOREIGN KEY ("signed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
