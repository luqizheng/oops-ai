<template>
  <el-select
    v-if="edit"
    v-model="localValue"
    placeholder="选择需求类型"
    size="default"
    :disabled="disabled"
    @change="handleChange"
  >
    <el-option
      v-for="(type, value) in requirementTypeMap"
      :key="value"
      :label="type"
      :value="value"
    />
  </el-select>
  <el-tag v-else :type="getTypeTagType(localValue)" size="small">
    {{ requirementTypeMap[localValue] || "未知类型" }}
  </el-tag>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { RequirementType } from "@oops-ai/shared/src/models/requirement";
import { requirementTypeMap } from "../utils/enumMapping";

interface Props {
  modelValue: RequirementType;
  edit?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  edit: true,
  disabled: false
});

const emit = defineEmits<{
  "update:modelValue": [value: RequirementType];
}>();

const localValue = ref<RequirementType>(props.modelValue);

watch(
  () => props.modelValue,
  newValue => {
    localValue.value = newValue;
  }
);

watch(localValue, newValue => {
  emit("update:modelValue", newValue);
});

const handleChange = (value: RequirementType) => {
  emit("update:modelValue", value);
};

const getTypeTagType = (type: RequirementType): string => {
  const typeMap: Record<RequirementType, string> = {
    FEATURE: "primary",
    BUGFIX: "danger",
    ENHANCEMENT: "warning",
    TASK: "info",
    NON_FUNCTIONAL: "success"
  };
  return typeMap[type] || "info";
};
</script>
