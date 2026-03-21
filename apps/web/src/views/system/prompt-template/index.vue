<template>
  <div class="prompt-template">
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="table-header">
          <div class="header-left">
            <h3>提示词模板管理</h3>
            <el-tag type="info" effect="plain"> 共 {{ total }} 个模板 </el-tag>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="handleAdd">
              <el-icon>
                <Plus />
              </el-icon>
              添加模板
            </el-button>
          </div>
        </div>
      </template>

      <div class="filter-bar">
        <el-select
          v-model="categoryFilter"
          placeholder="模板类别"
          clearable
          style="width: 200px"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="原始需求 → 需求" value="raw-to-requirement" />
          <el-option label="需求 → 用户故事" value="requirement-to-story" />
          <el-option label="用户故事 → 用例" value="story-to-use-case" />
          <el-option label="生成验收标准" value="generate-acceptance" />
          <el-option label="识别模糊词汇" value="identify-ambiguity" />
          <el-option label="生成追问问题" value="generate-questions" />
          <el-option label="质量评估" value="quality-assessment" />
          <el-option label="代码分析" value="code-analysis" />
          <el-option label="测试生成" value="test-generation" />
          <el-option label="其他" value="other" />
        </el-select>
        <el-select
          v-model="statusFilter"
          placeholder="状态"
          clearable
          style="width: 120px"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="激活" value="true" />
          <el-option label="停用" value="false" />
        </el-select>
      </div>

      <el-table
        v-loading="loading"
        :data="templates"
        stripe
        border
        class="template-table"
      >
        <el-table-column prop="name" label="模板名称" min-width="180">
          <template #default="{ row }">
            <div class="template-name">
              <el-icon class="template-icon">
                <Document />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="类别" width="150">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)" size="small">
              {{ getCategoryText(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            <span v-if="row.description" class="description-text">
              {{ row.description }}
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="provider" label="LLM 供应商" width="120">
          <template #default="{ row }">
            <span v-if="row.provider">{{ getProviderText(row.provider) }}</span>
            <span v-else class="text-muted">默认</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="isDefault"
          label="默认"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-tag v-if="row.isDefault" type="success" size="small">是</el-tag>
            <span v-else class="text-muted">否</span>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
              {{ row.isActive ? "激活" : "停用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              v-if="!row.isDefault"
              type="success"
              size="small"
              link
              @click="handleSetDefault(row)"
            >
              设为默认
            </el-button>
            <el-button
              type="warning"
              size="small"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '添加提示词模板' : '编辑提示词模板'"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入模板名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="模板描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="请输入模板描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="模板类别" prop="category">
          <el-select
            v-model="formData.category"
            placeholder="选择模板类别"
            style="width: 100%"
          >
            <el-option label="原始需求 → 需求" value="raw-to-requirement" />
            <el-option label="需求 → 用户故事" value="requirement-to-story" />
            <el-option label="用户故事 → 用例" value="story-to-use-case" />
            <el-option label="生成验收标准" value="generate-acceptance" />
            <el-option label="识别模糊词汇" value="identify-ambiguity" />
            <el-option label="生成追问问题" value="generate-questions" />
            <el-option label="质量评估" value="quality-assessment" />
            <el-option label="代码分析" value="code-analysis" />
            <el-option label="测试生成" value="test-generation" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="LLM 供应商">
          <el-select
            v-model="formData.provider"
            placeholder="使用默认配置"
            clearable
            style="width: 100%"
          >
            <el-option label="OpenAI" value="openai" />
            <el-option label="Ollama" value="ollama" />
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="通义千问 (Qwen)" value="qwen" />
            <el-option label="本地模型" value="local" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型名称">
          <el-input
            v-model="formData.modelName"
            placeholder="留空使用默认模型"
          />
        </el-form-item>
        <el-form-item label="模板内容" prop="template">
          <el-input
            v-model="formData.template"
            type="textarea"
            :rows="10"
            placeholder="请输入提示词模板内容，使用 {{variable}} 表示变量"
          />
          <div class="form-tip">
            使用 <code>{"{{ variable }}"}</code> 语法定义变量，例如：
            <code>{"{{ user_input }}"}</code>、<code
              >{"{{ requirement_text }}"}</code
            >
          </div>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="formData.isDefault">设为默认模板</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="formData.isActive">激活此模板</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="查看模板" width="800px">
      <div v-if="currentTemplate" class="template-view">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模板名称">
            {{ currentTemplate.name }}
          </el-descriptions-item>
          <el-descriptions-item label="类别">
            <el-tag
              :type="getCategoryTagType(currentTemplate.category)"
              size="small"
            >
              {{ getCategoryText(currentTemplate.category) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="LLM 供应商">
            {{
              currentTemplate.provider
                ? getProviderText(currentTemplate.provider)
                : "默认"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="模型名称">
            {{ currentTemplate.modelName || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="默认模板">
            {{ currentTemplate.isDefault ? "是" : "否" }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag
              :type="currentTemplate.isActive ? 'success' : 'info'"
              size="small"
            >
              {{ currentTemplate.isActive ? "激活" : "停用" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ currentTemplate.description || "-" }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="template-content">
          <h4>模板内容</h4>
          <pre>{{ currentTemplate.template }}</pre>
        </div>
        <div
          v-if="currentTemplate.variables?.length"
          class="template-variables"
        >
          <h4>模板变量</h4>
          <el-tag
            v-for="variable in currentTemplate.variables"
            :key="variable"
            size="small"
            class="variable-tag"
          >
            <span v-text="'{{' + variable + '}}'" />
          </el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Plus, Document } from "@element-plus/icons-vue";
import {
  getPromptTemplates,
  createPromptTemplate,
  updatePromptTemplate,
  deletePromptTemplate,
  setDefaultPromptTemplate
} from "@/api/system/prompt-template";
import type { PromptTemplateListItem } from "@oops-ai/shared";

const templates = ref<PromptTemplateListItem[]>([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const categoryFilter = ref("");
const statusFilter = ref("");

const dialogVisible = ref(false);
const dialogMode = ref<"add" | "edit">("add");
const currentTemplate = ref<PromptTemplateListItem | null>(null);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const viewDialogVisible = ref(false);

const formData = ref({
  name: "",
  description: "",
  category: "",
  provider: "",
  modelName: "",
  template: "",
  isDefault: false,
  isActive: true
});

const formRules: FormRules = {
  name: [{ required: true, message: "请输入模板名称", trigger: "blur" }],
  category: [{ required: true, message: "请选择模板类别", trigger: "change" }],
  template: [{ required: true, message: "请输入模板内容", trigger: "blur" }]
};

const loadData = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (categoryFilter.value) {
      params.category = categoryFilter.value;
    }
    if (statusFilter.value) {
      params.isActive = statusFilter.value === "true";
    }
    params.page = currentPage.value;
    params.pageSize = pageSize.value;
    const res = await getPromptTemplates(params);
    templates.value = res.data;
    total.value = res.total;
  } catch (error: any) {
    ElMessage.error(error.message || "加载模板列表失败");
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = () => {
  currentPage.value = 1;
  loadData();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  loadData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  loadData();
};

const handleAdd = () => {
  dialogMode.value = "add";
  formData.value = {
    name: "",
    description: "",
    category: "",
    provider: "",
    modelName: "",
    template: "",
    isDefault: false,
    isActive: true
  };
  dialogVisible.value = true;
};

const handleEdit = (row: PromptTemplateListItem) => {
  dialogMode.value = "edit";
  currentTemplate.value = row;
  formData.value = {
    name: row.name,
    description: row.description || "",
    category: row.category,
    provider: row.provider || "",
    modelName: row.modelName || "",
    template: row.template,
    isDefault: row.isDefault,
    isActive: row.isActive
  };
  dialogVisible.value = true;
};

const handleView = (row: PromptTemplateListItem) => {
  currentTemplate.value = row;
  viewDialogVisible.value = true;
};

const handleDialogClose = () => {
  formRef.value?.resetFields();
  currentTemplate.value = null;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (valid) {
      submitLoading.value = true;
      try {
        const submitData = {
          ...formData.value,
          variables: extractVariables(formData.value.template)
        };

        if (dialogMode.value === "add") {
          await createPromptTemplate(submitData);
          ElMessage.success("提示词模板创建成功");
        } else if (currentTemplate.value) {
          await updatePromptTemplate(currentTemplate.value.id, submitData);
          ElMessage.success("提示词模板更新成功");
        }
        dialogVisible.value = false;
        await loadData();
      } catch (error: any) {
        ElMessage.error(error.message || "操作失败");
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

const extractVariables = (template: string): string[] => {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;
  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  return variables;
};

const handleDelete = (row: PromptTemplateListItem) => {
  ElMessageBox.confirm(`确定要删除模板 "${row.name}" 吗？`, "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await deletePromptTemplate(row.id);
        ElMessage.success("模板删除成功");
        await loadData();
      } catch (error: any) {
        ElMessage.error(error.message || "删除失败");
      }
    })
    .catch(() => {});
};

const handleSetDefault = async (row: PromptTemplateListItem) => {
  try {
    await setDefaultPromptTemplate(row.id);
    ElMessage.success("已设置为默认模板");
    await loadData();
  } catch (error: any) {
    ElMessage.error(error.message || "设置失败");
  }
};

const getCategoryTagType = (category: string) => {
  const typeMap: Record<string, any> = {
    "raw-to-requirement": "",
    "requirement-to-story": "success",
    "story-to-use-case": "warning",
    "generate-acceptance": "info",
    "identify-ambiguity": "danger",
    "generate-questions": "",
    "quality-assessment": "success",
    "code-analysis": "warning",
    "test-generation": "info",
    other: ""
  };
  return typeMap[category] || "";
};

const getCategoryText = (category: string) => {
  const textMap: Record<string, string> = {
    "raw-to-requirement": "原始需求 → 需求",
    "requirement-to-story": "需求 → 用户故事",
    "story-to-use-case": "用户故事 → 用例",
    "generate-acceptance": "生成验收标准",
    "identify-ambiguity": "识别模糊词汇",
    "generate-questions": "生成追问问题",
    "quality-assessment": "质量评估",
    "code-analysis": "代码分析",
    "test-generation": "测试生成",
    other: "其他"
  };
  return textMap[category] || category;
};

const getProviderText = (provider: string) => {
  const textMap: Record<string, string> = {
    openai: "OpenAI",
    ollama: "Ollama",
    deepseek: "DeepSeek",
    qwen: "通义千问",
    local: "本地模型"
  };
  return textMap[provider] || provider;
};

const formatDate = (date?: Date | string) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

onMounted(() => {
  loadData();
});

defineOptions({
  name: "PromptTemplateManagement"
});
</script>

<style scoped lang="scss">
.prompt-template {
  padding: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.table-card {
  :deep(.el-card__header) {
    padding: 16px 20px;
  }
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-left {
    display: flex;
    gap: 12px;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.template-table {
  :deep(.el-table__header) {
    th {
      font-weight: 600;
      color: var(--el-text-color-primary);
      background-color: var(--el-fill-color-light);
    }
  }

  .template-name {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 500;

    .template-icon {
      font-size: 18px;
      color: var(--el-color-primary);
    }
  }

  .description-text {
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  .text-muted {
    color: var(--el-text-color-placeholder);
  }
}

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);

  code {
    padding: 2px 6px;
    margin: 0 2px;
    font-family: monospace;
    font-size: 12px;
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }
}

.template-view {
  .template-content {
    margin-top: 20px;

    h4 {
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
    }

    pre {
      padding: 16px;
      margin: 0;
      font-family: "Courier New", monospace;
      font-size: 13px;
      line-height: 1.6;
      word-wrap: break-word;
      white-space: pre-wrap;
      background: var(--el-fill-color-light);
      border-radius: 4px;
    }
  }

  .template-variables {
    margin-top: 20px;

    h4 {
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
    }

    .variable-tag {
      margin-right: 8px;
      margin-bottom: 8px;
      font-family: monospace;
    }
  }
}
</style>
