import { ref } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { getRequirementsByProject } from "@/api/system/requirement";
import type { RequirementListItem } from "@oops-ai/shared";

export interface Approval {
  id: string;
  signoffType: string;
  requirement?: { title: string };
  signoffStatus: string;
  signedBy?: { name: string };
  signedAt?: string;
  milestone?: string;
  createdAt: string;
}

export interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  conditional: number;
}

export const useApprovals = () => {
  const approvals = ref<Approval[]>([]);
  const loading = ref(false);
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const statusFilter = ref("");
  const typeFilter = ref("");
  const stats = ref<ApprovalStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    conditional: 0
  });

  const requirements = ref<RequirementListItem[]>([]);

  const dialogVisible = ref(false);
  const dialogTitle = ref("创建审批");
  const formRef = ref<FormInstance>();
  const submitLoading = ref(false);
  const formData = ref({
    signoffType: "",
    requirementId: "",
    milestone: "",
    comments: ""
  });

  const rules: FormRules = {
    signoffType: [
      { required: true, message: "请选择审批类型", trigger: "change" }
    ],
    requirementId: [
      { required: true, message: "请选择关联需求", trigger: "change" }
    ]
  };

  const loadApprovals = async () => {
    loading.value = true;
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
      total.value = 2;
      stats.value = {
        pending: 12,
        approved: 45,
        rejected: 5,
        conditional: 3
      };
    } catch (error: any) {
      ElMessage.error(error.message || "加载审批列表失败");
    } finally {
      loading.value = false;
    }
  };

  const loadRequirements = async () => {
    try {
      const res = await getRequirementsByProject("", { pageSize: 100 });
      requirements.value = res.data;
    } catch (error: any) {
      console.error("加载审批需求列表失败", error);
    }
  };

  const handleSizeChange = () => {
    page.value = 1;
    loadApprovals();
  };

  const handlePageChange = () => {
    loadApprovals();
  };

  const handleFilterChange = () => {
    page.value = 1;
    loadApprovals();
  };

  const handleCreate = () => {
    dialogTitle.value = "创建审批";
    formData.value = {
      signoffType: "",
      requirementId: "",
      milestone: "",
      comments: ""
    };
    dialogVisible.value = true;
  };

  const handleApprove = (row: Approval) => {
    ElMessage.success(`已批准: ${row.requirement?.title || "需求"}`);
    loadApprovals();
  };

  const handleReject = (row: Approval) => {
    ElMessage.warning(`已拒绝: ${row.requirement?.title || "需求"}`);
    loadApprovals();
  };

  const handleView = (_row: Approval) => {
    ElMessage.info(`查看审批详情`);
  };

  const handleSubmit = async () => {
    if (!formRef.value) return;

    await formRef.value.validate(async valid => {
      if (valid) {
        submitLoading.value = true;
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          ElMessage.success("审批创建成功");
          dialogVisible.value = false;
          loadApprovals();
        } catch (error: any) {
          ElMessage.error(error.message || "创建审批失败");
        } finally {
          submitLoading.value = false;
        }
      }
    });
  };

  const getTypeText = (type?: string) => {
    const textMap: Record<string, string> = {
      requirement: "需求审批",
      release: "发布审批",
      change: "变更审批"
    };
    return textMap[type || ""] || "未知";
  };

  const getStatusType = (status?: string) => {
    const typeMap: Record<string, any> = {
      PENDING: "warning",
      APPROVED: "success",
      REJECTED: "danger",
      CONDITIONAL: "info"
    };
    return typeMap[status || "PENDING"] || "info";
  };

  const getStatusText = (status?: string) => {
    const textMap: Record<string, string> = {
      PENDING: "待审批",
      APPROVED: "已批准",
      REJECTED: "已拒绝",
      CONDITIONAL: "有条件批准"
    };
    return textMap[status || "PENDING"] || "未知";
  };

  return {
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
  };
};
