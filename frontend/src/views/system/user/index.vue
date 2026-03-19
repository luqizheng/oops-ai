<template>
  <div class="user-management">
    <el-card shadow="never" class="search-card">
      <el-form inline @submit.prevent>
        <el-form-item label="关键词搜索">
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户名或邮箱"
            clearable
            class="search-input"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="角色筛选">
          <el-select
            v-model="roleFilter"
            placeholder="选择角色"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
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
          <h3>用户列表</h3>
          <el-tag type="info" effect="plain"> 共 {{ total }} 个用户 </el-tag>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleAdd">
            <el-icon>
              <Plus />
            </el-icon>
            添加用户
          </el-button>
        </div>
      </div>
      {{ users }}eeeeeeeeeeeeeeeeeeeeeeeee
      <el-table
        v-loading="loading"
        :data="users"
        stripe
        border
        class="user-table"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="用户名" min-width="120" sortable>
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="36" class="user-avatar">
                {{ row.name?.charAt(0) || "U" }}
              </el-avatar>
              <div class="user-details">
                <span class="user-name">{{ row.name || "未命名用户" }}</span>
                <span class="user-id">ID: {{ row.id.slice(0, 8) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" sortable />
        <el-table-column prop="role.name" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role.name)" effect="light" round>
              {{ row.role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
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
      :title="dialogMode === 'add' ? '添加用户' : '编辑用户'"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入用户名"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            type="email"
          />
        </el-form-item>
        <el-form-item
          label="密码"
          :prop="dialogMode === 'add' ? 'password' : ''"
        >
          <el-input
            v-model="formData.password"
            :placeholder="
              dialogMode === 'add'
                ? '请输入密码（至少6位）'
                : '留空则不修改密码'
            "
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select
            v-model="formData.roleId"
            placeholder="选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
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

    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="400px">
      <div class="delete-confirm">
        <el-icon color="#f56c6c" size="48">
          <WarningFilled />
        </el-icon>
        <p>
          确定要删除用户 <strong>{{ currentUser?.name }}</strong> 吗？
        </p>
        <p class="warning-text">此操作不可恢复，请谨慎操作。</p>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button
          type="danger"
          :loading="deleteLoading"
          @click="confirmDelete"
        >
          删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

defineOptions({
  name: "UserManagement"
});
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  deleteUser
} from "@/api/system/user";
import {
  UserListItem,
  RoleListItem,
  CreateUserSubmit,
  UpdateUserSubmit
} from "@oops-ai/shared";
import { Search, Refresh, Plus, WarningFilled } from "@element-plus/icons-vue";

const loading = ref(false);
const submitLoading = ref(false);
const deleteLoading = ref(false);
const users = ref<UserListItem[]>([]);
const roles = ref<RoleListItem[]>([]);
const searchQuery = ref("");
const roleFilter = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const dialogVisible = ref(false);
const dialogMode = ref<"add" | "edit">("add");
const currentUser = ref<UserListItem | null>(null);
const deleteDialogVisible = ref(false);

const formRef = ref<FormInstance>();
const formData = ref<CreateUserSubmit | UpdateUserSubmit>({
  name: "",
  email: "",
  password: "",
  roleId: ""
});

const formRules: FormRules = {
  name: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 50, message: "用户名长度在 2 到 50 个字符", trigger: "blur" }
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少为 6 个字符", trigger: "blur" }
  ],
  roleId: [{ required: true, message: "请选择角色", trigger: "change" }]
};

const loadData = async () => {
  loading.value = true;

  try {
    const [usersRes, rolesRes] = await Promise.all([
      getUsers({
        page: currentPage.value,
        pageSize: pageSize.value,
        search: searchQuery.value || undefined
      }),
      getRoles()
    ]);

    users.value = usersRes.data;
    total.value = usersRes.total;
    roles.value = rolesRes;
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
  roleFilter.value = "";
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
  formData.value = {
    name: "",
    email: "",
    password: "",
    roleId: ""
  };
  dialogVisible.value = true;
};

const handleEdit = (user: User) => {
  dialogMode.value = "edit";
  currentUser.value = user;
  formData.value = {
    name: user.name || "",
    email: user.email,
    password: "",
    roleId: user.roleId
  };
  dialogVisible.value = true;
};

const handleDelete = (user: UserListItem) => {
  currentUser.value = user;
  deleteDialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (dialogMode.value === "add") {
          await createUser(formData.value as CreateUserDto);
          ElMessage.success("用户添加成功");
        } else {
          if (!currentUser.value) return;
          const updateData: UpdateUserDto = {
            name: formData.value.name,
            email: formData.value.email,
            roleId: formData.value.roleId
          };
          if (formData.value.password) {
            updateData.password = formData.value.password;
          }
          await updateUser(
            currentUser.value.id,
            updateData as UpdateUserSubmit
          );
          ElMessage.success("用户更新成功");
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
  if (!currentUser.value) return;

  deleteLoading.value = true;
  try {
    await deleteUser(currentUser.value.id);
    ElMessage.success("用户删除成功");
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("zh-CN");
};

const getRoleType = (roleName: string) => {
  const typeMap: Record<string, any> = {
    管理员: "danger",
    超级管理员: "danger",
    普通用户: "primary",
    用户: "info"
  };
  return typeMap[roleName] || "info";
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.user-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 0;
  }
}

.search-input {
  width: 250px;
}

.table-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);

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

.user-table {
  :deep(.el-table__header) {
    th {
      font-weight: 600;
      color: var(--el-text-color-primary);
      background-color: var(--el-fill-color-light);
    }
  }
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-avatar {
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .user-name {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .user-id {
    font-size: 12px;
    color: var(--el-text-color-secondary);
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
  padding: 20px 0;
  text-align: center;

  p {
    margin: 16px 0 0;
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  .warning-text {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

@media (width <= 768px) {
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
    gap: 12px;
    align-items: flex-start;
  }

  .user-table {
    :deep(.el-table) {
      overflow-x: auto;

      &::before {
        display: none;
      }
    }
  }
}
</style>
