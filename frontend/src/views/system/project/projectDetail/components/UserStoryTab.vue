<template>
  <div class="user-story-tab">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="search"
          placeholder="搜索故事内容"
          clearable
          style="width: 280px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon>
            <Plus />
          </el-icon>
          创建故事
        </el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="stories"
      stripe
      border
      class="data-table"
    >
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="story-expand">
            <div class="story-format">
              <el-card shadow="never" class="story-card">
                <template #header>
                  <span class="card-title">As a...</span>
                </template>
                <div class="story-content">{{ row.role }}</div>
              </el-card>
              <el-icon size="20">
                <ArrowRight />
              </el-icon>
              <el-card shadow="never" class="story-card">
                <template #header>
                  <span class="card-title">I want...</span>
                </template>
                <div class="story-content">{{ row.want }}</div>
              </el-card>
              <el-icon v-if="row.soThat" size="20">
                <ArrowRight />
              </el-icon>
              <el-card v-if="row.soThat" shadow="never" class="story-card">
                <template #header>
                  <span class="card-title">So that...</span>
                </template>
                <div class="story-content">{{ row.soThat }}</div>
              </el-card>
            </div>
            <div v-if="row.acceptanceNotes" class="acceptance-notes">
              <h4>验收要点</h4>
              <p>{{ row.acceptanceNotes }}</p>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="80">
        <template #default="{ row }">
          <span class="story-id">{{ row.id.slice(0, 8) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="requirement" label="关联需求" min-width="180">
        <template #default="{ row }">
          <div v-if="row.requirement" class="requirement-link">
            <el-icon>
              <Link />
            </el-icon>
            <span @click="$emit('view-requirement', row.requirement)">
              {{ row.requirement.title }}
            </span>
          </div>
          <span v-else class="text-muted">未关联</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="storyPoints"
        label="故事点"
        width="80"
        align="center"
      >
        <template #default="{ row }">
          <el-tag v-if="row.storyPoints" type="primary">{{
            row.storyPoints
          }}</el-tag>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" link @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Plus, ArrowRight, Link } from "@element-plus/icons-vue";
import { useUserStories } from "../composables/useUserStories";

defineOptions({
  name: "UserStoryTab"
});

defineEmits<{
  "view-requirement": [requirement: any];
}>();

const {
  stories,
  loading,
  page,
  pageSize,
  total,
  search,
  loadStories,
  handleSearch,
  handleSizeChange,
  handlePageChange,
  handleCreate,
  handleEdit,
  handleDelete
} = useUserStories();

const formatDate = (date: any) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("zh-CN");
};

defineExpose({
  loadStories
});
</script>

<style scoped lang="scss">
.user-story-tab {
  .tab-toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    @media (width <= 768px) {
      flex-direction: column;
      align-items: stretch;
    }

    .toolbar-left {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .toolbar-right {
      flex-shrink: 0;
    }
  }

  .story-expand {
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
  }

  .story-format {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 16px;

    .story-card {
      flex: 1;
      min-width: 200px;

      :deep(.el-card__header) {
        padding: 8px 12px;
        background: var(--el-color-primary-light-9);

        .card-title {
          font-weight: 600;
          color: var(--el-color-primary);
        }
      }

      :deep(.el-card__body) {
        padding: 12px;
      }

      .story-content {
        font-size: 14px;
        line-height: 1.6;
        color: var(--el-text-color-primary);
      }
    }

    .el-icon {
      margin-top: 24px;
      color: var(--el-text-color-secondary);
    }
  }

  .acceptance-notes {
    padding: 12px;
    background: white;
    border-radius: 4px;

    h4 {
      margin: 0 0 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: var(--el-text-color-regular);
    }
  }

  .story-id {
    font-family: monospace;
    color: var(--el-text-color-secondary);
  }

  .requirement-link {
    display: flex;
    gap: 6px;
    align-items: center;
    color: var(--el-color-primary);
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .text-muted {
    font-size: 13px;
    color: var(--el-text-color-secondary);
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
