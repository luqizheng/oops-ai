<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 对于不需要认证的页面（登录、注册），直接渲染内容 -->
    <router-view v-if="!requiresAuth" />

    <!-- 对于需要认证的页面，渲染完整的后台布局 -->
    <div v-else class="flex flex-col">
      <!-- 移动端侧边栏触发器 -->
      <el-button v-if="!isSidebarOpen && !isDesktop" @click="toggleSidebar" class="fixed top-4 left-4 z-50" size="small"
        type="primary" circle :icon="Menu" />

      <!-- 侧边栏导航 -->
      <el-aside :class="[
        'fixed inset-y-0 left-0 z-40 w-56 bg-gradient-to-b from-slate-900 to-indigo-950 shadow-2xl transform transition-transform duration-300 ease-out border-r border-slate-800/50',
        isSidebarOpen || isDesktop ? 'translate-x-0' : '-translate-x-full',
      ]">
        <!-- 侧边栏头部 -->
        <div
          class="flex items-center justify-between h-16 px-6 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div class="flex items-center space-x-3">
            <div
              class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span class="text-white font-bold text-lg leading-none">AI</span>
            </div>
            <div class="flex flex-col">
              <h1 class="text-lg font-bold tracking-wide text-white">
                OOPS-AI
              </h1>
              <span class="text-[10px] text-indigo-300/80 uppercase font-semibold tracking-wider">需求智能体</span>
            </div>
          </div>
          <el-button v-if="!isDesktop" @click="toggleSidebar" size="small" text :icon="CircleClose"
            class="text-slate-400 hover:text-white" />
        </div>

        <!-- 导航菜单 -->
        <el-menu :default-active="$route.path" router
          class="custom-sidebar-menu h-[calc(100%-4rem)] overflow-y-auto border-none pt-4 pb-6 px-3 bg-transparent flex flex-col gap-1"
          background-color="transparent" text-color="#94a3b8" active-text-color="#ffffff">
          <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path"
            class="rounded-lg mb-1 relative overflow-hidden transition-all duration-200 hover:bg-white/5" :class="{
              'bg-indigo-600/10 text-white font-medium':
                $route.path === item.path,
            }" @click="!isDesktop && toggleSidebar">
            <!-- 左侧激活指示条 -->
            <div v-if="$route.path === item.path"
              class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]">
            </div>
            <el-icon class="mr-3 text-lg opacity-80" :class="{
              'text-indigo-400 opacity-100': $route.path === item.path,
            }">
              <DocumentCopy />
            </el-icon>
            <template #title><span>{{ item.label }}</span></template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <div :class="[
        'flex-1 transition-all duration-300',
        isDesktop ? 'ml-56' : 'ml-0',
      ]">
        <!-- 顶部导航栏 -->
        <el-header
          class="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/80 dark:border-gray-800 h-16 transition-all duration-200">
          <div class="h-full pl-6 md:pl-8 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ currentPageTitle }}
              </h2>
            </div>
            <div class="flex items-center space-x-4">
              <!-- 通知图标 -->
              <el-button link :icon="Bell" circle class="text-gray-600 dark:text-gray-300" />
              <!-- 用户菜单 -->
              <el-dropdown @command="handleDropdownCommand">
                <span class="el-dropdown-link cursor-pointer outline-none hover:opacity-80 transition-opacity">
                  <div
                    class="flex items-center space-x-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 py-1.5 px-3 rounded-full transition-colors">
                    <div
                      class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {{ userInitials }}
                    </div>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">{{ userName
                    }}</span>
                    <el-icon class="el-icon--right text-gray-500 dark:text-gray-400">
                      <ArrowDown />
                    </el-icon>
                  </div>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="changePassword"
                      class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <el-icon>
                        <Lock />
                      </el-icon>
                      更改密码
                    </el-dropdown-item>
                    <el-dropdown-item command="logout" class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <el-icon>
                        <SwitchButton />
                      </el-icon>
                      退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <!-- 页面内容 -->
        <el-main class="p-20 md:pl-10 md:pr-8 pb-20">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </div>
    </div>

    <!-- 更改密码侧边抽屉 -->
    <el-drawer v-model="showChangePasswordDrawer" title="更改密码" size="480px" direction="rtl" :with-header="false">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            更改密码
          </h3>
          <el-button @click="showChangePasswordDrawer = false" size="small" text :icon="CircleClose"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
        </div>
        <el-form :model="changePasswordForm" label-width="80px">
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input type="password" v-model="changePasswordForm.currentPassword" placeholder="请输入当前密码" show-password
              class="rounded-lg" />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input type="password" v-model="changePasswordForm.newPassword" placeholder="请输入新密码（至少6位）" minlength="6"
              show-password class="rounded-lg" />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input type="password" v-model="changePasswordForm.confirmPassword" placeholder="请再次输入新密码" minlength="6"
              show-password class="rounded-lg" />
          </el-form-item>
        </el-form>

        <!-- 错误提示 -->
        <el-alert v-if="changePasswordError" :title="changePasswordError" type="error" show-icon
          class="mt-4 rounded-lg" />
        <!-- 成功提示 -->
        <el-alert v-if="changePasswordSuccess" :title="changePasswordSuccess" type="success" show-icon
          class="mt-4 rounded-lg" />

        <div class="flex justify-end space-x-3 mt-6">
          <el-button @click="showChangePasswordDrawer = false" class="rounded-lg">
            取消
          </el-button>
          <el-button type="primary" @click="handleChangePassword" :loading="isChangingPassword" class="rounded-lg">
            保存更改
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 操作反馈提示条 -->
    <div v-if="actionFeedback.show" :class="[
      'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4 z-40 transform transition-transform duration-300',
      actionFeedback.show ? 'translate-y-0' : 'translate-y-full',
    ]">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <el-icon :class="actionFeedback.type === 'success'
            ? 'text-green-500'
            : 'text-red-500'
            ">
            <Check v-if="actionFeedback.type === 'success'" />
            <CircleClose v-else />
          </el-icon>
          <span class="text-gray-700 dark:text-gray-300">{{
            actionFeedback.message
          }}</span>
        </div>
        <el-button v-if="actionFeedback.undoable" link @click="handleUndo"
          class="text-primary-600 dark:text-primary-400">
          撤销
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "./utils/api";
import {
  Menu,
  CircleClose,
  Bell,
  ArrowDown,
  Lock,
  SwitchButton,
  DocumentCopy,
  Check,
} from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const isSidebarOpen = ref(false);
const isDesktop = ref(window.innerWidth >= 1024);

// 用户菜单相关
const showChangePasswordDrawer = ref(false);
const isChangingPassword = ref(false);
const changePasswordError = ref("");
const changePasswordSuccess = ref("");

// 更改密码表单
const changePasswordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 操作反馈系统
const actionFeedback = ref({
  show: false,
  message: "",
  type: "success" as "success" | "error",
  undoable: false,
  undoAction: null as (() => void) | null,
});

// 判断当前页面是否需要认证
const requiresAuth = computed(() => {
  // 从路由元信息中获取requiresAuth属性，如果没有设置则默认为true
  return route.meta.requiresAuth !== false;
});

// 获取当前用户信息
const currentUser = computed(() => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
});

// 用户名
const userName = computed(() => {
  return currentUser.value?.name || "用户";
});

// 用户首字母
const userInitials = computed(() => {
  if (currentUser.value?.name) {
    return currentUser.value.name.charAt(0).toUpperCase();
  }
  return "U";
});

// 处理下拉菜单命令
const handleDropdownCommand = (command: string) => {
  if (command === "changePassword") {
    showChangePasswordDrawer.value = true;
  } else if (command === "logout") {
    handleLogout();
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

// 处理密码更改
const handleChangePassword = async () => {
  // 验证表单
  if (
    changePasswordForm.value.newPassword !==
    changePasswordForm.value.confirmPassword
  ) {
    changePasswordError.value = "新密码和确认密码不匹配";
    return;
  }

  if (changePasswordForm.value.newPassword.length < 6) {
    changePasswordError.value = "新密码长度至少为6位";
    return;
  }

  isChangingPassword.value = true;
  changePasswordError.value = "";
  changePasswordSuccess.value = "";

  try {
    await axios.put("/auth/change-password", {
      currentPassword: changePasswordForm.value.currentPassword,
      newPassword: changePasswordForm.value.newPassword,
    });

    // 显示成功反馈
    showFeedback("密码更改成功", "success");

    // 清空表单
    changePasswordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // 关闭抽屉
    setTimeout(() => {
      showChangePasswordDrawer.value = false;
    }, 1500);
  } catch (error: any) {
    console.error("Change password failed:", error);
    changePasswordError.value =
      error.response?.data?.message || "密码更改失败，请检查当前密码是否正确";
  } finally {
    isChangingPassword.value = false;
  }
};

// 处理退出登录
const handleLogout = async () => {
  try {
    // 调用后端退出接口
    await axios.post("/auth/logout");
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    // 清除本地存储的认证信息
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 强制跳转到登录页面，确保路由变化
    router.push("/login");
  }
};

// 菜单项配置
const menuItems = [
  {
    path: "/",
    label: "需求分析",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    path: "/requirements",
    label: "需求管理",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  {
    path: "/llm-config",
    label: "AI配置",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    path: "/prompt-templates",
    label: "提示词模板",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    path: "/users",
    label: "用户管理",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    path: "/roles",
    label: "角色管理",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    path: "/projects",
    label: "项目管理",
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  },
  {
    path: "/project-calendar",
    label: "项目日历",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
];

// 当前页面标题
const currentPageTitle = computed(() => {
  const currentItem = menuItems.find((item) => item.path === route.path);
  return currentItem ? currentItem.label : "OOPS-AI";
});

// 切换侧边栏
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// 监听窗口大小变化
const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024;
  if (isDesktop.value) {
    isSidebarOpen.value = true;
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  handleResize(); // 初始化
});

// 清理事件监听器
const cleanup = () => {
  window.removeEventListener("resize", handleResize);
};

// 组件卸载时清理
import { onUnmounted } from "vue";
onUnmounted(cleanup);
</script>
