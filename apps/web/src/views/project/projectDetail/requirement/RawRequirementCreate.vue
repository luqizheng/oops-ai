<template>
  <ProjectHeaderCard :projectId="projectId" :subtitle="dialogTitle" />
  <div class="raw-requirement-detail">
    <el-card shadow="never" class="detail-card">
      <el-form
        ref="formRef"
        :model="formData"
        label-width="100px"
        :rules="rules"
      >
        <el-form-item label="需求内容" required prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="8"
            placeholder="请输入原始需求内容"
          />
          <div class="form-actions" style="margin-top: 12px; text-align: right">
            <el-button
              type="primary"
              :loading="analyzing"
              :disabled="!formData.content.trim()"
              @click="handleAnalyze"
            >
              <el-icon><MagicStick /></el-icon>
              分析需求
            </el-button>
          </div>
        </el-form-item>

        <!-- AI 分析结果 -->
        <div v-if="structuredRequirements.length > 0" class="analysis-results">
          <h4 style="margin-bottom: 12px">AI 分析结果</h4>
          <div
            v-for="(requirement, index) in structuredRequirements"
            :key="requirement.id"
            class="requirement-item"
          >
            <el-card
              class="result-card"
              shadow="hover"
              :body-style="{ padding: '16px' }"
            >
              <div class="requirement-header">
                <h5>
                  {{ requirement.title }}
                  <el-tag
                    :type="getTypeColor(requirement.type)"
                    size="small"
                    style="margin-left: 8px"
                  >
                    {{ getTypeLabel(requirement.type) }}
                  </el-tag>
                  <el-tag
                    :type="getPriorityColor(requirement.priority)"
                    size="small"
                    style="margin-left: 8px"
                  >
                    {{ getPriorityLabel(requirement.priority) }}
                  </el-tag>
                </h5>
                <el-button
                  v-if="requirement.changes"
                  type="info"
                  size="small"
                  @click="showChangeLog(requirement)"
                >
                  查看变更
                </el-button>
              </div>
              <div class="requirement-description">
                {{ requirement.description }}
              </div>
              <div
                class="acceptance-criteria"
                v-if="requirement.acceptanceCriteria.length > 0"
              >
                <h6>验收标准:</h6>
                <ul>
                  <li
                    v-for="(criteria, idx) in requirement.acceptanceCriteria"
                    :key="idx"
                  >
                    {{ criteria }}
                  </li>
                </ul>
              </div>
              <div class="requirement-notes" v-if="requirement.notes">
                <h6>备注:</h6>
                <p>{{ requirement.notes }}</p>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 追问列表 -->
        <div v-if="pendingQuestions.length > 0" class="questions-section">
          <h4 style="margin-bottom: 12px">AI 追问</h4>
          <div
            v-for="(question, index) in pendingQuestions"
            :key="question.id"
            class="question-item"
          >
            <el-card shadow="hover" :body-style="{ padding: '16px' }">
              <div class="question-header">
                <span class="question-text">{{ question.question }}</span>
                <el-tag size="small" style="margin-left: 8px">
                  {{ getAnswerTypeLabel(question.answerType) }}
                </el-tag>
              </div>
              <el-input
                v-model="questionAnswers[question.id]"
                type="textarea"
                :rows="3"
                placeholder="请输入您的回答"
                style="margin-top: 12px"
              />
            </el-card>
          </div>
          <div style="margin-top: 16px; text-align: right">
            <el-button
              type="primary"
              :loading="analyzing"
              :disabled="!hasAllAnswers()"
              @click="handleContinueAnalyze"
            >
              <el-icon><MagicStick /></el-icon>
              继续分析
            </el-button>
          </div>
        </div>

        <!-- 分析完成提示 -->
        <div v-if="analysisComplete" class="completion-section">
          <el-alert
            title="需求分析已完成"
            type="success"
            description="所有需求已澄清，可以将结果保存为正式需求。"
            show-icon
            :closable="false"
          />
        </div>

        <el-form-item label="来源类型" prop="sourceType">
          <el-select
            v-model="formData.sourceType"
            placeholder="选择来源类型"
            style="width: 100%"
          >
            <el-option
              v-for="option in getSourceTypeOptions()"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="提出人">
          <el-input v-model="formData.proposedBy" placeholder="请输入提出人" />
        </el-form-item>
        <el-form-item label="场景">
          <el-input v-model="formData.scenario" placeholder="请输入使用场景" />
        </el-form-item>
      </el-form>

      <div class="form-footer">
        <el-button @click="handleBack">取消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElForm } from "element-plus";
import { MagicStick, Delete } from "@element-plus/icons-vue";
import { useRouter, useRoute } from "vue-router";

import ProjectHeaderCard from "@/components/Project/ProjectHeaderCard.vue";
const router = useRouter();
const route = useRoute();

const projectId = computed(() => route.params.id as string);
const requirementId = computed(
  () => route.params.requirementId as string | undefined
);
const dialogMode = ref<"add" | "edit">(requirementId.value ? "edit" : "add");

// 加载需求详情
const loadRequirementDetail = async () => {
  if (!requirementId.value) return;

  try {
    const { getRawRequirement } = await import("@/api/system/requirement");
    const res = await getRawRequirement(requirementId.value);
    formData.value = {
      content: res.content,
      sourceType: res.sourceType || "",
      sourceMeta: res.sourceMeta,
      proposedBy: res.proposedBy || "",
      proposedAt: res.proposedAt,
      scenario: res.scenario || ""
    };
  } catch (error: any) {
    ElMessage.error(error.message || "加载需求详情失败");
  }
};

// 在组件挂载时加载需求详情
onMounted(() => {
  if (dialogMode.value === "edit") {
    loadRequirementDetail();
  }
});

const formRef = ref<InstanceType<typeof ElForm>>();
const formData = ref({
  content: "",
  sourceType: "",
  sourceMeta: undefined as any,
  proposedBy: "",
  proposedAt: undefined as Date | undefined,
  scenario: ""
});

const submitLoading = ref(false);
const analyzing = ref(false);
const analysisSessionId = ref<string | null>(null);
const structuredRequirements = ref<any[]>([]);
const pendingQuestions = ref<any[]>([]);
const questionAnswers = ref<Record<string, string>>({});
const analysisComplete = ref(false);

const rules = {
  content: [{ required: true, message: "请输入原始需求内容", trigger: "blur" }],
  sourceType: [{ required: true, message: "请选择来源类型", trigger: "change" }]
};

const dialogTitle = computed(() => {
  if (dialogMode.value === "add") return "添加原始需求";
  return "编辑原始需求";
});

// AI 需求分析
const handleAnalyze = async () => {
  if (!formData.value.content.trim()) {
    ElMessage.warning("请输入原始需求内容");
    return;
  }

  analyzing.value = true;
  try {
    // 导入分析接口
    const { analyzeRequirement } = await import("@/api/system/requirement");
    const res = await analyzeRequirement(formData.value.content);

    // 更新会话ID和分析结果
    analysisSessionId.value = res.sessionId;
    structuredRequirements.value = res.requirements || [];
    pendingQuestions.value = res.pendingQuestions || [];

    // 初始化问题回答
    questionAnswers.value = {};
    pendingQuestions.value.forEach(question => {
      questionAnswers.value[question.id] = "";
    });

    analysisComplete.value = res.isComplete || false;
    ElMessage.success("需求分析完成");
  } catch (error: any) {
    ElMessage.error(error.message || "需求分析失败");
  } finally {
    analyzing.value = false;
  }
};

// 继续分析（回答追问后）
const handleContinueAnalyze = async () => {
  if (!formData.value.content.trim() || !analysisSessionId.value) {
    ElMessage.warning("请先进行初始需求分析");
    return;
  }

  if (!hasAllAnswers()) {
    ElMessage.warning("请回答所有追问");
    return;
  }

  analyzing.value = true;
  try {
    // 导入分析接口
    const { analyzeRequirement } = await import("@/api/system/requirement");

    // 准备回答数据
    const answers = pendingQuestions.value.map(question => ({
      questionId: question.id,
      answer: questionAnswers.value[question.id]
    }));

    const res = await analyzeRequirement(
      formData.value.content,
      analysisSessionId.value,
      answers
    );

    // 更新分析结果
    structuredRequirements.value = res.requirements || [];
    pendingQuestions.value = res.pendingQuestions || [];

    // 初始化新的问题回答
    questionAnswers.value = {};
    pendingQuestions.value.forEach(question => {
      questionAnswers.value[question.id] = "";
    });

    analysisComplete.value = res.isComplete || false;
    ElMessage.success("需求分析更新完成");
  } catch (error: any) {
    ElMessage.error(error.message || "需求分析失败");
  } finally {
    analyzing.value = false;
  }
};

// 检查是否所有追问都已回答
const hasAllAnswers = () => {
  return (
    pendingQuestions.value.length > 0 &&
    pendingQuestions.value.every(question => questionAnswers.value[question.id]?.trim())
  );
};

// 显示需求变更日志
const showChangeLog = (requirement: any) => {
  ElMessage.info(`变更记录: ${requirement.changes}`);
};

// 获取需求类型标签
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'FUNCTIONAL': '功能需求',
    'NFR': '非功能需求',
    'SECURITY': '安全需求',
    'UI_UX': 'UI/UX需求',
    'PERFORMANCE': '性能需求'
  };
  return typeMap[type] || type;
};

// 获取需求类型颜色
const getTypeColor = (type: string):elTagType=> {
  const colorMap: Record<string, elTagType> = {
    'FUNCTIONAL': 'primary',
    'NFR': 'success',
    'SECURITY': 'danger',
    'UI_UX': 'warning',
    'PERFORMANCE': 'info'
  };
  return colorMap[type] || undefined;
};

// 获取优先级标签
const getPriorityLabel = (priority: string) => {
  const priorityMap: Record<string, string> = {
    'HIGH': '高',
    'MEDIUM': '中',
    'LOW': '低'
  };
  return priorityMap[priority] || priority;
};
type elTagType = "primary" | "success" | "info" | "warning" | "danger"|undefined;
// 获取优先级颜色
const getPriorityColor = (priority: string) :elTagType=> {
  const colorMap: Record<string, elTagType> = {
    'HIGH': 'danger',
    'MEDIUM': 'warning',
    'LOW': 'success'
  };
  return colorMap[priority] || undefined;
};

// 获取回答类型标签
const getAnswerTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'text': '文本',
    'number': '数字',
    'select': '选择',
    'boolean': '布尔值'
  };
  return typeMap[type] || type;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (valid) {
      // 检查是否有未回答的追问问题
      const hasUnansweredQuestion = pendingQuestions.value.some(question => {
        return !questionAnswers.value[question.id]?.trim();
      });

      if (hasUnansweredQuestion) {
        ElMessage.warning("请回答所有追问问题");
        return;
      }

      submitLoading.value = true;
      try {
        // 整合AI分析结果到 sourceMeta
        const submitData = { ...formData.value };

        // 添加AI分析结果
        const aiAnalysisData = {
          sessionId: analysisSessionId.value,
          requirements: structuredRequirements.value,
          pendingQuestions: pendingQuestions.value,
          answeredQuestions: pendingQuestions.value.map(question => ({
            questionId: question.id,
            question: question.question,
            answer: questionAnswers.value[question.id]
          })),
          isComplete: analysisComplete.value
        };

        submitData.sourceMeta = {
          ...submitData.sourceMeta,
          aiAnalysis: aiAnalysisData
        };

        const requirementApi = await import("@/api/system/requirement");

        if (dialogMode.value === "edit" && requirementId.value) {
          await requirementApi.updateRawRequirement(
            requirementId.value,
            submitData
          );
          ElMessage.success("原始需求更新成功");
        } else {
          await requirementApi.createRawRequirement(
            projectId.value,
            submitData
          );
          ElMessage.success("原始需求创建成功");
        }

        handleBack();
      } catch (error: any) {
        ElMessage.error(error.message || "操作失败");
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

const handleBack = () => {
  router.push(`/system/project/${projectId.value}`);
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
</script>

<style scoped lang="scss">
.raw-requirement-detail {
  padding: 20px;
  background: var(--el-bg-color-page);
  min-height: calc(100vh - 140px);

  .detail-card {
    max-width: 800px;
    margin: 0 auto;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .form-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }

  // AI 分析样式
  .analysis-results {
    margin-top: 20px;
    margin-bottom: 20px;

    h4 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .result-card {
      margin-bottom: 12px;
    }
  }

  // 追问样式
  .questions-section {
    margin-top: 20px;
    margin-bottom: 20px;

    h4 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .question-item {
      margin-bottom: 16px;

      .question-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;

        .question-text {
          flex: 1;
          margin-right: 12px;
          font-weight: 500;
          line-height: 1.6;
        }
      }
    }
  }

  // 表单操作样式
  .form-actions {
    margin-top: 12px;
    text-align: right;
  }

  @media (width <= 768px) {
    padding: 12px;

    .detail-card {
      max-width: 100%;
    }
  }
}
</style>
