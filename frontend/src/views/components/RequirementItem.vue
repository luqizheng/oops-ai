<template>
  <div
    class="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
  >
    <div class="flex items-start gap-4">
      <el-checkbox
        v-model="selected"
        class="mt-1"
        @change="handleSelectionChange"
      />

      <div class="flex-1">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-bold text-gray-900 dark:text-white">{{ title }}</h4>
          <div class="flex items-center gap-2">
            <span
              class="px-3 py-1 text-xs font-bold rounded-full"
              :class="priorityClass"
            >
              {{ priorityText }}
            </span>
            <span
              class="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {{ typeText }}
            </span>
          </div>
        </div>

        <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-start gap-2">
            <span class="font-medium text-gray-700 dark:text-gray-300">验收标准：</span>
            <span>{{ acceptanceCriteria }}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="font-medium text-gray-700 dark:text-gray-300">依赖关系：</span>
            <span v-if="dependencies.length > 0">
              {{ dependencies.join("，") }}
            </span>
            <span v-else class="text-gray-400 dark:text-gray-500">无依赖</span>
          </div>
        </div>

        <div class="flex items-center gap-3 mt-4">
          <el-button
            size="small"
            type="primary"
            plain
            class="rounded-xl px-4 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            @click="handleEdit"
          >
            <el-icon class="mr-1"><Edit /></el-icon>
            编辑
          </el-button>
          <el-button
            size="small"
            type="success"
            plain
            class="rounded-xl px-4 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
            @click="handleGenerateTestCases"
          >
            <el-icon class="mr-1"><Document /></el-icon>
            生成测试用例
          </el-button>
          <el-button
            size="small"
            type="info"
            plain
            class="rounded-xl px-4 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
            @click="handleViewDependencies"
          >
            <el-icon class="mr-1"><Connection /></el-icon>
            查看依赖
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Edit, Document, Connection, Check } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const props = defineProps<{
  id: number;
  title: string;
  selected: boolean;
  priority: "high" | "medium" | "low";
  type: string;
  acceptanceCriteria: string;
  dependencies: string[];
}>();

const emit = defineEmits<{
  "update:selected": [value: boolean];
  edit: [id: number];
  generateTestCases: [id: number];
  viewDependencies: [id: number];
}>();

const selected = ref(props.selected);

// 计算属性
const priorityText = computed(() => {
  const map: Record<string, string> = {
    high: "🔥 高",
    medium: "📌 中",
    low: "📝 低",
  };
  return map[props.priority] || props.priority;
});

const priorityClass = computed(() => {
  const map: Record<string, string> = {
    high: "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm",
    medium: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm",
    low: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm",
  };
  return map[props.priority] || "bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-sm";
});

const typeText = computed(() => {
  const map: Record<string, string> = {
    "non-functional-performance": "非功能需求-性能",
    "functional-authentication": "功能需求-认证",
    "functional-account-management": "功能需求-账户管理",
    security: "安全需求",
    custom: "自定义需求",
  };
  return map[props.type] || props.type;
});

// 事件处理
const handleSelectionChange = (value: boolean) => {
  emit("update:selected", value);
};

const handleEdit = () => {
  ElMessage.info(`编辑需求: ${props.title}`);
  emit("edit", props.id);
};

const handleGenerateTestCases = () => {
  ElMessage.success(`正在为"${props.title}"生成测试用例...`);
  emit("generateTestCases", props.id);
};

const handleViewDependencies = () => {
  ElMessage.info(`查看"${props.title}"的依赖关系`);
  emit("viewDependencies", props.id);
};

// 暴露方法供父组件调用
defineExpose({
  getId: () => props.id,
  getTitle: () => props.title,
  isSelected: () => selected.value,
  setSelected: (value: boolean) => {
    selected.value = value;
  },
});
</script>

<style scoped>
:deep(.el-button) {
  @apply !rounded-lg;
}
</style>
