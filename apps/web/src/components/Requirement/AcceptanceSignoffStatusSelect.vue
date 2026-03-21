<template>
  <el-select
    v-if="edit"
    v-model="localValue"
    placeholder="选择签核状态"
    size="default"
    :disabled="disabled"
    @change="handleChange"
  >
    <el-option
      v-for="(status, value) in acceptanceSignoffStatusMap"
      :key="value"
      :label="status"
      :value="value"
    />
  </el-select>
  <el-tag v-else :type="getStatusTagType(localValue)" size="small">
    {{ acceptanceSignoffStatusMap[localValue] || "未知状态" }}
  </el-tag>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { AcceptanceSignoffStatus } from "@oops-ai/shared/src/models/requirement";
import { acceptanceSignoffStatusMap } from "../../utils/enumMapping";

interface Props {
  modelValue: AcceptanceSignoffStatus;
  edit?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  edit: true,
  disabled: false
});

const emit = defineEmits<{
  "update:modelValue": [value: AcceptanceSignoffStatus];
}>();

const localValue = ref<AcceptanceSignoffStatus>(props.modelValue);

watch(
  () => props.modelValue,
  newValue => {
    localValue.value = newValue;
  }
);

watch(localValue, newValue => {
  emit("update:modelValue", newValue);
});

const handleChange = (value: AcceptanceSignoffStatus) => {
  emit("update:modelValue", value);
};

const getStatusTagType = (
  status: AcceptanceSignoffStatus
): "primary" | "success" | "info" | "warning" | "danger" => {
  const typeMap: Record<
    AcceptanceSignoffStatus,
    "primary" | "success" | "info" | "warning" | "danger"
  > = {
    PENDING: "info",
    APPROVED: "success",
    REJECTED: "danger",
    CONDITIONAL: "warning"
  };
  return typeMap[status] || "info";
};
</script>
