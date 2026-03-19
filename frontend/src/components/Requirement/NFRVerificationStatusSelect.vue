<template>
  <el-select
    v-if="edit"
    v-model="localValue"
    placeholder="选择验证状态"
    size="default"
    :disabled="disabled"
    @change="handleChange"
  >
    <el-option
      v-for="(status, value) in nfrVerificationStatusMap"
      :key="value"
      :label="status"
      :value="value"
    />
  </el-select>
  <el-tag v-else :type="getStatusTagType(localValue)" size="small">
    {{ nfrVerificationStatusMap[localValue] || "未知状态" }}
  </el-tag>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { NFRVerificationStatus } from "@oops-ai/shared/src/models/requirement";
import { nfrVerificationStatusMap } from "../utils/enumMapping";

interface Props {
  modelValue: NFRVerificationStatus;
  edit?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  edit: true,
  disabled: false
});

const emit = defineEmits<{
  "update:modelValue": [value: NFRVerificationStatus];
}>();

const localValue = ref<NFRVerificationStatus>(props.modelValue);

watch(
  () => props.modelValue,
  newValue => {
    localValue.value = newValue;
  }
);

watch(localValue, newValue => {
  emit("update:modelValue", newValue);
});

const handleChange = (value: NFRVerificationStatus) => {
  emit("update:modelValue", value);
};

const getStatusTagType = (status: NFRVerificationStatus): string => {
  const typeMap: Record<NFRVerificationStatus, string> = {
    NOT_VERIFIED: "info",
    PASSED: "success",
    WARNING: "warning",
    FAILED: "danger",
    IN_PROGRESS: "processing"
  };
  return typeMap[status] || "info";
};
</script>
