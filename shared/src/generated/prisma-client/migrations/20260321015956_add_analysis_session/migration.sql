-- CreateTable
CREATE TABLE "requirements" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "raw_requirement_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "story_points" INTEGER,
    "raw_input" TEXT,
    "structured_data" JSONB,
    "quality_score" JSONB,
    "vector_embedding" TEXT,
    "assignee_id" TEXT,
    "reporter_id" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_requirements" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'manual_input',
    "source_meta" JSONB,
    "proposed_by" TEXT,
    "proposed_at" TIMESTAMP(3) NOT NULL,
    "scenario" TEXT,
    "project_id" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "requirement_definitions" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detailed_description" TEXT NOT NULL,
    "acceptance_criteria" TEXT[],
    "business_rules" TEXT[],
    "dependencies" TEXT[],
    "assumptions" TEXT[],
    "constraints" TEXT[],
    "risk_notes" TEXT[],
    "estimated_effort" DOUBLE PRECISION,
    "estimated_cost" DOUBLE PRECISION,
    "defined_by_id" TEXT NOT NULL,
    "defined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_by_id" TEXT,
    "last_updated_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "change_history" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requirement_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "key" TEXT NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'developer',
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("project_id","user_id")
);

-- CreateTable
CREATE TABLE "project_settings" (
    "project_id" TEXT NOT NULL,
    "workflow_config" JSONB NOT NULL DEFAULT '{"states": ["draft", "reviewing", "approved", "developing", "testing", "done"], "transitions": [{"from": "draft", "to": "reviewing", "roles": ["product_manager", "project_manager"]}, {"from": "reviewing", "to": "approved", "roles": ["product_manager", "project_manager", "developer"]}, {"from": "approved", "to": "developing", "roles": ["project_manager", "developer"]}, {"from": "developing", "to": "testing", "roles": ["developer"]}, {"from": "testing", "to": "done", "roles": ["tester", "project_manager"]}]}',
    "notification_config" JSONB NOT NULL DEFAULT '{"email_notifications": true, "in_app_notifications": true, "slack_integration": false, "mention_notifications": true}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_settings_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_templates" (
    "id" TEXT NOT NULL,
    "requirement_type" TEXT NOT NULL,
    "template_content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "llm_configurations" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "api_endpoint" TEXT,
    "api_key" TEXT,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "max_tokens" INTEGER NOT NULL DEFAULT 2000,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "llm_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "provider" TEXT,
    "model_name" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "variables" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_sessions" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "raw_content" TEXT NOT NULL,
    "current_requirements" JSONB NOT NULL,
    "pending_questions" JSONB NOT NULL,
    "answered_questions" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'analyzing',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "raw_requirements_project_id_idx" ON "raw_requirements"("project_id");

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

-- CreateIndex
CREATE INDEX "requirement_definitions_requirement_id_idx" ON "requirement_definitions"("requirement_id");

-- CreateIndex
CREATE INDEX "requirement_definitions_defined_by_id_idx" ON "requirement_definitions"("defined_by_id");

-- CreateIndex
CREATE INDEX "requirement_definitions_status_idx" ON "requirement_definitions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "requirement_definitions_requirement_id_version_key" ON "requirement_definitions"("requirement_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "projects_key_key" ON "projects"("key");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "prompt_templates_category_idx" ON "prompt_templates"("category");

-- CreateIndex
CREATE INDEX "prompt_templates_provider_idx" ON "prompt_templates"("provider");

-- CreateIndex
CREATE INDEX "prompt_templates_model_name_idx" ON "prompt_templates"("model_name");

-- CreateIndex
CREATE INDEX "prompt_templates_is_active_idx" ON "prompt_templates"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_templates_category_provider_model_name_is_default_key" ON "prompt_templates"("category", "provider", "model_name", "is_default");

-- CreateIndex
CREATE UNIQUE INDEX "analysis_sessions_session_id_key" ON "analysis_sessions"("session_id");

-- CreateIndex
CREATE INDEX "analysis_sessions_session_id_idx" ON "analysis_sessions"("session_id");

-- CreateIndex
CREATE INDEX "analysis_sessions_status_idx" ON "analysis_sessions"("status");

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_raw_requirement_id_fkey" FOREIGN KEY ("raw_requirement_id") REFERENCES "raw_requirements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_requirements" ADD CONSTRAINT "raw_requirements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "requirement_definitions" ADD CONSTRAINT "requirement_definitions_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_definitions" ADD CONSTRAINT "requirement_definitions_defined_by_id_fkey" FOREIGN KEY ("defined_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_definitions" ADD CONSTRAINT "requirement_definitions_last_updated_by_id_fkey" FOREIGN KEY ("last_updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_settings" ADD CONSTRAINT "project_settings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
