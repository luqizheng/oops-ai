-- OOPS-AI 数据库初始化脚本
-- 创建扩展（如果需要）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建表之前先删除（如果存在）
DROP TABLE IF EXISTS "LLMConfiguration" CASCADE;
DROP TABLE IF EXISTS "Requirement" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 创建用户表
CREATE TABLE "User" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建需求表
CREATE TABLE "Requirement" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    original_text TEXT NOT NULL,
    fuzzy_words JSONB,
    questions JSONB,
    user_stories JSONB,
    acceptance_criteria JSONB,
    quality_score INTEGER,
    suggestions JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID REFERENCES "User"(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建 LLM 配置表
CREATE TABLE "LLMConfiguration" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL,
    api_key VARCHAR(500),
    base_url VARCHAR(500),
    model VARCHAR(100),
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2000,
    timeout INTEGER DEFAULT 30000,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES "User"(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_requirement_status ON "Requirement"(status);
CREATE INDEX idx_requirement_created_by ON "Requirement"(created_by);
CREATE INDEX idx_requirement_created_at ON "Requirement"(created_at);
CREATE INDEX idx_llm_config_provider ON "LLMConfiguration"(provider);
CREATE INDEX idx_llm_config_is_default ON "LLMConfiguration"(is_default);
CREATE INDEX idx_llm_config_is_active ON "LLMConfiguration"(is_active);
CREATE INDEX idx_user_username ON "User"(username);
CREATE INDEX idx_user_email ON "User"(email);

-- 创建触发器函数用于自动更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为每个表创建触发器
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirement_updated_at BEFORE UPDATE ON "Requirement"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_llm_config_updated_at BEFORE UPDATE ON "LLMConfiguration"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认数据
INSERT INTO "User" (username, email, password_hash) VALUES
('admin', 'admin@oops-ai.com', '$2b$10$YourHashedPasswordHere');

-- 插入默认的 LLM 配置
INSERT INTO "LLMConfiguration" (provider, api_key, base_url, model, temperature, max_tokens, is_default, is_active) VALUES
('openai', '', 'https://api.openai.com/v1', 'gpt-3.5-turbo', 0.7, 2000, true, true),
('ollama', '', 'http://localhost:11434', 'llama2', 0.7, 2000, false, true),
('deepseek', '', 'https://api.deepseek.com', 'deepseek-chat', 0.7, 2000, false, true);

-- 创建只读用户（可选）
-- CREATE USER oops_reader WITH PASSWORD 'reader_password';
-- GRANT CONNECT ON DATABASE oops_ai TO oops_reader;
-- GRANT USAGE ON SCHEMA public TO oops_reader;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO oops_reader;

-- 创建读写用户（可选）
-- CREATE USER oops_writer WITH PASSWORD 'writer_password';
-- GRANT CONNECT ON DATABASE oops_ai TO oops_writer;
-- GRANT USAGE ON SCHEMA public TO oops_writer;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO oops_writer;

-- 注释表结构说明
COMMENT ON TABLE "User" IS '系统用户表';
COMMENT ON TABLE "Requirement" IS '需求分析结果表';
COMMENT ON TABLE "LLMConfiguration" IS 'LLM 配置表';

COMMENT ON COLUMN "Requirement".fuzzy_words IS '检测到的模糊词列表';
COMMENT ON COLUMN "Requirement".questions IS '生成的问题列表';
COMMENT ON COLUMN "Requirement".user_stories IS '生成的用户故事列表';
COMMENT ON COLUMN "Requirement".acceptance_criteria IS '生成的验收标准列表';
COMMENT ON COLUMN "Requirement".quality_score IS '质量评分（0-100）';
COMMENT ON COLUMN "Requirement".suggestions IS '改进建议列表';