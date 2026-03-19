<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">需求详细配置区</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">已拆解的需求列表（可拖拽排序）</p>
      </div>
    </div>

    <!-- 拆解后的需求列表 -->
    <div class="space-y-4">
      <RequirementItem
        v-for="(requirement, index) in requirements"
        :key="requirement.id"
        v-model:selected="requirements[index].selected"
        :id="requirement.id"
        :title="requirement.title"
        :priority="requirement.priority"
        :type="requirement.type"
        :acceptance-criteria="requirement.acceptanceCriteria"
        :dependencies="requirement.dependencies"
        @edit="handleEdit"
        @generate-test-cases="handleGenerateTestCases"
        @view-dependencies="handleViewDependencies"
      />

      <!-- 添加自定义需求按钮 -->
      <div class="pt-6 border-t border-gray-100 dark:border-gray-800">
        <el-button
          type="primary"
          plain
          class="rounded-xl w-full px-6 py-3 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
          @click="handleAddCustomRequirement"
        >
          <el-icon class="mr-2"><Plus /></el-icon>
          添加自定义需求
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import RequirementItem from "./RequirementItem.vue";

interface Requirement {
  id: number;
  title: string;
  selected: boolean;
  priority: "high" | "medium" | "low";
  type: string;
  acceptanceCriteria: string;
  dependencies: string[];
}

const props = defineProps<{
  requirements?: Requirement[];
}>();

const emit = defineEmits<{
  "update:requirements": [requirements: Requirement[]];
  addCustomRequirement: [];
  edit: [id: number];
  generateTestCases: [id: number];
  viewDependencies: [id: number];
}>();

const requirements = ref<Requirement[]>(props.requirements || []);

const handleAddCustomRequirement = () => {
  const newId =
    requirements.value.length > 0
      ? Math.max(...requirements.value.map((r) => r.id)) + 1
      : 1;

  const newRequirement: Requirement = {
    id: newId,
    title: `需求${newId}: 自定义需求`,
    selected: true,
    priority: "medium",
    type: "custom",
    acceptanceCriteria: "请填写验收标准",
    dependencies: [],
  };

  requirements.value.push(newRequirement);
  emit("update:requirements", requirements.value);
  emit("addCustomRequirement");
  ElMessage.success("已添加自定义需求");
};

const handleEdit = (id: number) => {
  emit("edit", id);
};

const handleGenerateTestCases = (id: number) => {
  emit("generateTestCases", id);
};

const handleViewDependencies = (id: number) => {
  emit("viewDependencies", id);
};

// 暴露方法供父组件调用
defineExpose({
  getRequirements: () => requirements.value,
  setRequirements: (newRequirements: Requirement[]) => {
    requirements.value = newRequirements;
  },
  addRequirement: (requirement: Requirement) => {
    requirements.value.push(requirement);
  },
  removeRequirement: (id: number) => {
    const index = requirements.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      requirements.value.splice(index, 1);
    }
  },
  getSelectedRequirements: () => {
    return requirements.value.filter((r) => r.selected);
  },
});
</script>

<style scoped>
:deep(.el-button) {
  @apply !rounded-lg;
}
</style>
