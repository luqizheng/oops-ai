<template>
  <el-select
    v-if="edit"
    v-model="localValue"
    placeholder="选择需求状态"
    size="default"
    :disabled="disabled"
    @change="handleChange"
  >
    <el-option
      v-for="(status, value) in requirementStatusMap"
      :key="value"
      :label="status"
      :value="value"
    />
  </el-select>
  <el-tag v-else :type="getStatusTagType(localValue)" size="small">
    {{ requirementStatusMap[localValue] || "未知状态" }}
  </el-tag>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { RequirementStatus } from "@oops-ai/shared/src/models/requirement";
import { requirementStatusMap } from "../../utils/enumMapping";

interface Props {
  modelValue: RequirementStatus;
  edit?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  edit: true,
  disabled: false
});

const emit = defineEmits<{
  "update:modelValue": [value: RequirementStatus];
}>();

const localValue = ref<RequirementStatus>(props.modelValue);

watch(
  () => props.modelValue,
  newValue => {
    localValue.value = newValue;
  }
);

watch(localValue, newValue => {
  emit("update:modelValue", newValue);
});

const handleChange = (value: RequirementStatus) => {
  emit("update:modelValue", value);
};

const getStatusTagType = (
  status: RequirementStatus
): "primary" | "success" | "info" | "warning" | "danger" => {
  const typeMap: Record<
    RequirementStatus,
    "primary" | "success" | "info" | "warning" | "danger"
  > = {
    DRAFT: "info",
    SUBMITTED: "primary",
    REVIEWING: "success",
    APPROVED: "success",
    REJECTED: "danger",
    IMPLEMENTING: "warning",
    TESTING: "primary",
    COMPLETED: "success",
    CANCELED: "danger"
  };
  return typeMap[status] || "info";
};
</script>
