<template>
  <div class="raw-requirement-tab">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="search"
          placeholder="搜索原始需求内容"
          clearable
          style="width: 280px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-select
          v-model="sourceTypeFilter"
          placeholder="来源类型"
          clearable
          style="width: 150px"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="会议记录" value="meeting" />
          <el-option label="访谈" value="interview" />
          <el-option label="文档" value="document" />
          <el-option label="邮件" value="email" />
          <el-option label="问卷调查" value="survey" />
          <el-option label="观察" value="observation" />
          <el-option label="其他" value="other" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleNavigateToAdd">
          <el-icon>
            <Plus />
          </el-icon>
          添加原始需求
        </el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="filteredRawRequirements"
      stripe
      border
      class="data-table"
    >
      <el-table-column prop="content" label="原始需求内容" min-width="300">
        <template #default="{ row }">
          <div class="content-preview" @click="handleView(row)">
            <el-icon class="content-icon">
              <Document />
            </el-icon>
            <span class="content-text">{{ row.content }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="sourceType" label="来源类型" width="120">
        <template #default="{ row }">
          <el-tag type="info">{{ getSourceTypeText(row.sourceType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="proposedBy" label="提出人" width="120">
        <template #default="{ row }">
          <span v-if="row.proposedBy">{{ row.proposedBy }}</span>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="scenario" label="场景" width="150">
        <template #default="{ row }">
          <span v-if="row.scenario" class="scenario-text">{{
            row.scenario
          }}</span>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" link @click="handleView(row)">
            查看
          </el-button>
          <el-button type="warning" size="small" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" link @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        v-if="dialogMode !== 'view'"
        :model="formData"
        label-width="100px"
      >
        <el-form-item label="需求内容" required>
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="8"
            placeholder="请输入原始需求内容"
          />
          <div class="form-actions" style="margin-top: 12px; text-align: right">
            <el-button
              type="primary"
              :loading="analyzing"
              :disabled="!formData.content.trim()"
              @click="handleAnalyze"
            >
              <el-icon><MagicStick /></el-icon>
              分析需求
            </el-button>
          </div>
        </el-form-item>

        <!-- AI 分析结果 -->
        <div v-if="analysisResults.length > 0" class="analysis-results">
          <h4 style="margin-bottom: 12px">AI 分析结果</h4>
          <el-card
            class="result-card"
            shadow="hover"
            :body-style="{ padding: '12px' }"
          >
            <el-timeline>
              <el-timeline-item
                v-for="(result, index) in analysisResults"
                :key="index"
                timestamp=""
                color="#2080f0"
              >
                {{ result }}
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </div>

        <!-- 追问列表 -->
        <div v-if="questions.length > 0" class="questions-section">
          <h4 style="margin-bottom: 12px">AI 追问</h4>
          <div
            v-for="(question, index) in questions"
            :key="index"
            class="question-item"
          >
            <el-card shadow="hover" :body-style="{ padding: '16px' }">
              <div class="question-header">
                <span class="question-text">{{ question }}</span>
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDeleteQuestion(index)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
              <el-input
                v-model="questionAnswers[index]"
                type="textarea"
                :rows="3"
                placeholder="请输入您的回答"
                style="margin-top: 12px"
              />
            </el-card>
          </div>
        </div>

        <el-form-item label="来源类型">
          <el-select
            v-model="formData.sourceType"
            placeholder="选择来源类型"
            style="width: 100%"
          >
            <el-option
              v-for="option in getSourceTypeOptions()"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="提出人">
          <el-input v-model="formData.proposedBy" placeholder="请输入提出人" />
        </el-form-item>
        <el-form-item label="场景">
          <el-input v-model="formData.scenario" placeholder="请输入使用场景" />
        </el-form-item>
      </el-form>

      <div v-else-if="currentRawRequirement" class="detail-view">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="来源类型">
            <el-tag type="info">{{
              getSourceTypeText(currentRawRequirement.sourceType)
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提出人">
            {{ currentRawRequirement.proposedBy || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="场景">
            {{ currentRawRequirement.scenario || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(currentRawRequirement.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="content-section">
          <h4>原始需求内容</h4>
          <pre class="content-pre">{{ currentRawRequirement.content }}</pre>
        </div>
        <div v-if="currentRawRequirement.sourceMeta" class="meta-section">
          <h4>附加信息</h4>
          <pre class="meta-pre">{{
            JSON.stringify(currentRawRequirement.sourceMeta, null, 2)
          }}</pre>
        </div>
      </div>

      <template #footer>
        <template v-if="dialogMode === 'view'">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </template>
        <template v-else>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Plus,
  Document,
  MagicStick,
  Delete
} from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useRawRequirements } from "../composables/useRawRequirements";
import type { RawRequirement } from "@oops-ai/shared";

const props = defineProps<{
  projectId: string;
}>();

defineOptions({
  name: "RawRequirementTab"
});

const {
  rawRequirements,
  loading,
  page,
  pageSize,
  total,
  search,
  dialogVisible,
  dialogMode,
  currentRawRequirement,
  formData,
  submitLoading,
  analyzing,
  analysisResults,
  questions,
  questionAnswers,
  loadRawRequirements,
  handleSearch,
  handleSizeChange,
  handlePageChange,
  handleAdd,
  handleEdit,
  handleView,
  handleSubmit,
  handleDelete,
  handleAnalyze,
  handleDeleteQuestion,
  getSourceTypeText,
  getSourceTypeOptions
} = useRawRequirements(props.projectId);

const sourceTypeFilter = ref("");

const filteredRawRequirements = computed(() => {
  let result = rawRequirements.value;

  if (sourceTypeFilter.value) {
    result = result.filter(item => item.sourceType === sourceTypeFilter.value);
  }

  if (search.value) {
    const searchText = search.value.toLowerCase();
    result = result.filter(
      item =>
        item.content.toLowerCase().includes(searchText) ||
        (item.proposedBy &&
          item.proposedBy.toLowerCase().includes(searchText)) ||
        (item.scenario && item.scenario.toLowerCase().includes(searchText))
    );
  }

  return result;
});

const dialogTitle = computed(() => {
  if (dialogMode.value === "add") return "添加原始需求";
  if (dialogMode.value === "edit") return "编辑原始需求";
  return "原始需求详情";
});

const handleFilterChange = () => {
  page.value = 1;
};

const handleDialogClose = () => {
  if (dialogMode.value !== "view") {
    formData.value = {
      content: "",
      sourceType: "",
      sourceMeta: undefined,
      proposedBy: "",
      proposedAt: undefined,
      scenario: ""
    };
    // 重置 AI 分析相关状态
    analysisResults.splice(0);
    questions.splice(0);
    questionAnswers.splice(0);
  }
};

// 跳转到新增原始需求页面
const handleNavigateToAdd = () => {
  const router = useRouter();
  router.push(`/system/project/${props.projectId}/raw-requirement`);
};

const formatDate = (date?: Date | string) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleString("zh-CN");
};

const handleDeleteWithConfirm = (row: RawRequirement) => {
  ElMessageBox.confirm(
    `确定要删除原始需求 "${row.content.substring(0, 50)}..." 吗？`,
    "删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(async () => {
      await handleDelete(row);
    })
    .catch(() => {});
};

defineExpose({
  loadRawRequirements
});
</script>

<style scoped lang="scss">
.raw-requirement-tab {
  .tab-toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    @media (width <= 768px) {
      flex-direction: column;
      align-items: stretch;
    }

    .toolbar-left {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      @media (width <= 768px) {
        flex-direction: column;
      }
    }

    .toolbar-right {
      flex-shrink: 0;
    }
  }

  .content-preview {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    cursor: pointer;

    .content-icon {
      flex-shrink: 0;
      margin-top: 2px;
      color: var(--el-color-primary);
    }

    .content-text {
      display: -webkit-box;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      line-height: 1.6;
      -webkit-box-orient: vertical;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .scenario-text {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .text-muted {
    font-size: 13px;
    color: var(--el-text-color-placeholder);
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
    margin-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .detail-view {
    .content-section,
    .meta-section {
      margin-top: 20px;

      h4 {
        margin: 0 0 12px;
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .content-pre,
      .meta-pre {
        padding: 16px;
        margin: 0;
        font-size: 14px;
        line-height: 1.8;
        word-break: break-word;
        white-space: pre-wrap;
        background: var(--el-fill-color-light);
        border-radius: 4px;
      }
    }
  }

  // AI 分析样式
  .analysis-results {
    margin-top: 20px;
    margin-bottom: 20px;

    h4 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .result-card {
      margin-bottom: 12px;
    }
  }

  // 追问样式
  .questions-section {
    margin-top: 20px;
    margin-bottom: 20px;

    h4 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .question-item {
      margin-bottom: 16px;

      .question-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;

        .question-text {
          flex: 1;
          margin-right: 12px;
          font-weight: 500;
          line-height: 1.6;
        }
      }
    }
  }

  // 表单操作样式
  .form-actions {
    margin-top: 12px;
    text-align: right;
  }
}
</style>
