<template>
  <div class="project-detail">
    <el-row :gutter="20">
      <el-col :span="24">
        <ProjectHeaderCard
          :project="project"
          @edit="handleEdit"
          @back="handleBack"
        />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div
              class="stat-icon"
              style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              "
            >
              <el-icon size="24">
                <Document />
              </el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statistics.totalRequirements }}</span>
              <span class="stat-label">总需求数</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div
              class="stat-icon"
              style="
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              "
            >
              <el-icon size="24">
                <ChatLineSquare />
              </el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statistics.totalStories }}</span>
              <span class="stat-label">用户故事</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div
              class="stat-icon"
              style="
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              "
            >
              <el-icon size="24">
                <Clock />
              </el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statistics.pendingApprovals }}</span>
              <span class="stat-label">待审批</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div
              class="stat-icon"
              style="
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
              "
            >
              <el-icon size="24">
                <CircleCheck />
              </el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{
                statistics.completedRequirements
              }}</span>
              <span class="stat-label">已完成</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="never" class="tabs-card">
          <el-tabs v-model="activeTab" class="project-tabs">
            <el-tab-pane label="需求管理" name="requirements">
              <RequirementList
                :project-id="projectId"
                @view="handleViewRequirement"
                @edit="handleEditRequirement"
                @create="handleCreateRequirement"
                @generate-stories="handleGenerateStories"
              />
            </el-tab-pane>

            <el-tab-pane label="用户故事" name="stories">
              <div class="tab-toolbar">
                <div class="toolbar-left">
                  <el-input
                    v-model="storySearch"
                    placeholder="搜索故事内容"
                    clearable
                    style="width: 280px"
                    @input="handleStorySearch"
                  >
                    <template #prefix>
                      <el-icon>
                        <Search />
                      </el-icon>
                    </template>
                  </el-input>
                </div>
                <div class="toolbar-right">
                  <el-button type="primary" @click="handleCreateStory">
                    <el-icon>
                      <Plus />
                    </el-icon>
                    创建故事
                  </el-button>
                </div>
              </div>

              <el-table
                v-loading="storiesLoading"
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
                        <el-card
                          v-if="row.soThat"
                          shadow="never"
                          class="story-card"
                        >
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
                <el-table-column
                  prop="requirement"
                  label="关联需求"
                  min-width="180"
                >
                  <template #default="{ row }">
                    <div v-if="row.requirement" class="requirement-link">
                      <el-icon>
                        <Link />
                      </el-icon>
                      <span @click="handleViewRequirement(row.requirement)">
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
                    <el-button
                      type="primary"
                      size="small"
                      link
                      @click="handleEditStory(row)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      link
                      @click="handleDeleteStory(row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="storyPage"
                  v-model:page-size="storyPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="storyTotal"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleStorySizeChange"
                  @current-change="handleStoryPageChange"
                />
              </div>
            </el-tab-pane>

            <el-tab-pane label="审批管理" name="approvals">
              <div class="tab-toolbar">
                <div class="toolbar-left">
                  <el-select
                    v-model="approvalStatusFilter"
                    placeholder="审批状态"
                    clearable
                    style="width: 150px"
                    @change="loadApprovals"
                  >
                    <el-option label="全部" value="" />
                    <el-option label="待审批" value="PENDING" />
                    <el-option label="已批准" value="APPROVED" />
                    <el-option label="已拒绝" value="REJECTED" />
                    <el-option label="有条件批准" value="CONDITIONAL" />
                  </el-select>
                  <el-select
                    v-model="approvalTypeFilter"
                    placeholder="审批类型"
                    clearable
                    style="width: 150px"
                    @change="loadApprovals"
                  >
                    <el-option label="全部" value="" />
                    <el-option label="需求审批" value="requirement" />
                    <el-option label="发布审批" value="release" />
                    <el-option label="变更审批" value="change" />
                  </el-select>
                </div>
                <div class="toolbar-right">
                  <el-button type="primary" @click="handleCreateApproval">
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
                      <div class="stat-number">{{ approvalStats.pending }}</div>
                      <div class="stat-text">待审批</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="approval-stat-card approved">
                      <div class="stat-number">
                        {{ approvalStats.approved }}
                      </div>
                      <div class="stat-text">已批准</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="approval-stat-card rejected">
                      <div class="stat-number">
                        {{ approvalStats.rejected }}
                      </div>
                      <div class="stat-text">已拒绝</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="approval-stat-card conditional">
                      <div class="stat-number">
                        {{ approvalStats.conditional }}
                      </div>
                      <div class="stat-text">有条件批准</div>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <el-table
                v-loading="approvalsLoading"
                :data="approvals"
                stripe
                border
                class="data-table"
              >
                <el-table-column
                  prop="signoffType"
                  label="审批类型"
                  width="120"
                >
                  <template #default="{ row }">
                    <el-tag type="primary">{{
                      getApprovalTypeText(row.signoffType)
                    }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="requirement"
                  label="关联需求"
                  min-width="180"
                >
                  <template #default="{ row }">
                    <div v-if="row.requirement" class="requirement-link">
                      <el-icon>
                        <Link />
                      </el-icon>
                      <span @click="handleViewRequirement(row.requirement)">
                        {{ row.requirement.title }}
                      </span>
                    </div>
                    <span v-else class="text-muted">未关联</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="signoffStatus"
                  label="审批状态"
                  width="120"
                >
                  <template #default="{ row }">
                    <el-tag
                      :type="getApprovalStatusType(row.signoffStatus)"
                      effect="light"
                      round
                    >
                      {{ getApprovalStatusText(row.signoffStatus) }}
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
                    <el-button
                      type="primary"
                      size="small"
                      link
                      @click="handleViewApproval(row)"
                    >
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="approvalPage"
                  v-model:page-size="approvalPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="approvalTotal"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleApprovalSizeChange"
                  @current-change="handleApprovalPageChange"
                />
              </div>
            </el-tab-pane>

            <el-tab-pane label="项目成员" name="members">
              <div class="tab-toolbar">
                <div class="toolbar-left">
                  <el-input
                    v-model="memberSearch"
                    placeholder="搜索成员姓名"
                    clearable
                    style="width: 280px"
                    @input="handleMemberSearch"
                  >
                    <template #prefix>
                      <el-icon>
                        <Search />
                      </el-icon>
                    </template>
                  </el-input>
                  <el-select
                    v-model="memberRoleFilter"
                    placeholder="角色筛选"
                    clearable
                    style="width: 150px"
                    @change="handleMemberFilterChange"
                  >
                    <el-option label="全部" value="" />
                    <el-option label="管理员" value="admin" />
                    <el-option label="开发者" value="developer" />
                    <el-option label="观察者" value="viewer" />
                  </el-select>
                </div>
                <div class="toolbar-right">
                  <el-button type="primary" @click="handleAddMember">
                    <el-icon>
                      <Plus />
                    </el-icon>
                    添加成员
                  </el-button>
                </div>
              </div>

              <el-table
                v-loading="membersLoading"
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
                    <el-tag
                      :type="getMemberRoleType(row.role)"
                      effect="light"
                      round
                    >
                      {{ getMemberRoleText(row.role) }}
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
                    <el-button
                      type="warning"
                      size="small"
                      link
                      @click="handleEditMember(row)"
                    >
                      编辑角色
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      link
                      @click="handleRemoveMember(row)"
                    >
                      移除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="memberPage"
                  v-model:page-size="memberPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="memberTotal"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleMemberSizeChange"
                  @current-change="handleMemberPageChange"
                />
              </div>
            </el-tab-pane>

            <el-tab-pane label="项目活动" name="activities">
              <el-timeline>
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
                          <span class="activity-action">{{
                            activity.action
                          }}</span>
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
                  v-model:current-page="activityPage"
                  v-model:page-size="activityPageSize"
                  :page-sizes="[10, 20, 50]"
                  :total="activityTotal"
                  layout="total, sizes, prev, pager, next"
                  @size-change="handleActivitySizeChange"
                  @current-change="handleActivityPageChange"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="memberDialogVisible" title="编辑成员角色" width="400px">
      <el-form :model="memberFormData" label-width="80px">
        <el-form-item label="角色">
          <el-select
            v-model="memberFormData.role"
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
        <el-button @click="memberDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="memberSubmitLoading"
          @click="handleUpdateMember"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="addMemberDialogVisible" title="添加成员" width="500px">
      <el-form :model="addMemberFormData" label-width="80px">
        <el-form-item label="选择用户" required>
          <el-select
            v-model="addMemberFormData.userId"
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
            v-model="addMemberFormData.role"
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
        <el-button @click="addMemberDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="addMemberSubmitLoading"
          @click="handleAddMemberSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="approvalDialogVisible"
      :title="approvalDialogTitle"
      width="600px"
    >
      <el-form
        ref="approvalFormRef"
        :model="approvalFormData"
        :rules="approvalRules"
        label-width="100px"
      >
        <el-form-item label="审批类型" prop="signoffType">
          <el-select
            v-model="approvalFormData.signoffType"
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
            v-model="approvalFormData.requirementId"
            placeholder="选择关联需求"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="req in approvalRequirements"
              :key="req.id"
              :label="req.title"
              :value="req.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="里程碑">
          <el-input
            v-model="approvalFormData.milestone"
            placeholder="请输入里程碑"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="approvalFormData.comments"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approvalDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="approvalSubmitLoading"
          @click="handleApprovalSubmit"
        >
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import {
  Search,
  Plus,
  Edit,
  Back,
  Document,
  ChatLineSquare,
  Clock,
  CircleCheck,
  ArrowRight,
  Link
} from "@element-plus/icons-vue";
import { ProjectHeaderCard } from "@/components/Project";
import { RequirementList } from "@/components/Requirement";
import {
  getProject,
  getProjectMembers,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
  getAllUsers
} from "@/api/system/project";
import { getRequirementsByProject } from "@/api/system/requirement";
import type {
  ProjectViewModel,
  ProjectMemberListItem,
  UserListItem
} from "@oops-ai/shared";

const route = useRoute();
const router = useRouter();

const projectId = computed(() => route.params.id as string);

const project = ref<ProjectViewModel | null>(null);
const activeTab = ref("requirements");

const statistics = ref({
  totalRequirements: 0,
  totalStories: 0,
  pendingApprovals: 0,
  completedRequirements: 0
});

const stories = ref<any[]>([]);
const storiesLoading = ref(false);
const storyPage = ref(1);
const storyPageSize = ref(10);
const storyTotal = ref(0);
const storySearch = ref("");

const approvalRequirements = ref<any[]>([]);

const approvals = ref<any[]>([]);
const approvalsLoading = ref(false);
const approvalPage = ref(1);
const approvalPageSize = ref(10);
const approvalTotal = ref(0);
const approvalStatusFilter = ref("");
const approvalTypeFilter = ref("");

const approvalStats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  conditional: 0
});

const members = ref<ProjectMemberListItem[]>([]);
const membersLoading = ref(false);
const memberPage = ref(1);
const memberPageSize = ref(10);
const memberTotal = ref(0);
const memberSearch = ref("");
const memberRoleFilter = ref("");
const allUsers = ref<UserListItem[]>([]);

const activities = ref<any[]>([]);
const activityPage = ref(1);
const activityPageSize = ref(10);
const activityTotal = ref(0);

const memberDialogVisible = ref(false);
const memberFormData = ref({
  userId: "",
  role: "developer"
});
const memberSubmitLoading = ref(false);

const addMemberDialogVisible = ref(false);
const addMemberFormData = ref({
  userId: "",
  role: "developer"
});
const addMemberSubmitLoading = ref(false);

const approvalDialogVisible = ref(false);
const approvalDialogTitle = ref("创建审批");
const approvalFormRef = ref<FormInstance>();
const approvalFormData = ref({
  signoffType: "",
  requirementId: "",
  milestone: "",
  comments: ""
});
const approvalSubmitLoading = ref(false);

const approvalRules: FormRules = {
  signoffType: [
    { required: true, message: "请选择审批类型", trigger: "change" }
  ],
  requirementId: [
    { required: true, message: "请选择关联需求", trigger: "change" }
  ]
};

const availableUsers = computed(() => {
  const memberUserIds = members.value.map(m => m.userId);
  return allUsers.value.filter(user => !memberUserIds.includes(user.id));
});

const loadProject = async () => {
  try {
    const res = await getProject(projectId.value);
    project.value = res;
  } catch (error: any) {
    ElMessage.error(error.message || "加载项目信息失败");
  }
};

const loadStatistics = async () => {
  statistics.value = {
    totalRequirements: 156,
    totalStories: 89,
    pendingApprovals: 12,
    completedRequirements: 98
  };
};

const loadStories = async () => {
  storiesLoading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    stories.value = [
      {
        id: "1",
        role: "系统管理员",
        want: "管理所有用户账户",
        soThat: "确保系统安全性和用户权限控制",
        storyPoints: 5,
        requirement: { title: "用户权限管理" },
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        role: "普通用户",
        want: "重置我的密码",
        soThat: "当我忘记密码时能够恢复账户访问",
        storyPoints: 3,
        requirement: { title: "密码找回功能" },
        createdAt: new Date().toISOString()
      }
    ];
    storyTotal.value = 2;
  } catch (error: any) {
    ElMessage.error(error.message || "加载故事列表失败");
  } finally {
    storiesLoading.value = false;
  }
};

const loadApprovalRequirements = async () => {
  try {
    const res = await getRequirementsByProject(projectId.value, {
      pageSize: 100
    });
    approvalRequirements.value = res.data;
  } catch (error: any) {
    console.error("加载审批需求列表失败", error);
  }
};

const loadApprovals = async () => {
  approvalsLoading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    approvals.value = [
      {
        id: "1",
        signoffType: "requirement",
        requirement: { title: "用户权限管理" },
        signoffStatus: "PENDING",
        signedBy: null,
        milestone: "V1.0",
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        signoffType: "release",
        requirement: { title: "用户登录功能" },
        signoffStatus: "APPROVED",
        signedBy: { name: "管理员" },
        signedAt: new Date().toISOString(),
        milestone: "V1.0",
        createdAt: new Date().toISOString()
      }
    ];
    approvalTotal.value = 2;
    approvalStats.value = {
      pending: 12,
      approved: 45,
      rejected: 5,
      conditional: 3
    };
  } catch (error: any) {
    ElMessage.error(error.message || "加载审批列表失败");
  } finally {
    approvalsLoading.value = false;
  }
};

const loadMembers = async () => {
  membersLoading.value = true;
  try {
    const res = await getProjectMembers(projectId.value);
    members.value = res;
    memberTotal.value = res.length;
  } catch (error: any) {
    ElMessage.error(error.message || "加载成员列表失败");
  } finally {
    membersLoading.value = false;
  }
};

const loadAllUsers = async () => {
  try {
    const res = await getAllUsers();
    allUsers.value = res.data;
  } catch (error: any) {
    console.error("加载用户列表失败", error);
  }
};

const loadActivities = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    activities.value = [
      {
        id: "1",
        type: "requirement",
        action: "创建了需求",
        description: '创建了需求"用户登录功能"',
        user: { name: "张三" },
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        type: "approval",
        action: "审批了需求",
        description: '批准了需求"用户登录功能"',
        user: { name: "管理员" },
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "3",
        type: "member",
        action: "添加了成员",
        description: "添加李四为项目开发者",
        user: { name: "管理员" },
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    activityTotal.value = 3;
  } catch (error: any) {
    ElMessage.error(error.message || "加载活动列表失败");
  }
};

const handleStorySearch = () => {
  storyPage.value = 1;
  loadStories();
};

const handleStorySizeChange = () => {
  storyPage.value = 1;
  loadStories();
};

const handleStoryPageChange = () => {
  loadStories();
};

const handleApprovalSizeChange = () => {
  approvalPage.value = 1;
  loadApprovals();
};

const handleApprovalPageChange = () => {
  loadApprovals();
};

const handleMemberSearch = () => {
  memberPage.value = 1;
  loadMembers();
};

const handleMemberFilterChange = () => {
  memberPage.value = 1;
  loadMembers();
};

const handleMemberSizeChange = () => {
  memberPage.value = 1;
  loadMembers();
};

const handleMemberPageChange = () => {
  loadMembers();
};

const handleActivitySizeChange = () => {
  activityPage.value = 1;
  loadActivities();
};

const handleActivityPageChange = () => {
  loadActivities();
};

const handleEdit = () => {
  ElMessage.info("编辑项目功能");
};

const handleBack = () => {
  router.push("/system/project");
};

const handleCreateRequirement = () => {
  ElMessage.info("创建需求功能");
};

const handleViewRequirement = (row: any) => {
  ElMessage.info(`查看需求: ${row.title}`);
};

const handleGenerateStories = (row: any) => {
  ElMessage.info(`为需求 "${row.title}" 生成故事`);
};

const handleEditRequirement = (row: any) => {
  ElMessage.info(`编辑需求: ${row.title}`);
};

const handleCreateStory = () => {
  ElMessage.info("创建故事功能");
};

const handleEditStory = (row: any) => {
  ElMessage.info(`编辑故事: ${row.id}`);
};

const handleDeleteStory = (row: any) => {
  ElMessage.warning(`删除故事: ${row.id}`);
};

const handleCreateApproval = () => {
  approvalDialogTitle.value = "创建审批";
  approvalFormData.value = {
    signoffType: "",
    requirementId: "",
    milestone: "",
    comments: ""
  };
  approvalDialogVisible.value = true;
};

const handleApprove = (row: any) => {
  ElMessage.success(`已批准: ${row.requirement?.title || "需求"}`);
  loadApprovals();
};

const handleReject = (row: any) => {
  ElMessage.warning(`已拒绝: ${row.requirement?.title || "需求"}`);
  loadApprovals();
};

const handleViewApproval = (row: any) => {
  ElMessage.info(`查看审批详情`);
};

const handleApprovalSubmit = async () => {
  if (!approvalFormRef.value) return;

  await approvalFormRef.value.validate(async valid => {
    if (valid) {
      approvalSubmitLoading.value = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        ElMessage.success("审批创建成功");
        approvalDialogVisible.value = false;
        loadApprovals();
      } catch (error: any) {
        ElMessage.error(error.message || "创建审批失败");
      } finally {
        approvalSubmitLoading.value = false;
      }
    }
  });
};

const handleAddMember = () => {
  addMemberFormData.value = {
    userId: "",
    role: "developer"
  };
  addMemberDialogVisible.value = true;
};

const handleAddMemberSubmit = async () => {
  if (!addMemberFormData.value.userId) {
    ElMessage.warning("请选择用户");
    return;
  }

  addMemberSubmitLoading.value = true;
  try {
    await addProjectMember(projectId.value, {
      userId: addMemberFormData.value.userId,
      role: addMemberFormData.value.role
    });
    ElMessage.success("添加成员成功");
    addMemberDialogVisible.value = false;
    await loadMembers();
  } catch (error: any) {
    ElMessage.error(error.message || "添加成员失败");
  } finally {
    addMemberSubmitLoading.value = false;
  }
};

const handleEditMember = (row: any) => {
  memberFormData.value = {
    userId: row.userId,
    role: row.role
  };
  memberDialogVisible.value = true;
};

const handleUpdateMember = async () => {
  memberSubmitLoading.value = true;
  try {
    await updateProjectMember(projectId.value, memberFormData.value.userId, {
      role: memberFormData.value.role
    });
    ElMessage.success("成员角色更新成功");
    memberDialogVisible.value = false;
    await loadMembers();
  } catch (error: any) {
    ElMessage.error(error.message || "更新成员角色失败");
  } finally {
    memberSubmitLoading.value = false;
  }
};

const handleRemoveMember = async (row: any) => {
  try {
    await removeProjectMember(projectId.value, row.userId);
    ElMessage.success("成员已移除");
    await loadMembers();
  } catch (error: any) {
    ElMessage.error(error.message || "移除成员失败");
  }
};

const formatDate = (date: any) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("zh-CN");
};

const getApprovalTypeText = (type?: string) => {
  const textMap: Record<string, string> = {
    requirement: "需求审批",
    release: "发布审批",
    change: "变更审批"
  };
  return textMap[type || ""] || "未知";
};

const getApprovalStatusType = (status?: string) => {
  const typeMap: Record<string, any> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
    CONDITIONAL: "info"
  };
  return typeMap[status || "PENDING"] || "info";
};

const getApprovalStatusText = (status?: string) => {
  const textMap: Record<string, string> = {
    PENDING: "待审批",
    APPROVED: "已批准",
    REJECTED: "已拒绝",
    CONDITIONAL: "有条件批准"
  };
  return textMap[status || "PENDING"] || "未知";
};

const getMemberRoleType = (role?: string) => {
  const typeMap: Record<string, any> = {
    admin: "danger",
    developer: "primary",
    viewer: "info"
  };
  return typeMap[role || "developer"] || "info";
};

const getMemberRoleText = (role?: string) => {
  const textMap: Record<string, string> = {
    admin: "管理员",
    developer: "开发者",
    viewer: "观察者"
  };
  return textMap[role || "developer"] || "未知";
};

const getActivityType = (type?: string) => {
  const typeMap: Record<string, any> = {
    requirement: "primary",
    approval: "success",
    member: "warning",
    story: "info"
  };
  return typeMap[type || "info"] || "info";
};

onMounted(async () => {
  await Promise.all([
    loadProject(),
    loadStatistics(),
    loadStories(),
    loadApprovals(),
    loadApprovalRequirements(),
    loadMembers(),
    loadActivities()
  ]);
});

defineOptions({
  name: "ProjectDetail"
});
</script>

<style scoped lang="scss">
.project-detail {
  min-height: calc(100vh - 140px);
  padding: 20px;
  background: var(--el-bg-color-page);
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.stat-content {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stat-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  color: white;
  border-radius: 12px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    color: var(--el-text-color-primary);
  }

  .stat-label {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.tabs-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}

.project-tabs {
  :deep(.el-tabs__header) {
    padding: 16px 20px 0;
    margin: 0 0 0 20px;
    background: var(--el-fill-color-light);
    border-radius: 8px 8px 0 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__content) {
    padding: 20px;
  }
}

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

.data-table {
  :deep(.el-table__header) {
    th {
      font-weight: 600;
      color: var(--el-text-color-primary);
      background-color: var(--el-fill-color-light);
    }
  }
}

.requirement-title {
  display: flex;
  gap: 8px;
  align-items: center;
  color: var(--el-color-primary);
  cursor: pointer;

  .title-icon {
    flex-shrink: 0;
  }

  &:hover {
    text-decoration: underline;
  }
}

.assignee-info,
.member-info,
.signer-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.member-info {
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

.text-muted {
  font-size: 13px;
  color: var(--el-text-color-secondary);
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

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

@media (width <= 768px) {
  .project-detail {
    padding: 12px;
  }

  .stats-row {
    .el-col {
      margin-bottom: 12px;
    }
  }

  .data-table {
    :deep(.el-table) {
      overflow-x: auto;

      &::before {
        display: none;
      }
    }
  }
}
</style>
