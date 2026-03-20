<template>
  <div class="project-detail">
    <el-row :gutter="20">
      <el-col :span="24">
        <ProjectHeaderCard
          :project="project"
          @edit="handleEdit"
          @back="handleBack"
        />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div
              class="stat-icon"
              style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              "
            >
              <el-icon size="24">
                <Document />
              </el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statistics.totalRequirements }}</span>
              <span class="stat-label">总需求数</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div
              class="stat-icon"
              style="
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              "
            >
              <el-icon size="24">
                <ChatLineSquare />
              </el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statistics.totalStories }}</span>
              <span class="stat-label">用户故事</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div
              class="stat-icon"
              style="
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              "
            >
              <el-icon size="24">
                <Clock />
              </el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statistics.pendingApprovals }}</span>
              <span class="stat-label">待审批</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div
              class="stat-icon"
              style="
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
              "
            >
              <el-icon size="24">
                <CircleCheck />
              </el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{
                statistics.completedRequirements
              }}</span>
              <span class="stat-label">已完成</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 工具栏 -->
    <el-row :gutter="20" class="toolbar-row">
      <el-col :span="24">
        <div class="toolbar">
          <el-button type="primary" @click="handleAddRawRequirement">
            <el-icon><Plus /></el-icon>
            添加客户需求
          </el-button>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="never" class="tabs-card">
          <el-tabs v-model="activeTab" class="project-tabs">
            <el-tab-pane label="需求管理" name="requirements">
              <RequirementList
                :project-id="projectId"
                @view="handleViewRequirement"
                @edit="handleEditRequirement"
                @create="handleCreateRequirement"
                @generate-stories="handleGenerateStories"
              />
            </el-tab-pane>

            <el-tab-pane label="原始需求" name="raw-requirements">
              <RawRequirementTab
                ref="rawRequirementTabRef"
                :project-id="projectId"
              />
            </el-tab-pane>

            <el-tab-pane label="用户故事" name="stories">
              <UserStoryTab
                ref="userStoryTabRef"
                @view-requirement="handleViewRequirement"
              />
            </el-tab-pane>

            <el-tab-pane label="审批管理" name="approvals">
              <ApprovalTab
                ref="approvalTabRef"
                @view-requirement="handleViewRequirement"
              />
            </el-tab-pane>

            <el-tab-pane label="项目成员" name="members">
              <MemberTab ref="memberTabRef" :project-id="projectId" />
            </el-tab-pane>

            <el-tab-pane label="项目活动" name="activities">
              <ActivityTab ref="activityTabRef" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Document,
  ChatLineSquare,
  Clock,
  CircleCheck,
  Plus
} from "@element-plus/icons-vue";
import { ProjectHeaderCard } from "@/components/Project";
import { RequirementList } from "@/components/Requirement";
import {
  UserStoryTab,
  ApprovalTab,
  MemberTab,
  ActivityTab,
  RawRequirementTab
} from "./components";

import { getProject } from "@/api/system/project";
import type { ProjectViewModel } from "@oops-ai/shared";

const route = useRoute();
const router = useRouter();

const projectId = computed(() => route.params.id as string);

const project = ref<ProjectViewModel | null>(null);
const activeTab = ref("requirements");

const userStoryTabRef = ref<InstanceType<typeof UserStoryTab>>();
const approvalTabRef = ref<InstanceType<typeof ApprovalTab>>();
const memberTabRef = ref<InstanceType<typeof MemberTab>>();
const activityTabRef = ref<InstanceType<typeof ActivityTab>>();
const rawRequirementTabRef = ref<InstanceType<typeof RawRequirementTab>>();

const statistics = ref({
  totalRequirements: 0,
  totalStories: 0,
  pendingApprovals: 0,
  completedRequirements: 0
});

const loadProject = async () => {
  try {
    const res = await getProject(projectId.value);
    project.value = res;
  } catch (error: any) {
    ElMessage.error(error.message || "加载项目信息失败");
  }
};

const loadStatistics = async () => {
  statistics.value = {
    totalRequirements: 156,
    totalStories: 89,
    pendingApprovals: 12,
    completedRequirements: 98
  };
};

const loadAllData = async () => {
  await Promise.all([
    loadProject(),
    loadStatistics(),
    userStoryTabRef.value?.loadStories(),
    approvalTabRef.value?.loadApprovals(),
    approvalTabRef.value?.loadRequirements(),
    memberTabRef.value?.loadMembers(),
    memberTabRef.value?.loadAllUsers(),
    activityTabRef.value?.loadActivities(),
    rawRequirementTabRef.value?.loadRawRequirements()
  ]);
};

const handleEdit = () => {
  ElMessage.info("编辑项目功能");
};

const handleBack = () => {
  router.push("/system/project");
};

const handleCreateRequirement = () => {
  ElMessage.info("创建需求功能");
};

const handleViewRequirement = (row: any) => {
  ElMessage.info(`查看需求: ${row.title}`);
};

const handleGenerateStories = (row: any) => {
  ElMessage.info(`为需求 "${row.title}" 生成故事`);
};

const handleEditRequirement = (row: any) => {
  ElMessage.info(`编辑需求: ${row.title}`);
};

const handleAddRawRequirement = () => {
  // 跳转到新增原始需求页面
  router.push(`/system/project/${projectId.value}/raw-requirement`);
};

onMounted(async () => {
  await loadAllData();
});

defineOptions({
  name: "ProjectDetail"
});
</script>

<style scoped lang="scss">
.project-detail {
  min-height: calc(100vh - 140px);
  padding: 20px;
  background: var(--el-bg-color-page);
}

.stats-row {
  margin-bottom: 20px;
}

.toolbar-row {
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  align-items: center;
}

.stat-card {
  height: 100%;

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.stat-content {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stat-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  color: white;
  border-radius: 12px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    color: var(--el-text-color-primary);
  }

  .stat-label {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.tabs-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}

.project-tabs {
  :deep(.el-tabs__header) {
    padding: 16px 20px 0;
    margin: 0 0 0 20px;
    background: var(--el-fill-color-light);
    border-radius: 8px 8px 0 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__content) {
    padding: 20px;
  }
}

@media (width <= 768px) {
  .project-detail {
    padding: 12px;
  }

  .stats-row {
    .el-col {
      margin-bottom: 12px;
    }
  }
}
</style>
