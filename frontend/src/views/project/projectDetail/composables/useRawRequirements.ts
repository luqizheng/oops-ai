import { ref } from "vue";
import { ElMessage } from "element-plus";
import {
  getRawRequirementsByProject,
  getRawRequirement,
  createRawRequirement,
  updateRawRequirement,
  deleteRawRequirement,
  analyzeRequirement
} from "@/api/system/requirement";
import type { RawRequirement } from "@oops-ai/shared";

export const useRawRequirements = (projectId: string) => {
  const rawRequirements = ref<RawRequirement[]>([]);
  const loading = ref(false);
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const search = ref("");

  const dialogVisible = ref(false);
  const dialogMode = ref<"add" | "edit" | "view">("add");
  const currentRawRequirement = ref<RawRequirement | null>(null);
  const formData = ref({
    content: "",
    sourceType: "",
    sourceMeta: undefined as any,
    proposedBy: "",
    proposedAt: undefined as Date | undefined,
    scenario: ""
  });
  const submitLoading = ref(false);

  // AI 分析相关状态
  const analyzing = ref(false);
  const analysisResults = ref<string[]>([]);
  const questions = ref<string[]>([]);
  const questionAnswers = ref<string[]>([]);

  const loadRawRequirements = async () => {
    loading.value = true;
    try {
      const res = await getRawRequirementsByProject(projectId);
      rawRequirements.value = res;
      total.value = res.length;
    } catch (error: any) {
      ElMessage.error(error.message || "加载原始需求列表失败");
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    page.value = 1;
    loadRawRequirements();
  };

  const handleSizeChange = () => {
    page.value = 1;
    loadRawRequirements();
  };

  const handlePageChange = () => {
    loadRawRequirements();
  };

  const handleAdd = () => {
    dialogMode.value = "add";
    currentRawRequirement.value = null;
    formData.value = {
      content: "",
      sourceType: "",
      sourceMeta: undefined,
      proposedBy: "",
      proposedAt: undefined,
      scenario: ""
    };
    // 重置 AI 分析相关状态
    analyzing.value = false;
    analysisResults.value = [];
    questions.value = [];
    questionAnswers.value = [];
    dialogVisible.value = true;
  };

  // AI 需求分析
  const handleAnalyze = async () => {
    if (!formData.value.content.trim()) {
      ElMessage.warning("请输入原始需求内容");
      return;
    }

    analyzing.value = true;
    try {
      const res = await analyzeRequirement(formData.value.content);
      analysisResults.value = res.analysisResults || [];
      questions.value = res.questions || [];
      // 为每个问题初始化空答案
      questionAnswers.value = questions.value.map(() => "");
      ElMessage.success("需求分析完成");
    } catch (error: any) {
      ElMessage.error(error.message || "需求分析失败");
    } finally {
      analyzing.value = false;
    }
  };

  // 删除追问
  const handleDeleteQuestion = (index: number) => {
    questions.value.splice(index, 1);
    questionAnswers.value.splice(index, 1);
  };

  const handleEdit = (row: RawRequirement) => {
    dialogMode.value = "edit";
    currentRawRequirement.value = row;
    formData.value = {
      content: row.content,
      sourceType: row.sourceType || "",
      sourceMeta: row.sourceMeta,
      proposedBy: row.proposedBy || "",
      proposedAt: row.proposedAt,
      scenario: row.scenario || ""
    };
    // 重置 AI 分析相关状态（编辑模式不显示分析结果）
    analyzing.value = false;
    analysisResults.value = [];
    questions.value = [];
    questionAnswers.value = [];
    dialogVisible.value = true;
  };

  const handleView = async (row: RawRequirement) => {
    try {
      const res = await getRawRequirement(row.id);
      currentRawRequirement.value = res;
      dialogMode.value = "view";
      dialogVisible.value = true;
    } catch (error: any) {
      ElMessage.error(error.message || "获取原始需求详情失败");
    }
  };

  const handleSubmit = async () => {
    if (!formData.value.content.trim()) {
      ElMessage.warning("请输入原始需求内容");
      return;
    }

    // 检查是否有未回答的追问问题
    const hasUnansweredQuestion = questions.value.some((_, index) => {
      return !questionAnswers.value[index].trim();
    });

    if (hasUnansweredQuestion) {
      ElMessage.warning("请回答所有追问问题");
      return;
    }

    submitLoading.value = true;
    try {
      // 整合追问答案到 sourceMeta
      const submitData = { ...formData.value };
      if (questions.value.length > 0) {
        submitData.sourceMeta = {
          ...submitData.sourceMeta,
          aiAnalysis: {
            questions: questions.value,
            answers: questionAnswers.value
          }
        };
      }

      if (dialogMode.value === "add") {
        await createRawRequirement(projectId, submitData);
        ElMessage.success("原始需求创建成功");
      } else if (currentRawRequirement.value) {
        await updateRawRequirement(currentRawRequirement.value.id, submitData);
        ElMessage.success("原始需求更新成功");
      }
      dialogVisible.value = false;
      await loadRawRequirements();
    } catch (error: any) {
      ElMessage.error(error.message || "操作失败");
    } finally {
      submitLoading.value = false;
    }
  };

  const handleDelete = async (row: RawRequirement) => {
    try {
      await deleteRawRequirement(row.id);
      ElMessage.success("原始需求删除成功");
      await loadRawRequirements();
    } catch (error: any) {
      ElMessage.error(error.message || "删除失败");
    }
  };

  const getSourceTypeText = (type?: string) => {
    const textMap: Record<string, string> = {
      meeting: "会议记录",
      interview: "访谈",
      document: "文档",
      email: "邮件",
      survey: "问卷调查",
      observation: "观察",
      other: "其他"
    };
    return textMap[type || "other"] || "其他";
  };

  const getSourceTypeOptions = () => [
    { label: "会议记录", value: "meeting" },
    { label: "访谈", value: "interview" },
    { label: "文档", value: "document" },
    { label: "邮件", value: "email" },
    { label: "问卷调查", value: "survey" },
    { label: "观察", value: "observation" },
    { label: "其他", value: "other" }
  ];

  return {
    rawRequirements,
    loading,
    page,
    pageSize,
    total,
    search,
    dialogVisible,
    dialogMode,
    currentRawRequirement,
    formData,
    submitLoading,
    analyzing,
    analysisResults,
    questions,
    questionAnswers,
    loadRawRequirements,
    handleSearch,
    handleSizeChange,
    handlePageChange,
    handleAdd,
    handleEdit,
    handleView,
    handleSubmit,
    handleDelete,
    handleAnalyze,
    handleDeleteQuestion,
    getSourceTypeText,
    getSourceTypeOptions
  };
};
