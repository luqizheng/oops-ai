<template>
  <el-select
    v-if="edit"
    v-model="localValue"
    placeholder="选择自动化状态"
    size="default"
    :disabled="disabled"
    @change="handleChange"
  >
    <el-option
      v-for="(status, value) in testCaseAutomationStatusMap"
      :key="value"
      :label="status"
      :value="value"
    />
  </el-select>
  <el-tag
    v-else
    :type="getStatusTagType(localValue)"
    size="small"
  >
    {{ testCaseAutomationStatusMap[localValue] || '未知状态' }}
  </el-tag>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { TestCaseAutomationStatus } from '@oops-ai/shared/src/models/requirement';
import { testCaseAutomationStatusMap } from '../utils/enumMapping';

interface Props {
  modelValue: TestCaseAutomationStatus;
  edit?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  edit: true,
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: TestCaseAutomationStatus];
}>();

const localValue = ref<TestCaseAutomationStatus>(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue;
});

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
});

const handleChange = (value: TestCaseAutomationStatus) => {
  emit('update:modelValue', value);
};

const getStatusTagType = (status: TestCaseAutomationStatus): string => {
  const typeMap: Record<TestCaseAutomationStatus, string> = {
    MANUAL: 'info',
    AUTOMATED: 'success',
    PARTIALLY_AUTOMATED: 'warning',
    NOT_AUTOMATABLE: 'danger'
  };
  return typeMap[status] || 'info';
};
</script>
