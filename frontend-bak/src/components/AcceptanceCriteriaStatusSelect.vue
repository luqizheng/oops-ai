<template>
  <el-select
    v-if="edit"
    v-model="localValue"
    placeholder="选择验收标准状态"
    size="default"
    :disabled="disabled"
    @change="handleChange"
  >
    <el-option
      v-for="(status, value) in acceptanceCriteriaStatusMap"
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
    {{ acceptanceCriteriaStatusMap[localValue] || '未知状态' }}
  </el-tag>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { AcceptanceCriteriaStatus } from '@oops-ai/shared/src/models/requirement';
import { acceptanceCriteriaStatusMap } from '../utils/enumMapping';

interface Props {
  modelValue: AcceptanceCriteriaStatus;
  edit?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  edit: true,
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: AcceptanceCriteriaStatus];
}>();

const localValue = ref<AcceptanceCriteriaStatus>(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue;
});

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
});

const handleChange = (value: AcceptanceCriteriaStatus) => {
  emit('update:modelValue', value);
};

const getStatusTagType = (status: AcceptanceCriteriaStatus): string => {
  const typeMap: Record<AcceptanceCriteriaStatus, string> = {
    NOT_TESTED: 'info',
    PASS: 'success',
    FAIL: 'danger',
    BLOCKED: 'warning',
    IN_PROGRESS: 'processing'
  };
  return typeMap[status] || 'info';
};
</script>
