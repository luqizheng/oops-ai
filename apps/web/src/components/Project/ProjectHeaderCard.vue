<template>
  <el-card shadow="never" class="project-header-card">
    <div class="project-header">
      <div class="project-info">
        <div class="project-title">
          <el-icon size="32" color="var(--el-color-primary)">
            <FolderOpened />
          </el-icon>
          <div class="title-content">
            <h1>{{ currentProject?.name || "加载中..." }}</h1>
            <p v-if="subtitle" class="project-subtitle">{{ subtitle }}</p>
            <div class="project-meta">
              <el-tag type="primary" effect="plain">{{
                currentProject?.key
              }}</el-tag>
              <el-tag :type="statusType" effect="light">
                {{ statusText }}
              </el-tag>
              <span class="meta-text">创建于 {{ formattedDate }}</span>
            </div>
          </div>
        </div>
        <p class="project-description">
          {{ currentProject?.description || "暂无项目描述" }}
        </p>
      </div>
      <div class="project-actions">
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑项目
        </el-button>
        <el-button @click="handleBack">
          <el-icon><Back /></el-icon>
          返回列表
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { FolderOpened, Edit, Back } from "@element-plus/icons-vue";
import type { ProjectViewModel } from "@oops-ai/shared";
import { getProject } from "@/api/system/project";

interface Props {
  project?: ProjectViewModel | null;
  projectId?: string | null;
  subtitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  projectId: null,
  project: null,
  subtitle: ""
});

const localProject = ref<ProjectViewModel | null>(null);
const loading = ref(false);

// 监听 projectId 变化，从后端获取数据
watch(
  () => props.projectId,
  async newId => {
    if (newId) {
      loading.value = true;
      try {
        const data = await getProject(newId);
        localProject.value = data;
      } catch (error) {
        console.error("获取项目数据失败:", error);
        localProject.value = null;
      } finally {
        loading.value = false;
      }
    } else {
      localProject.value = null;
      loading.value = false;
    }
  },
  { immediate: true }
);

const emit = defineEmits<{
  edit: [];
  back: [];
}>();

const router = useRouter();

// 当前使用的项目数据，优先使用从后端获取的，其次使用props传递的
const currentProject = computed(() => localProject.value || props.project);

const statusType = computed(() => {
  const typeMap: Record<string, any> = {
    active: "success",
    paused: "warning",
    completed: "info"
  };
  return typeMap[currentProject.value?.status || "active"] || "info";
});

const statusText = computed(() => {
  const textMap: Record<string, string> = {
    active: "进行中",
    paused: "已暂停",
    completed: "已完成"
  };
  return textMap[currentProject.value?.status || "active"] || "未知";
});

const formattedDate = computed(() => {
  if (!currentProject.value?.createdAt) return "-";
  return new Date(currentProject.value.createdAt).toLocaleString("zh-CN");
});

const handleEdit = () => {
  emit("edit");
};

const handleBack = () => {
  if (currentProject.value?.id) {
    router.push({ name: "ProjectList" });
  } else {
    emit("back");
  }
};

defineOptions({
  name: "ProjectHeaderCard"
});
</script>

<style scoped lang="scss">
.project-header-card {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.project-header {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: space-between;

  @media (width <= 768px) {
    flex-direction: column;
  }
}

.project-info {
  flex: 1;

  .project-title {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 12px;

    .title-content {
      h1 {
        margin: 0 0 4px;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .project-subtitle {
        margin: 0 0 8px;
        font-size: 16px;
        color: var(--el-text-color-secondary);
        font-weight: 400;
      }

      .project-meta {
        display: flex;
        gap: 12px;
        align-items: center;

        @media (width <= 768px) {
          flex-wrap: wrap;
        }

        .meta-text {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .project-description {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }
}

.project-actions {
  display: flex;
  flex-shrink: 0;
  gap: 12px;

  @media (width <= 768px) {
    width: 100%;

    .el-button {
      flex: 1;
    }
  }
}
</style>
