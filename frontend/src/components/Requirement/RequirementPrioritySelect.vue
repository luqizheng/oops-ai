<template>
  <el-select
    v-if="edit"
    v-model="localValue"
    placeholder="选择需求优先级"
    size="default"
    :disabled="disabled"
    @change="handleChange"
  >
    <el-option
      v-for="(priority, value) in requirementPriorityMap"
      :key="value"
      :label="priority"
      :value="value"
    />
  </el-select>
  <el-tag v-else :type="getPriorityTagType(localValue)" size="small">
    {{ requirementPriorityMap[localValue] || "未知优先级" }}
  </el-tag>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { RequirementPriority } from "@oops-ai/shared/src/models/requirement";
import { requirementPriorityMap } from "../utils/enumMapping";

interface Props {
  modelValue: RequirementPriority;
  edit?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  edit: true,
  disabled: false
});

const emit = defineEmits<{
  "update:modelValue": [value: RequirementPriority];
}>();

const localValue = ref<RequirementPriority>(props.modelValue);

watch(
  () => props.modelValue,
  newValue => {
    localValue.value = newValue;
  }
);

watch(localValue, newValue => {
  emit("update:modelValue", newValue);
});

const handleChange = (value: RequirementPriority) => {
  emit("update:modelValue", value);
};

const getPriorityTagType = (priority: RequirementPriority): string => {
  const typeMap: Record<RequirementPriority, string> = {
    LOW: "success",
    MEDIUM: "warning",
    HIGH: "danger",
    URGENT: "danger"
  };
  return typeMap[priority] || "info";
};
</script>
