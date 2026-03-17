<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">AI分析结果预览区</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">（自动拆解的需求列表）</p>
      </div>
    </div>

    <!-- AI分析结果 -->
    <div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue1-800">
      <h4 class="font-bold text-blue-900 dark:text-blue-200 mb-4">已识别需求：</h4>
      <div class="space-y-3">
        <div
          v-for="(item, index) in analysisResults"
          :key="index"
          class="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-blue-100/50 hover:border-blue-200 transition-all duration-200"
        >
          <el-icon class="text-blue-500 dark:text-blue-400 mt-0.5"><Check /></el-icon>
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ item }}</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-4">
      <el-button
        type="primary"
        class="rounded-xl px-6 flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 border-none shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-white font-medium"
        @click="handleConfirm"
      >
        <el-icon class="mr-2"><CircleCheck /></el-icon>
        确认拆分
      </el-button>
      <el-button
        type="default"
        class="rounded-xl px-6 flex-1 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
        @click="handleReanalyze"
      >
        <el-icon class="mr-2"><Refresh /></el-icon>
        重新分析
      </el-button>
    </div>

    <!-- AI追问区域 -->
    <div class="pt-6 border-t border-gray-100 dark:border-gray-800">
      <h4 class="font-bold text-gray-700 dark:text-gray-300 mb-4">AI追问：</h4>
      <div class="space-y-3">
        <div
          v-for="(question, index) in questions"
          :key="index"
          class="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-100 dark:border-amber-800"
        >
          <p class="text-sm text-gray-700 dark:text-gray-300">{{ question }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Check, CircleCheck, Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const props = defineProps<{
  analysisResults?: string[];
  questions?: string[];
}>();

const emit = defineEmits<{
  confirm: [];
  reanalyze: [];
}>();

const analysisResults = ref(props.analysisResults || []);
const questions = ref(props.questions || []);

const handleConfirm = () => {
  ElMessage.success("需求拆分确认成功");
  emit("confirm");
};

const handleReanalyze = () => {
  ElMessage.info("正在重新分析...");
  emit("reanalyze");
};

// 暴露方法供父组件调用
defineExpose({
  setAnalysisResults: (results: string[]) => {
    analysisResults.value = results;
  },
  setQuestions: (newQuestions: string[]) => {
    questions.value = newQuestions;
  },
  getAnalysisResults: () => analysisResults.value,
  getQuestions: () => questions.value,
});
</script>

<style scoped>
:deep(.el-button) {
  @apply !rounded-lg;
}
</style>
