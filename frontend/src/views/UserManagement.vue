<template>
  <div class="space-y-8 p-4">
    <!-- 页面标题和操作按钮 -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
    >
      <div
        class="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0"
      >
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            用户管理
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            管理系统用户账号
          </p>
        </div>
        <el-button
          type="primary"
          :icon="Plus"
          @click="router.push('/users/new')"
          class="rounded-xl px-6 bg-gradient-to-r from-indigo-500 to-purple-500 border-none shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          添加新用户
        </el-button>
      </div>
    </div>

    <!-- 搜索框 -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
    >
      <div class="max-w-md">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名或邮箱..."
          :prefix-icon="Search"
          clearable
          class="rounded-full shadow-inner"
          size="large"
        />
      </div>
    </div>

    <!-- 用户卡片列表 -->
    <div
      v-if="filteredUsers.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <div
              class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center mr-4 shadow-sm"
            >
              <span
                class="text-lg font-bold text-indigo-700 dark:text-indigo-300"
                >{{ user.name?.charAt(0) || "U" }}</span
              >
            </div>
            <div>
              <h3 class="font-semibold text-lg text-gray-900">
                {{ user.name || "未命名用户" }}
              </h3>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
            </div>
          </div>
          <el-tag
            :type="user.role.name === '管理员' ? 'danger' : 'primary'"
            size="small"
            effect="light"
            class="rounded-full px-3"
          >
            {{ user.role.name }}
          </el-tag>
        </div>

        <div class="flex justify-between items-center text-sm text-gray-500">
          <span>创建时间: {{ formatDate(user.createdAt) }}</span>
          <div class="flex space-x-2">
            <el-button
              type="primary"
              size="small"
              :icon="Edit"
              @click.stop="router.push(`/users/${user.id}/edit`)"
              class="rounded-lg hover:bg-opacity-90 transition-all"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click.stop="deleteUser(user.id)"
              class="rounded-lg"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-else
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
    >
      <el-empty description="暂无用户数据" />
    </div>

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
import { useRouter } from "vue-router";
import axios from "../utils/api";
import { ElButton, ElInput, ElEmpty, ElTag } from "element-plus";
import {
  Plus,
  Edit,
  Delete,
  Search,
  CircleClose,
  Check,
} from "@element-plus/icons-vue";

const router = useRouter();

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  roleId: string;
  role: { name: string };
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

const users = ref<User[]>([]);
const roles = ref<Role[]>([]);
const searchQuery = ref("");
const loading = ref(false);

const actionFeedback = ref<ActionFeedback>({
  show: false,
  message: "",
  type: "success",
  undoable: false,
  undoAction: null,
});

// 用于撤销删除的临时存储
const deletedUserBackup = ref<User | null>(null);

// 搜索过滤
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(
    (user) =>
      user.name?.toLowerCase().includes(query) ||
      false ||
      user.email.toLowerCase().includes(query),
  );
});

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

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await axios.get("/users");
    users.value = response.data;
  } catch (err: any) {
    console.error("Error fetching users:", err);
    users.value = [];
    showFeedback("获取用户列表失败", "error");
  } finally {
    loading.value = false;
  }
};

const fetchRoles = async () => {
  try {
    const response = await axios.get("/roles");
    roles.value = response.data;
  } catch (err: any) {
    console.error("Error fetching roles:", err);
    roles.value = [];
    showFeedback("获取角色列表失败", "error");
  }
};

const deleteUser = async (id: string) => {
  // 先备份要删除的用户，用于撤销操作
  const userToDelete = users.value.find((user) => user.id === id);
  if (!userToDelete) return;

  // 乐观更新UI
  const index = users.value.findIndex((user) => user.id === id);
  if (index > -1) {
    users.value.splice(index, 1);
  }

  try {
    await axios.delete(`/users/${id}`);

    // 显示反馈和撤销选项
    showFeedback("用户已删除", "success", true, async () => {
      try {
        // 重新创建用户
        await axios.post("/users", {
          name: userToDelete.name,
          email: userToDelete.email,
          password: "tempPassword123", // 使用临时密码，用户需要重置
          roleId: userToDelete.roleId,
        });
        await fetchUsers();
        showFeedback("删除已撤销", "success");
      } catch (err: any) {
        console.error("Error undoing delete:", err);
        showFeedback("撤销删除失败", "error");
        // 恢复UI
        if (index > -1) {
          users.value.splice(index, 0, userToDelete);
        }
      }
    });
  } catch (err: any) {
    console.error("Error deleting user:", err);
    // 获取详细错误信息
    const errorMessage =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "删除用户失败，请重试";
    showFeedback(`删除用户失败：${errorMessage}`, "error");
    // 恢复UI
    if (index > -1) {
      users.value.splice(index, 0, userToDelete);
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

onMounted(async () => {
  await fetchRoles();
  await fetchUsers();
});
</script>
