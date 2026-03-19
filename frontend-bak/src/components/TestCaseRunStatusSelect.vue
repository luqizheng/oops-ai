<template>
  <el-select
    v-if="edit"
    v-model="localValue"
    placeholder="选择运行状态"
    size="default"
    :disabled="disabled"
    @change="handleChange"
  >
    <el-option
      v-for="(status, value) in testCaseRunStatusMap"
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
    {{ testCaseRunStatusMap[localValue] || '未知状态' }}
  </el-tag>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { TestCaseRunStatus } from '@oops-ai/shared/src/models/requirement';
import { testCaseRunStatusMap } from '../utils/enumMapping';

interface Props {
  modelValue: TestCaseRunStatus;
  edit?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  edit: true,
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: TestCaseRunStatus];
}>();

const localValue = ref<TestCaseRunStatus>(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue;
});

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
});

const handleChange = (value: TestCaseRunStatus) => {
  emit('update:modelValue', value);
};

const getStatusTagType = (status: TestCaseRunStatus): string => {
  const typeMap: Record<TestCaseRunStatus, string> = {
    PASS: 'success',
    FAIL: 'danger',
    BLOCKED: 'warning',
    SKIPPED: 'info',
    IN_PROGRESS: 'processing'
  };
  return typeMap[status] || 'info';
};
</script>
