<template>
  <div class="member-tab">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="search"
          placeholder="搜索成员姓名"
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
        <el-select
          v-model="roleFilter"
          placeholder="角色筛选"
          clearable
          style="width: 150px"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="管理员" value="admin" />
          <el-option label="开发者" value="developer" />
          <el-option label="观察者" value="viewer" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon>
            <Plus />
          </el-icon>
          添加成员
        </el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="members"
      stripe
      border
      class="data-table"
    >
      <el-table-column prop="user" label="成员" min-width="200">
        <template #default="{ row }">
          <div class="member-info">
            <el-avatar :size="40">{{
              row.user?.name?.charAt(0) || "U"
            }}</el-avatar>
            <div class="member-details">
              <span class="member-name">{{
                row.user?.name || "未命名用户"
              }}</span>
              <span class="member-email">{{ row.user?.email }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role)" effect="light" round>
            {{ getRoleText(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="joinedAt" label="加入时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.joinedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="warning" size="small" link @click="handleEdit(row)">
            编辑角色
          </el-button>
          <el-button type="danger" size="small" link @click="handleRemove(row)">
            移除
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

    <el-dialog v-model="editDialogVisible" title="编辑成员角色" width="400px">
      <el-form :model="editFormData" label-width="80px">
        <el-form-item label="角色">
          <el-select
            v-model="editFormData.role"
            placeholder="选择角色"
            style="width: 100%"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="开发者" value="developer" />
            <el-option label="观察者" value="viewer" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="editSubmitLoading"
          @click="handleUpdate"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="addDialogVisible" title="添加成员" width="500px">
      <el-form :model="addFormData" label-width="80px">
        <el-form-item label="选择用户" required>
          <el-select
            v-model="addFormData.userId"
            placeholder="请选择用户"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in availableUsers"
              :key="user.id"
              :label="`${user.name || '未命名'} (${user.email})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select
            v-model="addFormData.role"
            placeholder="选择角色"
            style="width: 100%"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="开发者" value="developer" />
            <el-option label="观察者" value="viewer" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="addSubmitLoading"
          @click="handleAddSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Search, Plus } from "@element-plus/icons-vue";
import type { ProjectMemberListItem } from "@oops-ai/shared";
import { useMembers } from "../composables/useMembers";

const props = defineProps<{
  projectId: string;
}>();

defineOptions({
  name: "MemberTab"
});

const {
  members,
  loading,
  page,
  pageSize,
  total,
  search,
  roleFilter,
  availableUsers,
  editDialogVisible,
  editFormData,
  editSubmitLoading,
  addDialogVisible,
  addFormData,
  addSubmitLoading,
  loadMembers,
  loadAllUsers,
  handleSearch,
  handleFilterChange,
  handleSizeChange,
  handlePageChange,
  handleAdd,
  handleAddSubmit,
  handleEdit,
  handleUpdate,
  handleRemove,
  getRoleType,
  getRoleText
} = useMembers(props.projectId);

const formatDate = (date: any) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("zh-CN");
};

defineExpose({
  loadMembers,
  loadAllUsers
});
</script>

<style scoped lang="scss">
.member-tab {
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

      @media (width <= 768px) {
        flex-direction: column;
      }
    }

    .toolbar-right {
      flex-shrink: 0;
    }
  }

  .member-info {
    display: flex;
    gap: 12px;
    align-items: center;

    .member-details {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .member-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .member-email {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
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
