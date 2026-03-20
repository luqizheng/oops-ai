<template>
  <div class="raw-requirement-detail">
    <el-card shadow="never" class="detail-card">
      <template #header>
        <div class="card-header">
          <h3>{{ dialogTitle }}</h3>
          <el-button 
            type="primary" 
            size="small"
            @click="handleBack"
          >
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
        </div>
      </template>

      <el-form
        :model="formData"
        label-width="100px"
        :rules="rules"
        ref="formRef"
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
        <div v-if="analysisResults.length > 0" class="analysis-results">
          <h4 style="margin-bottom: 12px">AI 分析结果</h4>
          <el-card
            class="result-card"
            shadow="hover"
            :body-style="{ padding: '12px' }"
          >
            <el-timeline>
              <el-timeline-item
                v-for="(result, index) in analysisResults"
                :key="index"
                timestamp=""
                color="#2080f0"
              >
                {{ result }}
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </div>

        <!-- 追问列表 -->
        <div v-if="questions.length > 0" class="questions-section">
          <h4 style="margin-bottom: 12px">AI 追问</h4>
          <div
            v-for="(question, index) in questions"
            :key="index"
            class="question-item"
          >
            <el-card shadow="hover" :body-style="{ padding: '16px' }">
              <div class="question-header">
                <span class="question-text">{{ question }}</span>
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDeleteQuestion(index)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
              <el-input
                v-model="questionAnswers[index]"
                type="textarea"
                :rows="3"
                placeholder="请输入您的回答"
                style="margin-top: 12px"
              />
            </el-card>
          </div>
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
import { ref, computed } from "vue";
import { ElMessage, ElForm } from "element-plus";
import { ArrowLeft, MagicStick, Delete } from "@element-plus/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { createRawRequirement } from "@/api/system/requirement";

const router = useRouter();
const route = useRoute();

const projectId = computed(() => route.params.id as string);
const dialogMode = ref<"add" | "edit">("add");

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
const analysisResults = ref<string[]>([]);
const questions = ref<string[]>([]);
const questionAnswers = ref<string[]>([]);

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
    // 这里需要导入分析接口
    const { analyzeRequirement } = await import("@/api/system/requirement");
    const res = await analyzeRequirement(formData.value.content);
    analysisResults.value = res.analysisResults || [];
    questions.value = res.questions || [];
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

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
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

        await createRawRequirement(projectId.value, submitData);
        ElMessage.success("原始需求创建成功");
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