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
        <el-button type="primary" @click="handleAdd">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessageBox } from "element-plus";
import { Search, Plus, Document } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useRawRequirements } from "../composables/useRawRequirements";
import type { RawRequirement } from "@oops-ai/shared";
const router = useRouter();
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
  loadRawRequirements,
  handleSearch,
  handleSizeChange,
  handlePageChange,
  handleDelete,
  getSourceTypeText
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

const handleFilterChange = () => {
  page.value = 1;
};

// 跳转到新增原始需求页面
const handleAdd = () => {
  router.push({
    name: "CreateRawRequirement",
    params: { projectId: props.projectId }
  });
};

// 跳转到编辑原始需求页面
const handleEdit = (row: RawRequirement) => {
  router.push({
    name: "EditRawRequirement",
    params: { projectId: props.projectId, id: row.id }
  });
};

// 跳转到查看原始需求页面
const handleView = (row: RawRequirement) => {
  router.push(`/system/project/${props.projectId}/raw-requirement/${row.id}`);
};

const formatDate = (date?: Date | string) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleString("zh-CN");
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
