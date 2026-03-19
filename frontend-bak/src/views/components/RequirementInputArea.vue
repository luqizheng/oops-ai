<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          原始需求输入区
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          （客户原话）
        </p>
      </div>
    </div>

    <div>
      <el-input
        v-model="originalRequirement"
        type="textarea"
        :rows="8"
        placeholder="请输入客户原始需求描述，例如：'我希望系统登录体验更好，要快一点，还要安全，最好能支持微信登录，忘记密码也要能方便找回'"
        class="modern-input"
        @keyup.enter="handleInput"
      />
    </div>

    <div class="flex items-center gap-4">
      <el-button type="primary" plain class="rounded-xl px-6" @click="handleInput">
        分析需求
      </el-button>
      <el-button
        type="primary"
        plain
        class="rounded-xl px-6"
        @click="handleUploadAudio"
      >
        <el-icon class="mr-2"><Upload /></el-icon>
        上传录音
      </el-button>
      <el-button
        type="primary"
        plain
        class="rounded-xl px-6"
        @click="handleImportEmail"
      >
        <el-icon class="mr-2"><Message /></el-icon>
        导入邮件
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Upload, Message } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const emit = defineEmits<{
  input: [value: string];
  uploadAudio: [];
  importEmail: [];
}>();

const originalRequirement = ref("");

const handleInput = () => {
  emit("input", originalRequirement.value);
};

const handleUploadAudio = () => {
  ElMessage.info("上传录音功能开发中...");
  emit("uploadAudio");
};

const handleImportEmail = () => {
  ElMessage.info("导入邮件功能开发中...");
  emit("importEmail");
};

// 暴露方法供父组件调用
defineExpose({
  setValue: (value: string) => {
    originalRequirement.value = value;
  },
  getValue: () => originalRequirement.value,
});
</script>

<style scoped>
:deep(.modern-input .el-textarea__inner) {
  @apply !rounded-xl !shadow-none !border-gray-200 !bg-gray-50/50 !p-3 focus:!bg-white focus:!border-indigo-500 focus:!ring-4 focus:!ring-indigo-500/10 transition-all duration-300;
}
</style>
