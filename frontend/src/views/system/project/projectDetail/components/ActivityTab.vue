<template>
  <div class="activity-tab">
    <el-timeline v-loading="loading">
      <el-timeline-item
        v-for="activity in activities"
        :key="activity.id"
        :timestamp="formatDate(activity.createdAt)"
        placement="top"
        :type="getActivityType(activity.type)"
      >
        <el-card shadow="never">
          <div class="activity-content">
            <div class="activity-header">
              <el-avatar :size="32">{{
                activity.user?.name?.charAt(0) || "U"
              }}</el-avatar>
              <div class="activity-info">
                <span class="activity-user">{{
                  activity.user?.name || "系统"
                }}</span>
                <span class="activity-action">{{ activity.action }}</span>
              </div>
            </div>
            <div class="activity-description">
              {{ activity.description }}
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <div v-if="activities.length === 0" class="empty-state">
      <el-empty description="暂无活动记录" />
    </div>

    <div v-if="activities.length > 0" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useActivities } from "../composables/useActivities";

defineOptions({
  name: "ActivityTab"
});

const {
  activities,
  loading,
  page,
  pageSize,
  total,
  loadActivities,
  handleSizeChange,
  handlePageChange,
  getActivityType
} = useActivities();

const formatDate = (date: any) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("zh-CN");
};

defineExpose({
  loadActivities
});
</script>

<style scoped lang="scss">
.activity-tab {
  .activity-content {
    .activity-header {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 8px;

      .activity-info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .activity-user {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .activity-action {
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .activity-description {
      padding-left: 44px;
      font-size: 14px;
      line-height: 1.6;
      color: var(--el-text-color-regular);
    }
  }

  .empty-state {
    padding: 40px 0;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
    margin-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>
