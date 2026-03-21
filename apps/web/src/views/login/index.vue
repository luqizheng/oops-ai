<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "./utils/rule";
import { debounce } from "@pureadmin/utils";
import { useEventListener } from "@vueuse/core";
import type { FormInstance } from "element-plus";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import { Monitor, Connection, Message, Lock } from "@element-plus/icons-vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "Login"
});

const router = useRouter();
const loading = ref(false);
const disabled = ref(false);
const ruleFormRef = ref<FormInstance>();
const errorMessage = ref("");

const { initStorage } = useLayout();
initStorage();

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);

const ruleForm = reactive({
  username: "admin",
  password: "admin123"
});

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  errorMessage.value = "";

  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      useUserStoreHook()
        .loginByUsername({
          email: ruleForm.username,
          password: ruleForm.password
        })
        .then(res => {
          if (res.success) {
            // 获取后端路由
            return initRouter().then(() => {
              disabled.value = true;
              router
                .push(getTopMenu(true).path)
                .then(() => {
                  message("登录成功", { type: "success" });
                })
                .finally(() => (disabled.value = false));
            });
          } else {
            errorMessage.value = res.message || "登录失败，请检查邮箱和密码";
            message(errorMessage.value, { type: "error" });
          }
        })
        .catch(error => {
          errorMessage.value = error.message || "登录失败，请稍后重试";
          message(errorMessage.value, { type: "error" });
        })
        .finally(() => (loading.value = false));
    }
  });
};

const immediateDebounce: any = debounce(
  formRef => onLogin(formRef),
  1000,
  true
);

useEventListener(document, "keydown", ({ code }) => {
  if (
    ["Enter", "NumpadEnter"].includes(code) &&
    !disabled.value &&
    !loading.value
  )
    immediateDebounce(ruleFormRef.value);
});
</script>

<template>
  <div
    class="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-100 selection:text-indigo-700"
  >
    <!-- 左侧：品牌与特性展示区 (桌面端) -->
    <div
      class="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900"
    >
      <!-- 动态背景光效 -->
      <div class="absolute inset-0 z-0">
        <div
          class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/30 blur-[120px] animate-pulse"
        />
        <div
          class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse"
          style="animation-delay: 2s"
        />
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]"
        />
      </div>

      <!-- 网格装饰 -->
      <div
        class="absolute inset-0 z-0 opacity-20"
        style="
          background-image: radial-gradient(#4f46e5 0.5px, transparent 0.5px);
          background-size: 24px 24px;
        "
      />

      <div class="relative z-10 w-full flex flex-col justify-between p-16">
        <!-- Logo区 -->
        <div class="flex items-center space-x-3">
          <div
            class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 transform hover:scale-110 transition-transform duration-300"
          >
            <span class="text-white font-bold text-xl">AI</span>
          </div>
          <span class="text-2xl font-bold text-white tracking-tight"
            >OOPS-AI</span
          >
        </div>

        <!-- 文案展示 -->
        <div class="max-w-xl">
          <h1
            class="text-5xl font-extrabold text-white leading-[1.2] mb-6 tracking-tight"
          >
            重塑软件开发中的<br />
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
              >需求交付体验</span
            >
          </h1>
          <p class="text-lg text-slate-400 leading-relaxed mb-10">
            通过 AI
            驱动的需求分析与管理，帮助您的团队减少沟通噪音，提升交付质量，让每一个
            Idea 都能精准落地。
          </p>

          <div class="grid grid-cols-2 gap-8">
            <div class="space-y-3">
              <div
                class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400 border border-white/10 shadow-inner"
              >
                <el-icon size="20"><Monitor /></el-icon>
              </div>
              <h3 class="text-white font-bold">智能分析</h3>
              <p class="text-sm text-slate-500">
                自动提取关键需求，识别模糊词，建议优化路径。
              </p>
            </div>
            <div class="space-y-3">
              <div
                class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-purple-400 border border-white/10 shadow-inner"
              >
                <el-icon size="20"><Connection /></el-icon>
              </div>
              <h3 class="text-white font-bold">高效协作</h3>
              <p class="text-sm text-slate-500">
                透明的任务跟踪，实时的团队动态，确保信息对齐。
              </p>
            </div>
          </div>
        </div>

        <!-- 底部提示 -->
        <div class="text-slate-500 text-sm">
          &copy; 2024 OOPS-AI Intelligent Requirement Agent. All rights
          reserved.
        </div>
      </div>
    </div>

    <!-- 右侧：登录区域 -->
    <div class="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-16">
      <div
        class="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        <!-- 移动端 Logo (显式隐藏 lg 以上) -->
        <div class="lg:hidden flex flex-col items-center mb-10">
          <div
            class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl mb-4"
          >
            <span class="text-white font-bold text-2xl">AI</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
            OOPS-AI
          </h1>
        </div>

        <div class="mb-10 text-center lg:text-left">
          <h2
            class="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight"
          >
            欢迎回来
          </h2>
          <p class="text-slate-500 font-medium">请登录您的账户以管理您的项目</p>
        </div>

        <!-- 主题切换 -->
        <div class="flex justify-end mb-4">
          <el-switch
            v-model="dataTheme"
            inline-prompt
            :active-icon="dayIcon"
            :inactive-icon="darkIcon"
            @change="dataThemeChange"
          />
        </div>

        <el-form
          ref="ruleFormRef"
          :model="ruleForm"
          :rules="loginRules"
          class="space-y-6"
          @submit.prevent="onLogin(ruleFormRef)"
        >
          <el-form-item prop="username">
            <div class="w-full">
              <label
                class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >电子邮箱</label
              >
              <el-input
                v-model="ruleForm.username"
                placeholder="name@company.com"
                size="large"
                class="modern-input"
              >
                <template #prefix>
                  <el-icon class="text-slate-400"><Message /></el-icon>
                </template>
              </el-input>
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <div class="w-full">
              <div class="flex items-center justify-between mb-2">
                <label
                  class="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >账户密码</label
                >
                <a
                  href="#"
                  class="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >忘记密码?</a
                >
              </div>
              <el-input
                v-model="ruleForm.password"
                type="password"
                placeholder="••••••••"
                show-password
                size="large"
                class="modern-input"
              >
                <template #prefix>
                  <el-icon class="text-slate-400"><Lock /></el-icon>
                </template>
              </el-input>
            </div>
          </el-form-item>

          <div class="flex items-center">
            <el-checkbox
              label="记住登录状态"
              size="small"
              class="!text-slate-500 font-medium"
            />
          </div>

          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            :disabled="disabled"
            class="w-full !rounded-xl !h-12 !text-base !font-bold bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-300"
          >
            立即登录
          </el-button>

          <el-alert
            v-if="errorMessage"
            :title="errorMessage"
            type="error"
            show-icon
            :closable="false"
            class="!rounded-xl border border-red-50"
          />

          <div
            class="pt-6 border-t border-slate-100 dark:border-slate-800 text-center"
          >
            <p class="text-sm text-slate-500 font-medium">
              尚未加入团队?
              <router-link
                to="/register"
                class="text-indigo-600 hover:text-indigo-500 font-bold ml-1 transition-colors"
              >
                申请试用账号
              </router-link>
            </p>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

:deep(.modern-input .el-input__wrapper) {
  @apply !rounded-xl !shadow-none !border-slate-200 dark:!border-slate-800 !bg-slate-50 dark:!bg-slate-900 transition-all duration-200;
}

:deep(.modern-input .el-input__wrapper.is-focus) {
  @apply !ring-2 !ring-indigo-500/20 !border-indigo-500 !bg-white dark:!bg-slate-800;
}

@keyframes pulse-gentle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse-gentle 8s ease-in-out infinite;
}
</style>
