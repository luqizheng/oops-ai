<template>
  <div class="llm-config">
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="table-header">
          <div class="header-left">
            <h3>LLM 配置管理</h3>
            <el-tag type="info" effect="plain"> 共 {{ total }} 个配置 </el-tag>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="handleAdd">
              <el-icon>
                <Plus />
              </el-icon>
              添加配置
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="configurations"
        stripe
        border
        class="llm-table"
      >
        <el-table-column prop="provider" label="供应商" width="120">
          <template #default="{ row }">
            <el-tag :type="getProviderTagType(row.provider)" effect="plain">
              {{ getProviderText(row.provider) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="modelName" label="模型名称" min-width="180">
          <template #default="{ row }">
            <div class="model-name">
              <el-icon class="model-icon">
                <Cpu />
              </el-icon>
              <span>{{ row.modelName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="apiEndpoint" label="API 端点" min-width="200">
          <template #default="{ row }">
            <span v-if="row.apiEndpoint" class="endpoint-text">{{
              row.apiEndpoint
            }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="temperature"
          label="温度"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <span>{{ row.temperature }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="maxTokens"
          label="最大 Token"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <span>{{ row.maxTokens }}</span>
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
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              :loading="row.testing"
              @click="handleTest(row)"
            >
              测试
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
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '添加 LLM 配置' : '编辑 LLM 配置'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="供应商" prop="provider">
          <el-select
            v-model="formData.provider"
            placeholder="选择供应商"
            style="width: 100%"
            :disabled="dialogMode === 'edit'"
          >
            <el-option label="OpenAI" value="openai" />
            <el-option label="Ollama" value="ollama" />
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="通义千问 (Qwen)" value="qwen" />
            <el-option label="本地模型" value="local" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型名称" prop="modelName">
          <el-input
            v-model="formData.modelName"
            placeholder="请输入模型名称"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="API 端点" prop="apiEndpoint">
          <el-input
            v-model="formData.apiEndpoint"
            placeholder="请输入 API 端点（如：https://api.openai.com/v1）"
          />
        </el-form-item>
        <el-form-item label="API 密钥" prop="apiKey">
          <el-input
            v-model="formData.apiKey"
            type="password"
            placeholder="请输入 API 密钥"
            show-password
          />
        </el-form-item>
        <el-form-item label="温度参数">
          <el-slider
            v-model="formData.temperature"
            :min="0"
            :max="2"
            :step="0.1"
            show-stops
          />
          <div class="form-tip">
            控制输出的随机性，较低的值更确定性，较高的值更有创造性
          </div>
        </el-form-item>
        <el-form-item label="最大 Token">
          <el-input-number
            v-model="formData.maxTokens"
            :min="100"
            :max="100000"
            :step="100"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="formData.isDefault">设为默认配置</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="formData.isActive">激活此配置</el-checkbox>
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

    <el-dialog v-model="testDialogVisible" title="测试连接" width="500px">
      <div class="test-result">
        <el-alert
          v-if="testResult"
          :type="testResult.success ? 'success' : 'error'"
          :title="testResult.message"
          :closable="false"
          show-icon
        />
        <el-input
          v-if="testResult?.success"
          v-model="testOutput"
          type="textarea"
          :rows="6"
          readonly
          placeholder="测试输出将显示在这里"
          class="test-output"
        />
      </div>
      <template #footer>
        <el-button @click="testDialogVisible = false">关闭</el-button>
        <el-button
          v-if="!testResult"
          type="primary"
          :loading="testLoading"
          @click="executeTest"
        >
          执行测试
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules
} from "element-plus";
import { Plus, Cpu } from "@element-plus/icons-vue";
import {
  getLLMConfigurations,
  createLLMConfiguration,
  updateLLMConfiguration,
  deleteLLMConfiguration,
  testLLMConnection,
  setDefaultLLMConfiguration
} from "@/api/system/llm";
import type { LLMConfigListItem } from "@oops-ai/shared";

const configurations = ref<LLMConfigListItem[]>([]);
const loading = ref(false);
const total = ref(0);

const dialogVisible = ref(false);
const dialogMode = ref<"add" | "edit">("add");
const currentConfig = ref<LLMConfigListItem | null>(null);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const formData = ref({
  provider: "",
  modelName: "",
  apiEndpoint: "",
  apiKey: "",
  temperature: 0.7,
  maxTokens: 2000,
  isDefault: false,
  isActive: true
});

const formRules: FormRules = {
  provider: [{ required: true, message: "请选择供应商", trigger: "change" }],
  modelName: [{ required: true, message: "请输入模型名称", trigger: "blur" }]
};

const testDialogVisible = ref(false);
const testLoading = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);
const testOutput = ref("");

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getLLMConfigurations();
    configurations.value = res.map(config => ({
      ...config,
      testing: false
    }));
    total.value = res.length;
  } catch (error: any) {
    ElMessage.error(error.message || "加载 LLM 配置失败");
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  dialogMode.value = "add";
  formData.value = {
    provider: "",
    modelName: "",
    apiEndpoint: "",
    apiKey: "",
    temperature: 0.7,
    maxTokens: 2000,
    isDefault: false,
    isActive: true
  };
  dialogVisible.value = true;
};

const handleEdit = (row: LLMConfigListItem) => {
  dialogMode.value = "edit";
  currentConfig.value = row;
  formData.value = {
    provider: row.provider,
    modelName: row.modelName,
    apiEndpoint: row.apiEndpoint || "",
    apiKey: row.apiKey || "",
    temperature: row.temperature,
    maxTokens: row.maxTokens,
    isDefault: row.isDefault,
    isActive: row.isActive
  };
  dialogVisible.value = true;
};

const handleDialogClose = () => {
  formRef.value?.resetFields();
  currentConfig.value = null;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (dialogMode.value === "add") {
          await createLLMConfiguration(formData.value);
          ElMessage.success("LLM 配置创建成功");
        } else if (currentConfig.value) {
          await updateLLMConfiguration(currentConfig.value.id, formData.value);
          ElMessage.success("LLM 配置更新成功");
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

const handleDelete = (row: LLMConfigListItem) => {
  ElMessageBox.confirm(`确定要删除配置 "${row.modelName}" 吗？`, "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await deleteLLMConfiguration(row.id);
        ElMessage.success("配置删除成功");
        await loadData();
      } catch (error: any) {
        ElMessage.error(error.message || "删除失败");
      }
    })
    .catch(() => {});
};

const handleTest = (row: LLMConfigListItem) => {
  currentConfig.value = row;
  testResult.value = null;
  testOutput.value = "";
  testDialogVisible.value = true;
};

const executeTest = async () => {
  if (!currentConfig.value) return;

  testLoading.value = true;
  try {
    const res = await testLLMConnection(currentConfig.value.id);
    testResult.value = {
      success: res.success,
      message: res.message
    };
    if (res.success) {
      testOutput.value = "连接测试成功！LLM 配置可以正常使用。";
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: error.message || "测试失败"
    };
  } finally {
    testLoading.value = false;
  }
};

const handleSetDefault = async (row: LLMConfigListItem) => {
  try {
    await setDefaultLLMConfiguration(row.id);
    ElMessage.success("已设置为默认配置");
    await loadData();
  } catch (error: any) {
    ElMessage.error(error.message || "设置失败");
  }
};

const getProviderTagType = (provider: string) => {
  const typeMap: Record<string, any> = {
    openai: "",
    ollama: "success",
    deepseek: "warning",
    qwen: "info",
    local: ""
  };
  return typeMap[provider] || "";
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
  name: "LLMConfigManagement"
});
</script>

<style scoped lang="scss">
.llm-config {
  padding: 20px;
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

.llm-table {
  :deep(.el-table__header) {
    th {
      font-weight: 600;
      color: var(--el-text-color-primary);
      background-color: var(--el-fill-color-light);
    }
  }

  .model-name {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 500;

    .model-icon {
      font-size: 18px;
      color: var(--el-color-primary);
    }
  }

  .endpoint-text {
    font-family: monospace;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .text-muted {
    color: var(--el-text-color-placeholder);
  }
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.test-result {
  .test-output {
    margin-top: 16px;
  }
}
</style>
