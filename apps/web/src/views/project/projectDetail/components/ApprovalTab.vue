<template>
  <div class="approval-tab">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-select
          v-model="statusFilter"
          placeholder="审批状态"
          clearable
          style="width: 150px"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="待审批" value="PENDING" />
          <el-option label="已批准" value="APPROVED" />
          <el-option label="已拒绝" value="REJECTED" />
          <el-option label="有条件批准" value="CONDITIONAL" />
        </el-select>
        <el-select
          v-model="typeFilter"
          placeholder="审批类型"
          clearable
          style="width: 150px"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="需求审批" value="requirement" />
          <el-option label="发布审批" value="release" />
          <el-option label="变更审批" value="change" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon>
            <Plus />
          </el-icon>
          创建审批
        </el-button>
      </div>
    </div>

    <div class="approval-stats">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="approval-stat-card pending">
            <div class="stat-number">{{ stats.pending }}</div>
            <div class="stat-text">待审批</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="approval-stat-card approved">
            <div class="stat-number">{{ stats.approved }}</div>
            <div class="stat-text">已批准</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="approval-stat-card rejected">
            <div class="stat-number">{{ stats.rejected }}</div>
            <div class="stat-text">已拒绝</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="approval-stat-card conditional">
            <div class="stat-number">{{ stats.conditional }}</div>
            <div class="stat-text">有条件批准</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-table
      v-loading="loading"
      :data="approvals"
      stripe
      border
      class="data-table"
    >
      <el-table-column prop="signoffType" label="审批类型" width="120">
        <template #default="{ row }">
          <el-tag type="primary">{{ getTypeText(row.signoffType) }}</el-tag>
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
      <el-table-column prop="signoffStatus" label="审批状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.signoffStatus)" effect="light" round>
            {{ getStatusText(row.signoffStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="signedBy" label="审批人" width="120">
        <template #default="{ row }">
          <div v-if="row.signedBy" class="signer-info">
            <el-avatar :size="24">{{
              row.signedBy.name?.charAt(0) || "U"
            }}</el-avatar>
            <span>{{ row.signedBy.name || "未知" }}</span>
          </div>
          <span v-else class="text-muted">待审批</span>
        </template>
      </el-table-column>
      <el-table-column prop="signedAt" label="审批时间" width="160">
        <template #default="{ row }">
          {{ row.signedAt ? formatDate(row.signedAt) : "-" }}
        </template>
      </el-table-column>
      <el-table-column prop="milestone" label="里程碑" width="120">
        <template #default="{ row }">
          {{ row.milestone || "-" }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.signoffStatus === 'PENDING'"
            type="success"
            size="small"
            link
            @click="handleApprove(row)"
          >
            批准
          </el-button>
          <el-button
            v-if="row.signoffStatus === 'PENDING'"
            type="danger"
            size="small"
            link
            @click="handleReject(row)"
          >
            拒绝
          </el-button>
          <el-button type="primary" size="small" link @click="handleView(row)">
            查看
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="审批类型" prop="signoffType">
          <el-select
            v-model="formData.signoffType"
            placeholder="选择审批类型"
            style="width: 100%"
          >
            <el-option label="需求审批" value="requirement" />
            <el-option label="发布审批" value="release" />
            <el-option label="变更审批" value="change" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联需求" prop="requirementId">
          <el-select
            v-model="formData.requirementId"
            placeholder="选择关联需求"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="req in requirements"
              :key="req.id"
              :label="req.title"
              :value="req.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="里程碑">
          <el-input v-model="formData.milestone" placeholder="请输入里程碑" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.comments"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, Link } from "@element-plus/icons-vue";
import { useApprovals } from "../composables/useApprovals";

defineOptions({
  name: "ApprovalTab"
});

defineEmits<{
  "view-requirement": [requirement: any];
}>();

const {
  approvals,
  loading,
  page,
  pageSize,
  total,
  statusFilter,
  typeFilter,
  stats,
  requirements,
  dialogVisible,
  dialogTitle,
  formRef,
  submitLoading,
  formData,
  rules,
  loadApprovals,
  loadRequirements,
  handleSizeChange,
  handlePageChange,
  handleFilterChange,
  handleCreate,
  handleApprove,
  handleReject,
  handleView,
  handleSubmit,
  getTypeText,
  getStatusType,
  getStatusText
} = useApprovals();

const formatDate = (date: any) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("zh-CN");
};

defineExpose({
  loadApprovals,
  loadRequirements
});
</script>

<style scoped lang="scss">
.approval-tab {
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

  .approval-stats {
    margin-bottom: 16px;
  }

  .approval-stat-card {
    padding: 20px;
    color: white;
    text-align: center;
    border-radius: 8px;

    &.pending {
      background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
    }

    &.approved {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    &.rejected {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.conditional {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-number {
      margin-bottom: 8px;
      font-size: 32px;
      font-weight: 700;
      line-height: 1;
    }

    .stat-text {
      font-size: 14px;
      opacity: 0.9;
    }
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

  .signer-info {
    display: flex;
    gap: 8px;
    align-items: center;
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
