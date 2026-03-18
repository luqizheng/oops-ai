<template>
  <div class="space-y-8 p-4 max-w-6xl mx-auto">
    <!-- 输入区域卡片 -->
    <div
      class="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300"
    >
      <div class="flex items-center space-x-3 mb-6">
        <div
          class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"
        >
          <el-icon size="20"><EditPen /></el-icon>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 tracking-tight">
            需求分析
          </h2>
          <p class="text-sm text-gray-500">输入您的业务想法，让 AI 协助完善</p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="relative group">
          <label
            class="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600"
          >
            需求描述
          </label>
          <el-input
            v-model="requirementText"
            @input="analyzeFuzzyWords"
            type="textarea"
            :rows="6"
            placeholder="请输入您的需求描述，例如：'用户希望系统响应速度更快'..."
            class="requirement-textarea"
          />
        </div>

        <!-- 模糊词警告面板 -->
        <transition name="el-fade-in-linear">
          <div
            v-if="fuzzyWordsAnalysis.fuzzyWords.length > 0"
            class="p-5 bg-amber-50/50 border border-amber-100 rounded-xl flex gap-4"
          >
            <el-icon class="text-amber-500 mt-1" size="20"><Warning /></el-icon>
            <div>
              <h3 class="text-sm font-bold text-amber-900 mb-2">
                模糊词检测建议
              </h3>
              <div
                class="text-sm text-amber-800/80 leading-relaxed mb-3"
                v-html="highlightedText"
              ></div>
              <p class="text-xs font-medium text-amber-600/80">
                {{ fuzzyWordsAnalysis.suggestion }}
              </p>
            </div>
          </div>
        </transition>

        <div class="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
          <el-button
            @click="generateQuestions"
            :disabled="!requirementText"
            type="primary"
            class="action-btn !bg-indigo-600 !border-indigo-600"
          >
            <el-icon class="mr-1.5"><Help /></el-icon>
            生成追问
          </el-button>
          <el-button
            @click="generateUserStories"
            :disabled="!requirementText"
            type="success"
            class="action-btn !bg-emerald-600 !border-emerald-600"
          >
            <el-icon class="mr-1.5"><User /></el-icon>
            生成用户故事
          </el-button>
          <el-button
            @click="generateAcceptanceCriteria"
            :disabled="!requirementText"
            type="warning"
            class="action-btn !bg-amber-500 !border-amber-500"
          >
            <el-icon class="mr-1.5"><CircleCheck /></el-icon>
            生成验收条件
          </el-button>
          <el-button
            @click="getQualityScore"
            :disabled="!requirementText"
            type="danger"
            class="action-btn !bg-rose-500 !border-rose-500"
          >
            <el-icon class="mr-1.5"><Trophy /></el-icon>
            质量评分
          </el-button>
        </div>
      </div>
    </div>

    <!-- 结果展示区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <!-- 智能追问 -->
      <transition name="el-zoom-in-top">
        <div
          v-if="questions.length > 0"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <h3 class="text-xl font-bold mb-6 flex items-center text-gray-900">
            <span class="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
            智能追问
          </h3>
          <div class="space-y-4">
            <div
              v-for="(question, index) in questions"
              :key="index"
              class="p-5 bg-slate-50 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group"
            >
              <div class="flex gap-4">
                <span
                  class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center"
                  >{{ index + 1 }}</span
                >
                <div>
                  <p class="font-bold text-gray-800 leading-snug">
                    {{ question.question }}
                  </p>
                  <span
                    class="inline-block mt-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-400 rounded-md group-hover:text-indigo-400 group-hover:border-indigo-100"
                  >
                    {{ question.type }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 质量评分 -->
      <transition name="el-zoom-in-top">
        <div
          v-if="qualityScore"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full"
        >
          <h3 class="text-xl font-bold mb-6 flex items-center text-gray-900">
            <span class="w-1.5 h-6 bg-rose-500 rounded-full mr-3"></span>
            质量分析报告
          </h3>
          <div class="space-y-6">
            <div
              class="flex items-center justify-between p-6 bg-rose-50 rounded-2xl border border-rose-100/50"
            >
              <div>
                <p
                  class="text-sm font-bold text-rose-900/60 uppercase tracking-widest mb-1"
                >
                  综合质量评分
                </p>
                <div class="text-4xl font-black text-rose-600">
                  {{ qualityScore.totalScore
                  }}<span class="text-xl text-rose-300 ml-1">/10</span>
                </div>
              </div>
              <el-progress
                type="circle"
                :percentage="qualityScore.totalScore * 10"
                :width="100"
                :stroke-width="10"
                color="#e11d48"
              >
                <template #default>
                  <el-icon size="40" color="#e11d48"><Odometer /></el-icon>
                </template>
              </el-progress>
            </div>

            <div class="grid grid-cols-1 gap-4">
              <div class="score-bar">
                <div
                  class="flex justify-between text-sm font-bold text-gray-700 mb-2"
                >
                  <span>清晰度 (Clarity)</span>
                  <span class="text-indigo-600"
                    >{{ qualityScore.clarity * 10 }}%</span
                  >
                </div>
                <el-progress
                  :percentage="qualityScore.clarity * 10"
                  :show-text="false"
                  color="#6366f1"
                />
              </div>
              <div class="score-bar">
                <div
                  class="flex justify-between text-sm font-bold text-gray-700 mb-2"
                >
                  <span>可测试性 (Testability)</span>
                  <span class="text-emerald-600"
                    >{{ qualityScore.testability * 10 }}%</span
                  >
                </div>
                <el-progress
                  :percentage="qualityScore.testability * 10"
                  :show-text="false"
                  color="#10b981"
                />
              </div>
              <div class="score-bar">
                <div
                  class="flex justify-between text-sm font-bold text-gray-700 mb-2"
                >
                  <span>完整性 (Completeness)</span>
                  <span class="text-purple-600"
                    >{{ qualityScore.completeness * 10 }}%</span
                  >
                </div>
                <el-progress
                  :percentage="qualityScore.completeness * 10"
                  :show-text="false"
                  color="#a855f7"
                />
              </div>
            </div>

            <div class="pt-6 border-t border-gray-50">
              <h4
                class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4"
              >
                优化核心建议
              </h4>
              <ul class="space-y-3">
                <li
                  v-for="(suggestion, index) in qualityScore.suggestions"
                  :key="index"
                  class="flex gap-3 text-sm text-gray-600 font-medium"
                >
                  <el-icon class="text-rose-400 mt-0.5"><Right /></el-icon>
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </transition>

      <!-- 用户故事 -->
      <transition name="el-zoom-in-top">
        <div
          v-if="userStories.length > 0"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:col-span-2"
        >
          <h3 class="text-xl font-bold mb-8 flex items-center text-gray-900">
            <span class="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
            标准化用户故事集
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="(story, index) in userStories"
              :key="index"
              class="user-story-card"
            >
              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"
                  >
                    <el-icon><Avatar /></el-icon>
                  </div>
                  <span
                    class="text-sm font-black text-emerald-900 tracking-tight"
                    >{{ story.role }}</span
                  >
                </div>
                <div
                  v-if="story.storyPoints"
                  class="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-400"
                >
                  PT: {{ story.storyPoints }}
                </div>
              </div>
              <div class="space-y-2 text-[15px] font-medium leading-relaxed">
                <p>
                  <span class="text-slate-400 font-bold mr-2 text-xs uppercase"
                    >Action</span
                  >
                  {{ story.feature }}
                </p>
                <p>
                  <span class="text-slate-400 font-bold mr-2 text-xs uppercase"
                    >Value</span
                  >
                  {{ story.value }}
                </p>
              </div>
              <div
                class="mt-4 pt-4 border-t border-slate-50 text-[11px] font-bold text-slate-300 uppercase tracking-tighter italic"
              >
                US #{{ String(index + 1).padStart(3, "0") }}
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 验收条件 -->
      <transition name="el-zoom-in-top">
        <div
          v-if="acceptanceCriteria.length > 0"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:col-span-2"
        >
          <h3 class="text-xl font-bold mb-8 flex items-center text-gray-900">
            <span class="w-1.5 h-6 bg-amber-500 rounded-full mr-3"></span>
            自动化生成的验收条件 (Gherkin)
          </h3>
          <div class="space-y-6">
            <div
              v-for="(criterion, index) in acceptanceCriteria"
              :key="index"
              class="p-6 rounded-2xl border border-gray-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
            >
              <div class="flex items-center gap-3 mb-5">
                <el-tag
                  :type="
                    criterion.scenarioType === 'normal'
                      ? 'success'
                      : criterion.scenarioType === 'exception'
                        ? 'warning'
                        : 'primary'
                  "
                  effect="dark"
                  class="!rounded-lg !border-none px-3 font-bold text-[10px] uppercase tracking-wider"
                >
                  {{ getScenarioText(criterion.scenarioType) }}
                </el-tag>
                <span class="text-xs font-bold text-slate-300"
                  >SCENARIO {{ index + 1 }}</span
                >
              </div>
              <div class="space-y-3 font-mono text-[13px]">
                <p class="flex gap-4">
                  <span class="text-indigo-500 font-black w-12 text-right"
                    >GIVEN</span
                  >
                  <span class="text-slate-600 leading-relaxed">{{
                    criterion.given
                  }}</span>
                </p>
                <p class="flex gap-4">
                  <span class="text-purple-500 font-black w-12 text-right"
                    >WHEN</span
                  >
                  <span class="text-slate-600 leading-relaxed">{{
                    criterion.when
                  }}</span>
                </p>
                <p class="flex gap-4">
                  <span class="text-emerald-500 font-black w-12 text-right"
                    >THEN</span
                  >
                  <span class="text-slate-600 leading-relaxed">{{
                    criterion.then
                  }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import axios from "../utils/api";
import {
  EditPen,
  Warning,
  Help,
  User,
  CircleCheck,
  Trophy,
  Odometer,
  Right,
  Avatar,
  Monitor,
  Connection,
} from "@element-plus/icons-vue";

interface FuzzyWordAnalysis {
  text: string;
  fuzzyWords: Array<{
    word: string;
    positions: Array<{
      start: number;
      end: number;
    }>;
  }>;
  suggestion: string;
}

interface QuestionItem {
  question: string;
  type: string;
}

interface UserStory {
  role: string;
  feature: string;
  value: string;
  storyPoints?: number;
}

interface AcceptanceCriterion {
  given: string;
  when: string;
  then: string;
  scenarioType: "normal" | "exception" | "boundary";
}

interface QualityScore {
  clarity: number;
  testability: number;
  completeness: number;
  totalScore: number;
  suggestions: string[];
}

const requirementText = ref("");
const fuzzyWordsAnalysis = ref<FuzzyWordAnalysis>({
  text: "",
  fuzzyWords: [],
  suggestion: "",
});
const questions = ref<QuestionItem[]>([]);
const userStories = ref<UserStory[]>([]);
const acceptanceCriteria = ref<AcceptanceCriterion[]>([]);
const qualityScore = ref<QualityScore | null>(null);

const highlightedText = computed(() => {
  if (!fuzzyWordsAnalysis.value.text) return requirementText.value;

  let text = requirementText.value;
  const fuzzyWords = fuzzyWordsAnalysis.value.fuzzyWords;

  fuzzyWords.forEach((fuzzyWord) => {
    const regex = new RegExp(fuzzyWord.word, "gi");
    text = text.replace(
      regex,
      (match) => `<span class="fuzzy-word">${match}</span>`,
    );
  });

  return text;
});

const analyzeFuzzyWords = async () => {
  if (!requirementText.value.trim()) {
    fuzzyWordsAnalysis.value = { text: "", fuzzyWords: [], suggestion: "" };
    return;
  }

  try {
    const response = await axios.post("/requirements/ai/analyze/fuzzy-words", {
      text: requirementText.value,
    });
    fuzzyWordsAnalysis.value = response.data;
  } catch (error) {
    console.error("Error analyzing fuzzy words:", error);
  }
};

const generateQuestions = async () => {
  if (!requirementText.value.trim()) return;

  try {
    const response = await axios.post("/requirements/ai/questions", {
      requirementType: "functional",
      requirementContent: requirementText.value,
    });
    questions.value = response.data.questions || [];
  } catch (error) {
    console.error("Error generating questions:", error);
    questions.value = [];
  }
};

const generateUserStories = async () => {
  if (!requirementText.value.trim()) return;

  try {
    const response = await axios.post("/requirements/ai/user-stories", {
      userInput: requirementText.value,
    });
    userStories.value = response.data.userStories || [];
  } catch (error) {
    console.error("Error generating user stories:", error);
    userStories.value = [];
  }
};

const generateAcceptanceCriteria = async () => {
  if (!requirementText.value.trim()) return;

  try {
    const response = await axios.post("/requirements/ai/acceptance-criteria", {
      requirementContent: requirementText.value,
    });
    acceptanceCriteria.value = response.data.acceptanceCriteria || [];
  } catch (error) {
    console.error("Error generating acceptance criteria:", error);
    acceptanceCriteria.value = [];
  }
};

const getQualityScore = async () => {
  if (!requirementText.value.trim()) return;

  try {
    const response = await axios.post("/requirements/ai/quality-score", {
      text: requirementText.value,
    });
    qualityScore.value = response.data;
  } catch (error) {
    console.error("Error getting quality score:", error);
    qualityScore.value = null;
  }
};

const getScenarioText = (type: string) => {
  switch (type) {
    case "normal":
      return "正常流程";
    case "exception":
      return "异常流程";
    case "boundary":
      return "边界条件";
    default:
      return type;
  }
};
</script>

<style scoped>
:deep(.requirement-textarea .el-textarea__inner) {
  @apply !rounded-xl !border-slate-200 !bg-slate-50 !p-5 !text-base focus:!bg-white focus:!border-indigo-500 focus:!ring-4 focus:!ring-indigo-500/10 transition-all duration-300;
}

.action-btn {
  @apply !rounded-xl !h-11 px-6 !font-bold !border-none shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95;
}

.user-story-card {
  @apply p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300;
}

:deep(.fuzzy-word) {
  @apply bg-amber-200 border-b-2 border-amber-500 font-bold px-1 rounded-sm;
}
</style>
