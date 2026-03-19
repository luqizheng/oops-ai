<template>
  <div class="project-management">
    <el-card shadow="never" class="search-card">
      <el-form inline @submit.prevent>
        <el-form-item label="关键词搜索">
          <el-input v-model="searchQuery" placeholder="搜索项目名称或描述" clearable class="search-input" @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态筛选">
          <el-select v-model="statusFilter" placeholder="选择状态" clearable @change="handleFilterChange">
            <el-option label="全部" value="" />
            <el-option label="进行中" value="active" />
            <el-option label="已暂停" value="paused" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon>
              <Refresh />
            </el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <div class="table-header">
        <div class="header-left">
          <h3>项目列表</h3>
          <el-tag type="info" effect="plain"> 共 {{ total }} 个项目 </el-tag>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleAdd">
            <el-icon>
              <Plus />
            </el-icon>
            创建项目
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="projects" stripe border class="project-table">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="key" label="项目标识" width="100">
          <template #default="{ row }">
            <el-tag type="primary" effect="plain" class="project-key">
              {{ row.key }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="项目名称" min-width="180" sortable>
          <template #default="{ row }">
            <div class="project-name" @click="handleView(row)">
              <el-icon class="project-icon">
                <FolderOpened />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="项目描述" min-width="200">
          <template #default="{ row }">
            <div class="project-description">
              {{ row.description || "暂无描述" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="light" round>
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" sortable>
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="成员" width="120">
          <template #default="{ row }">
            <div class="members-preview">
              <template v-if="row.members && row.members.length > 0">
                <el-avatar v-for="(member, idx) in row.members.slice(0, 3)" :key="idx" :size="28" class="member-avatar">
                  {{ member.user?.name?.charAt(0) || "U" }}
                </el-avatar>
                <el-tag v-if="row.members.length > 3" type="info" size="small" class="more-members">
                  +{{ row.members.length - 3 }}
                </el-tag>
              </template>
              <span v-else class="no-members">暂无成员</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleView(row)">
              查看
            </el-button>
            <el-button type="success" size="small" link @click="handleManageMembers(row)">
              成员
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
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'add' ? '创建项目' : '编辑项目'" width="600px"
      @close="handleDialogClose">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入项目名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="项目标识" prop="key">
          <el-input v-model="formData.key" placeholder="请输入项目标识（如：PROJ）" maxlength="20" show-word-limit
            :disabled="dialogMode === 'edit'" />
          <div class="form-tip">
            项目标识用于在系统中唯一标识项目，建议使用简短的英文缩写
          </div>
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入项目描述" maxlength="500"
            show-word-limit />
        </el-form-item>
        <el-form-item v-if="dialogMode === 'edit'" label="项目状态" prop="status">
          <el-select v-model="formData.status" placeholder="选择项目状态" style="width: 100%">
            <el-option label="进行中" value="active" />
            <el-option label="已暂停" value="paused" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="400px">
      <div class="delete-confirm">
        <el-icon color="#f56c6c" size="48">
          <WarningFilled />
        </el-icon>
        <p>
          确定要删除项目 <strong>{{ currentProject?.name }}</strong> 吗？
        </p>
        <p class="warning-text">
          此操作将删除项目及其所有相关数据，且不可恢复。
        </p>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="deleteLoading" @click="confirmDelete">
          删除
        </el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="membersDrawerVisible" :title="`成员管理 - ${currentProject?.name}`" size="500px">
      <div class="members-management">
        <div class="add-member">
          <el-select v-model="newMemberId" placeholder="选择用户" filterable style="flex: 1">
            <el-option v-for="user in availableUsers" :key="user.id" :label="`${user.name || '未命名'} (${user.email})`"
              :value="user.id" />
          </el-select>
          <el-select v-model="newMemberRole" placeholder="选择角色" style="width: 120px">
            <el-option label="管理员" value="admin" />
            <el-option label="开发者" value="developer" />
            <el-option label="观察者" value="viewer" />
          </el-select>
          <el-button type="primary" @click="handleAddMember"> 添加 </el-button>
        </div>

        <el-divider />

        <div class="members-list">
          <h4>项目成员 ({{ currentProjectMembers.length }})</h4>
          <el-empty v-if="currentProjectMembers.length === 0" description="暂无成员" />
          <div v-for="member in currentProjectMembers" v-else :key="member.userId + '-' + member.projectId"
            class="member-item">
            <div class="member-info">
              <el-avatar :size="40">
                {{ member.user?.name?.charAt(0) || "U" }}
              </el-avatar>
              <div class="member-details">
                <span class="member-name">{{
                  member.user?.name || "未命名用户"
                }}</span>
                <span class="member-email">{{ member.user?.email }}</span>
              </div>
            </div>
            <div class="member-actions">
              <el-select v-model="member.role" size="small" style="width: 100px"
                @change="handleUpdateMemberRole(member)">
                <el-option label="管理员" value="admin" />
                <el-option label="开发者" value="developer" />
                <el-option label="观察者" value="viewer" />
              </el-select>
              <el-button type="danger" size="small" link @click="handleRemoveMember(member)">
                移除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  getAllUsers
} from "@/api/system/project";
import type {
  ProjectListItem,
  ProjectMemberListItem,
  CreateProjectSubmit,
  UpdateProjectSubmit,
  UserListItem
} from "@oops-ai/shared";
import {
  Search,
  Refresh,
  Plus,
  WarningFilled,
  FolderOpened
} from "@element-plus/icons-vue";

const router = useRouter();
const loading = ref(false);
const submitLoading = ref(false);
const deleteLoading = ref(false);
const projects = ref<ProjectListItem[]>([]);
const searchQuery = ref("");
const statusFilter = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const dialogVisible = ref(false);
const dialogMode = ref<"add" | "edit">("add");
const currentProject = ref<ProjectListItem | null>(null);
const deleteDialogVisible = ref(false);

const membersDrawerVisible = ref(false);
const currentProjectMembers = ref<ProjectMemberListItem[]>([]);
const newMemberId = ref("");
const newMemberRole = ref("developer");
const allUsers = ref<UserListItem[]>([]);

const formRef = ref<FormInstance>();

interface CreateProjectForm {
  name: string;
  key: string;
  description: string;
  status?: string;
}

interface UpdateProjectForm {
  name?: string;
  key?: string;
  description?: string;
  status?: string;
}

const createFormData = (): CreateProjectForm => ({
  name: "",
  key: "",
  description: "",
  status: "active"
});

const updateFormData = (): UpdateProjectForm => ({
  name: "",
  description: "",
  status: "active"
});

const formData = ref<CreateProjectForm>(createFormData());

const formRules: FormRules = {
  name: [
    { required: true, message: "请输入项目名称", trigger: "blur" },
    {
      min: 2,
      max: 100,
      message: "项目名称长度在 2 到 100 个字符",
      trigger: "blur"
    }
  ],
  key: [
    { required: true, message: "请输入项目标识", trigger: "blur" },
    {
      min: 2,
      max: 20,
      message: "项目标识长度在 2 到 20 个字符",
      trigger: "blur"
    },
    {
      pattern: /^[A-Z]+$/,
      message: "项目标识只能包含大写字母",
      trigger: "blur"
    }
  ],
  description: [
    { max: 500, message: "描述不能超过 500 个字符", trigger: "blur" }
  ]
};

const availableUsers = computed(() => {
  const memberUserIds = currentProjectMembers.value.map(m => m.userId);
  return allUsers.value.filter(user => !memberUserIds.includes(user.id));
});

const loadAllUsers = async () => {
  try {
    const res = await getAllUsers();
    allUsers.value = res.data;
  } catch (error: any) {
    console.error("加载用户列表失败", error);
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const projectsRes = await getProjects({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value || undefined
    });
    projects.value = projectsRes.data;
    total.value = projectsRes.total;
  } catch (error: any) {
    ElMessage.error(error.message || "加载数据失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadData();
};

const handleFilterChange = () => {
  currentPage.value = 1;
  loadData();
};

const handleReset = () => {
  searchQuery.value = "";
  statusFilter.value = "";
  currentPage.value = 1;
  loadData();
};

const handleSizeChange = () => {
  currentPage.value = 1;
  loadData();
};

const handleCurrentChange = () => {
  loadData();
};

const handleAdd = () => {
  dialogMode.value = "add";
  formData.value = createFormData();
  dialogVisible.value = true;
};

const handleEdit = (project: ProjectListItem) => {
  dialogMode.value = "edit";
  currentProject.value = project;
  formData.value = {
    name: project.name,
    description: project.description || "",
    status: project.status
  };
  dialogVisible.value = true;
};

const handleView = (project: ProjectListItem) => {
  router.push(`/system/project/${project.id}`);
};

const handleDelete = (project: ProjectListItem) => {
  currentProject.value = project;
  deleteDialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (dialogMode.value === "add") {
          await createProject(formData.value as CreateProjectSubmit);
          ElMessage.success("项目创建成功");
        } else {
          if (!currentProject.value) return;
          await updateProject(
            currentProject.value.id,
            formData.value as UpdateProjectSubmit
          );
          ElMessage.success("项目更新成功");
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

const confirmDelete = async () => {
  if (!currentProject.value) return;

  deleteLoading.value = true;
  try {
    await deleteProject(currentProject.value.id);
    ElMessage.success("项目删除成功");
    deleteDialogVisible.value = false;
    await loadData();
  } catch (error: any) {
    ElMessage.error(error.message || "删除失败");
  } finally {
    deleteLoading.value = false;
  }
};

const handleDialogClose = () => {
  formRef.value?.resetFields();
};

const handleManageMembers = async (project: ProjectListItem) => {
  currentProject.value = project;
  membersDrawerVisible.value = true;
  await Promise.all([loadProjectMembers(project.id), loadAllUsers()]);
};

const loadProjectMembers = async (projectId: string) => {
  try {
    const res = await getProjectMembers(projectId);
    currentProjectMembers.value = res.data;
  } catch (error: any) {
    ElMessage.error(error.message || "加载成员失败");
  }
};

const handleAddMember = async () => {
  if (!currentProject.value || !newMemberId.value) {
    ElMessage.warning("请选择用户");
    return;
  }

  try {
    await addProjectMember(currentProject.value.id, {
      userId: newMemberId.value,
      role: newMemberRole.value
    });
    ElMessage.success("添加成员成功");
    newMemberId.value = "";
    newMemberRole.value = "developer";
    await loadProjectMembers(currentProject.value.id);
  } catch (error: any) {
    ElMessage.error(error.message || "添加成员失败");
  }
};

const handleUpdateMemberRole = async (member: ProjectMemberListItem) => {
  if (!currentProject.value) return;

  try {
    ElMessage.success("成员角色已更新");
  } catch (error: any) {
    ElMessage.error(error.message || "更新角色失败");
  }
};

const handleRemoveMember = async (member: ProjectMemberListItem) => {
  if (!currentProject.value) return;

  try {
    await removeProjectMember(currentProject.value.id, member.userId);
    ElMessage.success("成员已移除");
    await loadProjectMembers(currentProject.value.id);
  } catch (error: any) {
    ElMessage.error(error.message || "移除成员失败");
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("zh-CN");
};

const getStatusType = (status?: string) => {
  const typeMap: Record<string, any> = {
    active: "success",
    paused: "warning",
    completed: "info"
  };
  return typeMap[status || "active"] || "info";
};

const getStatusText = (status?: string) => {
  const textMap: Record<string, string> = {
    active: "进行中",
    paused: "已暂停",
    completed: "已完成"
  };
  return textMap[status || "active"] || "未知";
};

onMounted(() => {
  loadData();
});

defineOptions({
  name: "ProjectManagement"
});
</script>

<style scoped lang="scss">
.project-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 0;
  }
}

.search-input {
  width: 280px;
}

.table-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.project-table {
  :deep(.el-table__header) {
    th {
      background-color: var(--el-fill-color-light);
      color: var(--el-text-color-primary);
      font-weight: 600;
    }
  }
}

.project-key {
  font-family: monospace;
  font-weight: 600;
  letter-spacing: 1px;
}

.project-name {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--el-color-primary);
  font-weight: 500;

  .project-icon {
    font-size: 18px;
  }

  &:hover {
    text-decoration: underline;
  }
}

.project-description {
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.members-preview {
  display: flex;
  align-items: center;
  gap: 4px;

  .member-avatar {
    border: 2px solid white;
    margin-left: -8px;

    &:first-child {
      margin-left: 0;
    }
  }

  .more-members {
    margin-left: 4px;
  }

  .no-members {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.delete-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;

  p {
    margin: 16px 0 0;
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  .warning-text {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.members-management {
  .add-member {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
  }

  .members-list {
    padding: 16px;

    h4 {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: var(--el-text-color-primary);
    }

    .member-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .member-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .member-details {
          display: flex;
          flex-direction: column;
          gap: 2px;

          .member-name {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .member-email {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }

      .member-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }
}

@media (max-width: 768px) {
  .search-card {
    :deep(.el-form) {
      display: flex;
      flex-direction: column;
    }

    :deep(.el-form-item) {
      margin-bottom: 12px;
    }

    .search-input {
      width: 100%;
    }
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .project-table {
    :deep(.el-table) {
      overflow-x: auto;

      &::before {
        display: none;
      }
    }
  }

  .members-management {
    .add-member {
      flex-direction: column;
    }
  }
}
</style>
