<template>
  <div class="requirement-list">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchQuery"
          placeholder="搜索需求标题"
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
          v-model="statusFilter"
          placeholder="状态筛选"
          clearable
          style="width: 150px"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="草稿" value="DRAFT" />
          <el-option label="已提交" value="SUBMITTED" />
          <el-option label="审核中" value="REVIEWING" />
          <el-option label="已批准" value="APPROVED" />
          <el-option label="已拒绝" value="REJECTED" />
          <el-option label="实施中" value="IMPLEMENTING" />
          <el-option label="测试中" value="TESTING" />
          <el-option label="已完成" value="COMPLETED" />
          <el-option label="已取消" value="CANCELED" />
        </el-select>
        <el-select
          v-model="priorityFilter"
          placeholder="优先级筛选"
          clearable
          style="width: 150px"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="低" value="LOW" />
          <el-option label="中" value="MEDIUM" />
          <el-option label="高" value="HIGH" />
          <el-option label="紧急" value="URGENT" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon>
            <Plus />
          </el-icon>
          创建需求
        </el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="requirements"
      stripe
      border
      class="data-table"
    >
      <el-table-column prop="title" label="需求标题" min-width="200" sortable>
        <template #default="{ row }">
          <div class="requirement-title" @click="handleView(row)">
            <el-icon class="title-icon">
              <Document />
            </el-icon>
            <span>{{ row.title }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getRequirementTypeTag(row.type)" size="small">
            {{ getRequirementTypeText(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="100">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)" size="small">
            {{ getPriorityText(row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag
            :type="getRequirementStatusType(row.status)"
            effect="light"
            round
          >
            {{ getRequirementStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="storyPoints"
        label="故事点"
        width="80"
        align="center"
      >
        <template #default="{ row }">
          <span v-if="row.storyPoints">{{ row.storyPoints }}</span>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="assignee" label="负责人" width="120">
        <template #default="{ row }">
          <div v-if="row.assignee" class="assignee-info">
            <el-avatar :size="24">{{
              row.assignee.name?.charAt(0) || "U"
            }}</el-avatar>
            <span>{{ row.assignee.name || "未分配" }}</span>
          </div>
          <span v-else class="text-muted">未分配</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="160" sortable>
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" link @click="handleView(row)">
            查看
          </el-button>
          <el-button
            type="success"
            size="small"
            link
            @click="handleGenerateStories(row)"
          >
            生成故事
          </el-button>
          <el-button type="warning" size="small" link @click="handleEdit(row)">
            编辑
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Search, Plus, Document } from "@element-plus/icons-vue";
import { getRequirementsByProject } from "@/api/system/requirement";
import type { RequirementListItem } from "@oops-ai/shared";

interface Props {
  projectId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "view", row: RequirementListItem): void;
  (e: "edit", row: RequirementListItem): void;
  (e: "create"): void;
  (e: "generate-stories", row: RequirementListItem): void;
}>();

const requirements = ref<RequirementListItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchQuery = ref("");
const statusFilter = ref("");
const priorityFilter = ref("");

const loadRequirements = async () => {
  loading.value = true;
  try {
    const res = await getRequirementsByProject(props.projectId, {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      priority: priorityFilter.value || undefined
    });
    requirements.value = res;
    total.value = res.length;
  } catch (error: any) {
    ElMessage.error(error.message || "加载需求列表失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadRequirements();
};

const handleFilterChange = () => {
  currentPage.value = 1;
  loadRequirements();
};

const handleSizeChange = () => {
  currentPage.value = 1;
  loadRequirements();
};

const handleCurrentChange = () => {
  loadRequirements();
};

const handleView = (row: RequirementListItem) => {
  emit("view", row);
};

const handleEdit = (row: RequirementListItem) => {
  emit("edit", row);
};

const handleCreate = () => {
  emit("create");
};

const handleGenerateStories = (row: RequirementListItem) => {
  emit("generate-stories", row);
};

const getRequirementTypeTag = (type?: string) => {
  const typeMap: Record<string, any> = {
    FEATURE: "",
    BUGFIX: "danger",
    ENHANCEMENT: "warning",
    TASK: "info",
    NON_FUNCTIONAL: "success"
  };
  return typeMap[type || "FEATURE"] || "";
};

const getRequirementTypeText = (type?: string) => {
  const textMap: Record<string, string> = {
    FEATURE: "功能",
    BUGFIX: "缺陷",
    ENHANCEMENT: "优化",
    TASK: "任务",
    NON_FUNCTIONAL: "非功能"
  };
  return textMap[type || "FEATURE"] || "未知";
};

const getPriorityType = (priority?: string) => {
  const typeMap: Record<string, any> = {
    LOW: "info",
    MEDIUM: "",
    HIGH: "warning",
    URGENT: "danger"
  };
  return typeMap[priority || "MEDIUM"] || "";
};

const getPriorityText = (priority?: string) => {
  const textMap: Record<string, string> = {
    LOW: "低",
    MEDIUM: "中",
    HIGH: "高",
    URGENT: "紧急"
  };
  return textMap[priority || "MEDIUM"] || "未知";
};

const getRequirementStatusType = (status?: string) => {
  const typeMap: Record<string, any> = {
    DRAFT: "info",
    SUBMITTED: "",
    REVIEWING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
    IMPLEMENTING: "primary",
    TESTING: "warning",
    COMPLETED: "success",
    CANCELED: "info"
  };
  return typeMap[status || "DRAFT"] || "info";
};

const getRequirementStatusText = (status?: string) => {
  const textMap: Record<string, string> = {
    DRAFT: "草稿",
    SUBMITTED: "已提交",
    REVIEWING: "审核中",
    APPROVED: "已批准",
    REJECTED: "已拒绝",
    IMPLEMENTING: "实施中",
    TESTING: "测试中",
    COMPLETED: "已完成",
    CANCELED: "已取消"
  };
  return textMap[status || "DRAFT"] || "未知";
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
  loadRequirements();
});

defineOptions({
  name: "RequirementList"
});
</script>

<style scoped lang="scss">
.requirement-list {
  :deep(.el-table) {
    .requirement-title {
      display: flex;
      gap: 8px;
      align-items: center;
      color: var(--el-color-primary);
      cursor: pointer;

      .title-icon {
        flex-shrink: 0;
        font-size: 16px;
      }

      &:hover {
        text-decoration: underline;
      }
    }

    .text-muted {
      color: var(--el-text-color-placeholder);
    }

    .assignee-info {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }
}

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
    align-items: center;

    @media (width <= 768px) {
      flex-direction: column;
      width: 100%;

      .el-input,
      .el-select {
        width: 100% !important;
      }
    }
  }

  .toolbar-right {
    display: flex;
    flex-shrink: 0;
    gap: 12px;

    @media (width <= 768px) {
      justify-content: flex-end;
      width: 100%;
    }
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
  margin-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
