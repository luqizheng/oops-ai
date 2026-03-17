<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <div
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <el-button
              @click="router.go(-1)"
              link
              :icon="ArrowLeft"
              class="mr-4"
            />
            <div>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ project.name }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                项目标识: {{ project.key }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <el-button
              @click="router.push(`/projects/${project.id}/edit`)"
              :icon="Edit"
              size="small"
              plain
            >
              编辑项目
            </el-button>
            <el-button
              @click="manageMembers"
              :icon="User"
              size="small"
              type="primary"
            >
              管理成员
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 项目概览卡片 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- 项目基本信息 -->
        <div
          class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <div
            class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
          >
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                项目概览
              </h2>
            </div>
            <div>
              <el-tag :type="projectStatusType" size="large" effect="dark">{{
                project.status
              }}</el-tag>
            </div>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  项目描述
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{ project.description || "暂无描述" }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  创建时间
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{ formatDate(project.createdAt) }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  最后更新
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{ formatDate(project.updatedAt) }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  项目成员
                </p>
                <div class="flex -space-x-2 overflow-hidden">
                  <div
                    v-for="(member, idx) in project.members.slice(0, 5)"
                    :key="idx"
                    class="inline-flex items-center justify-center w-8 h-8 border-2 border-white dark:border-gray-800 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-400 dark:text-slate-300 text-xs font-bold ring-1 ring-slate-100"
                  >
                    {{ member.user?.name?.charAt(0) || "U" }}
                  </div>
                  <div
                    v-if="project.members.length > 5"
                    class="inline-flex items-center justify-center w-8 h-8 border-2 border-white dark:border-gray-800 rounded-full bg-indigo-600 text-white text-xs font-bold"
                  >
                    +{{ project.members.length - 5 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 项目统计卡片 -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            项目统计
          </h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >总需求数</span
              >
              <span class="text-xl font-bold text-gray-900 dark:text-white">{{
                project.requirements.length
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >进行中需求</span
              >
              <span
                class="text-xl font-bold text-blue-600 dark:text-blue-400"
                >{{ inProgressRequirements }}</span
              >
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >已完成需求</span
              >
              <span
                class="text-xl font-bold text-green-600 dark:text-green-400"
                >{{ completedRequirements }}</span
              >
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >延期需求</span
              >
              <span class="text-xl font-bold text-red-600 dark:text-red-400">{{
                overdueRequirements
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 项目进度看板 -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            项目进度
          </h2>
        </div>
        <div class="space-y-6">
          <!-- 进度条 -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >整体进度</span
              >
              <span class="text-sm font-semibold text-gray-900 dark:text-white"
                >{{ overallProgress }}%</span
              >
            </div>
            <el-progress :percentage="overallProgress" :stroke-width="8" />
          </div>

          <!-- 状态分布 -->
          <div>
            <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
              需求状态分布
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                v-for="status in requirementStatuses"
                :key="status.value"
                class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{
                    status.label
                  }}</span>
                  <span
                    class="text-lg font-semibold text-gray-900 dark:text-white"
                    >{{ status.count }}</span
                  >
                </div>
                <el-progress
                  :percentage="status.percentage"
                  :stroke-width="6"
                  :color="status.color"
                  class="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 任务列表与团队成员 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 需求列表 -->
        <div
          class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              需求列表
            </h2>
            <el-button
              @click="router.push(`/requirements/new?projectId=${project.id}`)"
              type="primary"
              size="small"
            >
              <el-icon class="mr-1"><Plus /></el-icon>新建需求
            </el-button>
          </div>

          <!-- 需求表格 -->
          <el-table
            :data="project.requirements"
            :row-height="60"
            border
            size="small"
            class="compact-table"
          >
            <el-table-column prop="title" label="需求名称" min-width="200">
              <template #default="{ row }">
                <div
                  class="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
                >
                  {{ row.title }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{
                  row.status
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="priority" label="优先级" width="100">
              <template #default="{ row }">
                <el-tag
                  :type="getPriorityType(row.priority)"
                  size="small"
                  effect="plain"
                  >{{ row.priority }}</el-tag
                >
              </template>
            </el-table-column>
            <el-table-column label="负责人" width="120">
              <template #default="{ row }">
                <span class="text-gray-600 dark:text-gray-300">{{
                  row.assignee?.name || "未分配"
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="截止日期" width="140">
              <template #default="{ row }">
                <span
                  :class="
                    row.dueDate && new Date(row.dueDate) < new Date()
                      ? 'text-red-500'
                      : 'text-gray-600 dark:text-gray-300'
                  "
                >
                  {{ row.dueDate ? formatDate(row.dueDate) : "无" }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button
                  @click="router.push(`/requirements/${row.id}`)"
                  link
                  size="small"
                >
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div
            v-if="project.requirements.length === 0"
            class="text-center py-12"
          >
            <el-empty description="暂无需求" :image-size="120">
              <template #extra>
                <el-button
                  @click="
                    router.push(`/projects/${project.id}/requirements/new`)
                  "
                  type="primary"
                  plain
                >
                  立即创建
                </el-button>
              </template>
            </el-empty>
          </div>
        </div>

        <!-- 团队成员 -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              团队成员
            </h2>
            <el-button
              @click="manageMembers"
              link
              size="small"
              :icon="CirclePlus"
            >
              添加成员
            </el-button>
          </div>

          <div class="space-y-4">
            <div
              v-for="member in project.members"
              :key="member.userId"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-full bg-slate-100 dark:bg-gray-600 flex items-center justify-center"
                >
                  <span
                    class="text-sm font-bold text-slate-500 dark:text-slate-300"
                    >{{ member.user?.name?.charAt(0) || "U" }}</span
                  >
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ member.user?.name || "未知用户" }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ member.user?.email }}
                  </div>
                </div>
              </div>
              <el-tag
                :type="getRoleType(member.role)"
                size="small"
                effect="plain"
                >{{ getRoleLabel(member.role) }}</el-tag
              >
            </div>
          </div>

          <div v-if="project.members.length === 0" class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400">暂无团队成员</p>
            <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
              点击上方按钮添加成员
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- 成员管理侧边抽屉 -->
    <el-drawer
      v-model="showMembersDrawer"
      title=""
      size="650px"
      direction="rtl"
      :with-header="false"
      class="modern-drawer"
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            成员管理 - {{ project.name }}
          </h3>
          <el-button
            @click="closeMembersDrawer"
            size="small"
            text
            :icon="CircleClose"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          />
        </div>

        <!-- 添加成员表单 -->
        <div
          class="bg-slate-50 dark:bg-gray-700 p-6 rounded-2xl border border-slate-100 dark:border-gray-600 mb-8"
        >
          <h4
            class="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4"
          >
            录入新成员
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <el-select
              v-model="newMember.userId"
              placeholder="选择用户"
              class="rounded-lg"
              size="large"
            >
              <el-option label="选择用户" value="" />
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="user.name || user.email"
                :value="user.id"
              />
            </el-select>
            <el-select
              v-model="newMember.role"
              placeholder="选择角色"
              class="rounded-lg"
              size="large"
            >
              <el-option label="开发工程师" value="developer" />
              <el-option label="测试工程师" value="tester" />
              <el-option label="产品经理" value="product_manager" />
              <el-option label="项目经理" value="project_manager" />
            </el-select>
            <el-button
              @click="addProjectMember"
              :disabled="!newMember.userId || !newMember.role"
              type="primary"
              class="rounded-lg h-11"
            >
              添加
            </el-button>
          </div>
        </div>

        <!-- 成员列表 -->
        <div v-if="project.members.length > 0" class="space-y-4">
          <div
            v-for="member in project.members"
            :key="member.userId"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ member.user.name || "未知用户" }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ member.user.email }}
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <el-select
                  v-model="member.role"
                  @change="updateProjectMember(member)"
                  size="small"
                  class="w-36 rounded-lg"
                  style="width: 100px"
                >
                  <el-option label="开发工程师" value="developer" />
                  <el-option label="测试工程师" value="tester" />
                  <el-option label="产品经理" value="product_manager" />
                  <el-option label="项目经理" value="project_manager" />
                </el-select>
                <el-button
                  @click="removeProjectMember(member.userId)"
                  type="danger"
                  size="small"
                  class="rounded-lg"
                >
                  移除
                </el-button>
              </div>
            </div>
            <div class="text-xs text-gray-400 dark:text-gray-500 mt-2">
              加入时间: {{ formatDate(member.joinedAt) }}
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">暂无成员</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
            使用上方表单添加成员
          </p>
        </div>
      </div>
    </el-drawer>

    <!-- 操作反馈提示条 -->
    <div
      v-if="actionFeedback.show"
      :class="[
        'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4 z-40 transform transition-transform duration-300',
        actionFeedback.show ? 'translate-y-0' : 'translate-y-full',
      ]"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <el-icon
            :class="
              actionFeedback.type === 'success'
                ? 'text-green-500'
                : 'text-red-500'
            "
          >
            <Check v-if="actionFeedback.type === 'success'" />
            <CircleClose v-else />
          </el-icon>
          <span class="text-gray-700 dark:text-gray-300">{{
            actionFeedback.message
          }}</span>
        </div>
        <el-button
          v-if="actionFeedback.undoable"
          link
          @click="handleUndo"
          class="text-primary-600 dark:text-primary-400"
        >
          撤销
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "../utils/api";
import {
  ArrowLeft,
  Edit,
  User,
  Plus,
  CircleClose,
  CirclePlus,
  Check,
} from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();

// 项目ID从路由参数获取
const projectId = route.params.id as string;

// 定义接口
interface ProjectSettings {
  id: string;
  projectId: string;
  workflowConfig: any;
}

interface ProjectMember {
  projectId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Requirement {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: User | null;
  reporter: User;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  key: string;
  settings: any;
  status: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  projectSettings: ProjectSettings | null;
  requirements: Requirement[];
}

interface ActionFeedback {
  show: boolean;
  message: string;
  type: "success" | "error";
  undoable: boolean;
  undoAction: (() => void) | null;
}

// 状态管理
const project = ref<Project>({
  id: "",
  name: "",
  description: "",
  key: "",
  settings: {},
  status: "active",
  createdBy: null,
  createdAt: "",
  updatedAt: "",
  members: [],
  projectSettings: null,
  requirements: [],
});

const users = ref<User[]>([]);
const showMembersDrawer = ref(false);
const newMember = ref({
  userId: "",
  role: "developer",
});

const actionFeedback = ref<ActionFeedback>({
  show: false,
  message: "",
  type: "success",
  undoable: false,
  undoAction: null,
});

// 用于撤销删除的临时存储
const deletedProjectBackup = ref<Project | null>(null);

// 计算属性
const inProgressRequirements = computed(() => {
  return project.value.requirements.filter(
    (req) =>
      req.status === "developing" ||
      req.status === "testing" ||
      req.status === "reviewing",
  ).length;
});

const completedRequirements = computed(() => {
  return project.value.requirements.filter((req) => req.status === "done")
    .length;
});

const overdueRequirements = computed(() => {
  const now = new Date();
  return project.value.requirements.filter(
    (req) =>
      req.dueDate && new Date(req.dueDate) < now && req.status !== "done",
  ).length;
});

const overallProgress = computed(() => {
  if (project.value.requirements.length === 0) return 0;
  const completed = completedRequirements.value;
  return Math.round((completed / project.value.requirements.length) * 100);
});

const requirementStatuses = computed(() => {
  const statuses = [
    { value: "draft", label: "草稿", color: "#909399" },
    { value: "reviewing", label: "评审中", color: "#e6a23c" },
    { value: "approved", label: "已批准", color: "#67c23a" },
    { value: "developing", label: "开发中", color: "#409eff" },
    { value: "testing", label: "测试中", color: "#f56c6c" },
    { value: "done", label: "已完成", color: "#67c23a" },
  ];

  return statuses.map((status) => {
    const count = project.value.requirements.filter(
      (req) => req.status === status.value,
    ).length;
    const percentage =
      project.value.requirements.length > 0
        ? Math.round((count / project.value.requirements.length) * 100)
        : 0;
    return { ...status, count, percentage };
  });
});

// 获取项目状态的类型
const projectStatusType = computed(() => {
  const statusMap: Record<string, any> = {
    active: "success",
    archived: "info",
    completed: "success",
    paused: "warning",
  };
  return statusMap[project.value.status] || "info";
});

// 获取需求状态的类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, any> = {
    draft: "info",
    reviewing: "warning",
    approved: "success",
    developing: "primary",
    testing: "danger",
    done: "success",
  };
  return statusMap[status] || "info";
};

// 获取需求优先级的类型
const getPriorityType = (priority: string) => {
  const priorityMap: Record<string, any> = {
    low: "success",
    medium: "warning",
    high: "danger",
  };
  return priorityMap[priority] || "info";
};

// 获取角色类型
const getRoleType = (role: string) => {
  const roleMap: Record<string, any> = {
    developer: "primary",
    tester: "warning",
    product_manager: "success",
    project_manager: "info",
  };
  return roleMap[role] || "info";
};

// 获取角色标签
const getRoleLabel = (role: string) => {
  const roleMap: Record<string, any> = {
    developer: "开发",
    tester: "测试",
    product_manager: "产品",
    project_manager: "项目经理",
  };
  return roleMap[role] || role;
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 获取项目详情
const fetchProjectDetail = async () => {
  try {
    const response = await axios.get(`/projects/${projectId}`);
    project.value = response.data;
  } catch (err: any) {
    console.error("Error fetching project detail:", err);
    showFeedback("获取项目详情失败", "error");
  }
};

// 获取所有用户
const fetchUsers = async () => {
  try {
    const response = await axios.get("/users");
    users.value = response.data;
  } catch (err: any) {
    console.error("Error fetching users:", err);
    users.value = [];
  }
};

// 显示操作反馈
const showFeedback = (
  message: string,
  type: "success" | "error" = "success",
  undoable = false,
  undoAction: (() => void) | null = null,
) => {
  actionFeedback.value = {
    show: true,
    message,
    type,
    undoable,
    undoAction,
  };

  // 5秒后自动隐藏
  setTimeout(() => {
    actionFeedback.value.show = false;
  }, 5000);
};

// 处理撤销操作
const handleUndo = () => {
  if (actionFeedback.value.undoAction) {
    actionFeedback.value.undoAction();
  }
  actionFeedback.value.show = false;
};

// 成员管理相关函数
const manageMembers = async () => {
  try {
    await fetchUsers();
    showMembersDrawer.value = true;
  } catch (err: any) {
    console.error("Error fetching users:", err);
    showFeedback("获取用户列表失败，请重试", "error");
  }
};

const closeMembersDrawer = () => {
  showMembersDrawer.value = false;
  newMember.value = {
    userId: "",
    role: "developer",
  };
};

const addProjectMember = async () => {
  if (!project.value || !newMember.value.userId || !newMember.value.role)
    return;

  try {
    await axios.post(`/projects/${project.value.id}/members`, newMember.value);
    // 重新获取项目详情以更新成员列表
    await fetchProjectDetail();
    // 重置表单
    newMember.value = {
      userId: "",
      role: "developer",
    };
    showFeedback("成员添加成功", "success");
  } catch (err: any) {
    console.error("Error adding project member:", err);
    // 获取详细错误信息
    const errorMessage =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "添加成员失败，请重试";
    showFeedback(`添加成员失败：${errorMessage}`, "error");
  }
};

const updateProjectMember = async (member: ProjectMember) => {
  if (!project.value) return;

  try {
    await axios.put(`/projects/${project.value.id}/members/${member.userId}`, {
      role: member.role,
    });
    // 重新获取项目详情以更新成员列表
    await fetchProjectDetail();
    showFeedback("成员角色更新成功", "success");
  } catch (err: any) {
    console.error("Error updating project member:", err);
    // 获取详细错误信息
    const errorMessage =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "更新成员角色失败，请重试";
    showFeedback(`更新成员角色失败：${errorMessage}`, "error");
  }
};

const removeProjectMember = async (userId: string) => {
  if (!project.value) return;
  const projectId = project.value.id;

  // 先备份要移除的成员信息，用于撤销操作
  const memberToRemove = project.value.members.find(
    (member) => member.userId === userId,
  );
  if (!memberToRemove) return;

  // 乐观更新UI
  const index = project.value.members.findIndex(
    (member) => member.userId === userId,
  );
  if (index > -1) {
    project.value.members.splice(index, 1);
  }

  try {
    await axios.delete(`/projects/${projectId}/members/${userId}`);

    // 显示反馈和撤销选项
    showFeedback("成员已移除", "success", true, async () => {
      try {
        // 重新添加成员
        await axios.post(`/projects/${projectId}/members`, {
          userId: memberToRemove.userId,
          role: memberToRemove.role,
        });
        // 重新获取项目详情以更新成员列表
        await fetchProjectDetail();
        showFeedback("移除已撤销", "success");
      } catch (err: any) {
        console.error("Error undoing remove:", err);
        showFeedback("撤销移除失败", "error");
        // 恢复UI
        if (index > -1) {
          project.value.members.splice(index, 0, memberToRemove);
        }
      }
    });
  } catch (err: any) {
    console.error("Error removing project member:", err);
    // 获取详细错误信息
    const errorMessage =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "移除成员失败，请重试";
    showFeedback(`移除成员失败：${errorMessage}`, "error");
    // 恢复UI
    if (index > -1) {
      project.value.members.splice(index, 0, memberToRemove);
    }
  }
};

// 页面加载时获取项目详情
onMounted(async () => {
  await fetchProjectDetail();
});
</script>

<style scoped>
.compact-table {
  --el-table-header-bg-color: #fafafa;
  --el-table-border-color: #e5e7eb;
}

/* 响应式设计：在小屏幕上隐藏部分列 */
@media (max-width: 768px) {
  .compact-table .el-table__body-wrapper {
    overflow-x: auto;
  }

  /* 在移动端固定表格最小宽度，确保内容不会被过度压缩 */
  .compact-table .el-table__inner-wrapper {
    min-width: 700px;
  }
}

/* 优化表格行悬停效果 */
.compact-table .el-table__row:hover {
  background-color: rgba(59, 130, 246, 0.03) !important;
}

/* 优化表格单元格内边距 */
.compact-table .el-table__cell {
  padding: 8px 12px !important;
}

/* 确保表格标题行字体加粗 */
.compact-table .el-table__header-wrapper .el-table__header-cell {
  font-weight: 600 !important;
  font-size: 13px !important;
}
</style>
