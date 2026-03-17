<template>
  <div class="space-y-8 p-4">
    <div
      class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300"
    >
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10"
      >
        <div>
          <h2
            class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight"
          >
            项目中心
          </h2>
          <p class="text-sm text-slate-500 mt-1 font-medium">
            管理并跟踪您的所有研发项目
          </p>
        </div>
        <div class="flex items-center gap-3">
          <el-button
            @click="router.push('/project-calendar')"
            class="!rounded-xl px-5 h-11 !font-bold !bg-emerald-50 !text-emerald-700 !border-emerald-100 hover:!bg-emerald-100 transition-all"
          >
            <el-icon class="mr-1.5">
              <Calendar />
            </el-icon>
            挂历视图
          </el-button>
          <el-button
            @click="router.push('/projects/new')"
            type="primary"
            class="!rounded-xl px-6 h-11 !font-bold bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <el-icon class="mr-1.5">
              <Plus />
            </el-icon>
            新建项目
          </el-button>
        </div>
      </div>

      <!-- 项目类型切换选项卡 -->
      <div class="mb-8">
        <el-tabs
          v-model="activeTab"
          @tab-change="handleTabChange"
          type="border-card"
          class="project-tabs"
        >
          <el-tab-pane label="我创建的项目" name="created" />
          <el-tab-pane label="我加入的项目" name="joined" />
        </el-tabs>
      </div>

      <!-- 项目表格 -->
      <div
        v-if="
          (activeTab === 'created' && projects.length > 0) ||
          (activeTab === 'joined' && joinedProjects.length > 0)
        "
        class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <el-table
          :data="activeTab === 'created' ? projects : joinedProjects"
          :row-height="60"
          border
          size="small"
          class="compact-table"
        >
          <el-table-column prop="key" label="项目标识" width="100">
            <template #default="{ row }">
              <el-tag
                effect="plain"
                class="!rounded-lg !border-indigo-100 !text-indigo-500 px-3 font-black text-xs uppercase tracking-wider"
              >
                {{ row.key }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="项目名称" min-width="180">
            <template #default="{ row }">
              <div
                class="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                @click="router.push(`/projects/${row.id}`)"
              >
                {{ row.name }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="项目描述" min-width="220">
            <template #default="{ row }">
              <p
                class="text-sm text-slate-500 line-clamp-2 h-10 leading-relaxed"
              >
                {{ row.description || "该项目暂无详细描述信息" }}
              </p>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="160">
            <template #default="{ row }">
              <span class="text-xs text-slate-500 whitespace-nowrap">{{
                formatDate(row.createdAt)
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="成员" width="140">
            <template #default="{ row }">
              <div class="flex -space-x-2 overflow-hidden">
                <div
                  v-for="(member, idx) in row.members
                    ? row.members.slice(0, 3)
                    : []"
                  :key="idx"
                  class="inline-flex items-center justify-center w-7 h-7 border-2 border-white rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold ring-1 ring-slate-100"
                >
                  {{ member.user?.name?.charAt(0) || "U" }}
                </div>
                <div
                  v-if="row.members && row.members.length > 3"
                  class="inline-flex items-center justify-center w-7 h-7 border-2 border-white rounded-full bg-indigo-600 text-white text-[10px] font-bold"
                >
                  +{{ row.members.length - 3 }}
                </div>
                <div
                  v-if="!row.members || row.members.length === 0"
                  class="inline-flex items-center justify-center w-7 h-7 border-2 border-dashed border-slate-200 rounded-full text-slate-300"
                >
                  <el-icon size="14">
                    <User />
                  </el-icon>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <el-button
                  @click="router.push(`/projects/${row.id}`)"
                  size="small"
                  type="primary"
                  plain
                  class="!rounded-lg !h-8 !text-xs !font-medium"
                >
                  查看
                </el-button>
                <el-button
                  @click="manageMembers(row)"
                  size="small"
                  class="!rounded-lg !h-8 !text-xs !font-medium !bg-slate-50 !border-slate-100 !text-slate-600 hover:!bg-indigo-50 hover:!text-indigo-600 transition-all"
                >
                  成员
                </el-button>
                <el-button
                  @click="router.push(`/projects/${row.id}/edit`)"
                  size="small"
                  plain
                  class="!rounded-lg !h-8 !text-xs !font-medium"
                >
                  编辑
                </el-button>
                <el-button
                  @click="deleteProject(row.id)"
                  size="small"
                  type="danger"
                  plain
                  class="!rounded-lg !h-8 !text-xs !font-medium"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-else class="text-center py-24">
        <el-empty
          :description="
            activeTab === 'created' ? '暂无创建的项目' : '暂无加入的项目'
          "
          :image-size="220"
        >
          <template #extra>
            <el-button
              v-if="activeTab === 'created'"
              type="primary"
              @click="router.push('/projects/new')"
              plain
              class="!rounded-2xl px-10 !h-12 !font-bold"
            >
              立即启动项目
            </el-button>
          </template>
        </el-empty>
      </div>
    </div>

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
          <h3 class="text-xl font-bold text-gray-900">
            成员管理 - {{ selectedProject?.name }}
          </h3>
          <el-button
            @click="closeMembersDrawer"
            size="small"
            text
            :icon="CircleClose"
            class="text-gray-500 hover:text-gray-700"
          />
        </div>

        <!-- 添加成员表单 -->
        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
          <h4
            class="text-sm font-black text-slate-800 uppercase tracking-wider mb-4"
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
        <div
          v-if="selectedProject?.members && selectedProject.members.length > 0"
          class="space-y-4"
        >
          <div
            v-for="member in selectedProject.members"
            :key="member.userId"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-gray-900">
                  {{ member.user.name || "未知用户" }}
                </div>
                <div class="text-sm text-gray-500">{{ member.user.email }}</div>
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
            <div class="text-xs text-gray-400 mt-2">
              加入时间: {{ formatDate(member.joinedAt) }}
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <p class="text-gray-500">暂无成员</p>
          <p class="text-sm text-gray-400 mt-2">使用上方表单添加成员</p>
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "../utils/api";
import {
  CircleClose,
  Check,
  Plus,
  Calendar,
  Edit,
  Delete,
  User,
  ArrowRight,
} from "@element-plus/icons-vue";

const router = useRouter();

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

interface Project {
  id: string;
  name: string;
  description: string | null;
  key: string;
  projectSettings: ProjectSettings | null;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

interface ActionFeedback {
  show: boolean;
  message: string;
  type: "success" | "error";
  undoable: boolean;
  undoAction: (() => void) | null;
}

const activeTab = ref("created");
const projects = ref<Project[]>([]);
const joinedProjects = ref<Project[]>([]);
const users = ref<User[]>([]);
const showMembersDrawer = ref(false);
const selectedProject = ref<Project | null>(null);
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

const fetchProjects = async () => {
  try {
    const response = await axios.get("/projects");
    projects.value = response.data;
  } catch (err: any) {
    console.error("Error fetching projects:", err);
    projects.value = [];
    showFeedback("获取项目列表失败", "error");
  }
};

const fetchJoinedProjects = async () => {
  try {
    // 获取当前用户信息
    const userStr = localStorage.getItem("user");
    const currentUser = userStr ? JSON.parse(userStr) : null;

    if (!currentUser) {
      showFeedback("请先登录", "error");
      return;
    }

    const response = await axios.get(`/users/${currentUser.id}/projects`);
    joinedProjects.value = response.data;
  } catch (err: any) {
    console.error("Error fetching joined projects:", err);
    joinedProjects.value = [];
    showFeedback("获取已加入项目列表失败", "error");
  }
};

const handleTabChange = () => {
  if (activeTab.value === "joined") {
    fetchJoinedProjects();
  } else {
    fetchProjects();
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

const deleteProject = async (id: string) => {
  // 先备份要删除的项目，用于撤销操作
  const projectToDelete = projects.value.find((project) => project.id === id);
  if (!projectToDelete) return;

  // 乐观更新UI
  const index = projects.value.findIndex((project) => project.id === id);
  if (index > -1) {
    projects.value.splice(index, 1);
  }

  try {
    await axios.delete(`/projects/${id}`);

    // 显示反馈和撤销选项
    showFeedback("项目已删除", "success", true, async () => {
      try {
        // 重新创建项目
        await axios.post("/projects", projectToDelete);
        await fetchProjects();
        showFeedback("删除已撤销", "success");
      } catch (err: any) {
        console.error("Error undoing delete:", err);
        showFeedback("撤销删除失败", "error");
        // 恢复UI
        if (index > -1) {
          projects.value.splice(index, 0, projectToDelete);
        }
      }
    });
  } catch (err: any) {
    console.error("Error deleting project:", err);
    // 获取详细错误信息
    const errorMessage =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "删除项目失败，请重试";
    showFeedback(`删除项目失败：${errorMessage}`, "error");
    // 恢复UI
    if (index > -1) {
      projects.value.splice(index, 0, projectToDelete);
    }
  }
};

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

// 用户相关函数
const fetchUsers = async () => {
  try {
    const response = await axios.get("/users");
    users.value = response.data;
  } catch (err: any) {
    console.error("Error fetching users:", err);
    users.value = [];
  }
};

// 成员管理相关函数
const manageMembers = async (project: Project) => {
  try {
    // 获取完整的项目数据，包括成员信息
    const response = await axios.get(`/projects/${project.id}`);
    selectedProject.value = response.data;
    showMembersDrawer.value = true;
    await fetchUsers();
  } catch (err: any) {
    console.error("Error fetching project members:", err);
    showFeedback("获取成员信息失败，请重试", "error");
  }
};

const closeMembersDrawer = () => {
  showMembersDrawer.value = false;
  selectedProject.value = null;
  newMember.value = {
    userId: "",
    role: "developer",
  };
};

const addProjectMember = async () => {
  if (
    !selectedProject.value ||
    !newMember.value.userId ||
    !newMember.value.role
  )
    return;

  try {
    await axios.post(
      `/projects/${selectedProject.value.id}/members`,
      newMember.value,
    );
    // 重新获取项目详情以更新成员列表
    const response = await axios.get(`/projects/${selectedProject.value.id}`);
    selectedProject.value = response.data;
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
  if (!selectedProject.value) return;

  try {
    await axios.put(
      `/projects/${selectedProject.value.id}/members/${member.userId}`,
      { role: member.role },
    );
    // 重新获取项目详情以更新成员列表
    const response = await axios.get(`/projects/${selectedProject.value.id}`);
    selectedProject.value = response.data;
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
  if (!selectedProject.value) return;
  const projectId = selectedProject.value.id;

  // 先备份要移除的成员信息，用于撤销操作
  const memberToRemove = selectedProject.value.members.find(
    (member) => member.userId === userId,
  );
  if (!memberToRemove) return;

  // 乐观更新UI
  const index = selectedProject.value.members.findIndex(
    (member) => member.userId === userId,
  );
  if (index > -1) {
    selectedProject.value.members.splice(index, 1);
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
        const response = await axios.get(`/projects/${projectId}`);
        if (selectedProject.value && selectedProject.value.id === projectId) {
          selectedProject.value = response.data;
        }
        showFeedback("移除已撤销", "success");
      } catch (err: any) {
        console.error("Error undoing remove:", err);
        showFeedback("撤销移除失败", "error");
        // 恢复UI
        if (index > -1 && selectedProject.value) {
          selectedProject.value.members.splice(index, 0, memberToRemove);
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
    if (index > -1 && selectedProject.value) {
      selectedProject.value.members.splice(index, 0, memberToRemove);
    }
  }
};

onMounted(async () => {
  if (activeTab.value === "created") {
    await fetchProjects();
  } else {
    await fetchJoinedProjects();
  }
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
