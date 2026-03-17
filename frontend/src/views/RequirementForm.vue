<template>
  <div class="space-y-8 p-4 max-w-5xl mx-auto">
    <!-- 面包屑导航 -->
    <div class="flex items-center space-x-2 text-sm text-gray-400 mb-4 px-2">
      <router-link to="/requirements" class="hover:text-indigo-500 transition-colors">需求中心</router-link>
      <el-icon><ArrowRight /></el-icon>
      <span class="text-gray-900 font-bold">{{ isEditing ? '编辑需求' : '录入新需求' }}</span>
    </div>

    <div class="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-8">
      <div class="flex items-center space-x-3 mb-8">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-100">
          <el-icon size="24" color="white"><DocumentAdd /></el-icon>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ isEditing ? '编辑需求内容' : '开启新的需求分析' }}</h2>
          <p class="text-sm text-gray-500">通过结构化录入提升需求的清晰度</p>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="space-y-6"
      >
        <!-- 基础信息 -->
        <el-form-item label="需求标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="简明扼要地描述需求，例如：移动端登录支持生物识别"
            size="large"
            class="modern-input"
          />
        </el-form-item>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <el-form-item label="所属项目" prop="projectId">
            <el-select
              v-model="form.projectId"
              placeholder="请选择关联项目"
              size="large"
              class="w-full modern-input"
              :disabled="!!route.query.projectId"
            >
              <el-option
                v-for="project in projects"
                :key="project.id"
                :label="project.name"
                :value="project.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="需求类型" prop="requirementType">
            <el-select
              v-model="form.requirementType"
              placeholder="请选择类型"
              size="large"
              class="w-full modern-input"
            >
              <el-option label="功能需求" value="functional" />
              <el-option label="非功能需求" value="non-functional" />
              <el-option label="技术改进" value="technical" />
              <el-option label="缺陷修复" value="bug" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="需求描述" prop="requirementContent">
          <el-input
            v-model="form.requirementContent"
            @input="analyzeFuzzyWords"
            type="textarea"
            :rows="6"
            placeholder="请详细描述具体的业务逻辑、交互细节和期望结果..."
            class="modern-input"
          />
        </el-form-item>

        <!-- 模糊词警告面板 -->
        <transition name="el-fade-in-linear">
          <div v-if="fuzzyWordsAnalysis.fuzzyWords.length > 0" class="p-5 bg-amber-50/50 border border-amber-100 rounded-xl flex gap-4">
            <el-icon class="text-amber-500 mt-1" size="20"><Warning /></el-icon>
            <div>
              <h3 class="text-sm font-bold text-amber-900 mb-2">模糊词检测建议</h3>
              <div class="text-sm text-amber-800/80 leading-relaxed mb-3" v-html="highlightedText"></div>
              <p class="text-xs font-medium text-amber-600/80">{{ fuzzyWordsAnalysis.suggestion }}</p>
            </div>
          </div>
        </transition>

        <!-- AI 辅助工具 -->
        <div class="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
          <el-button
            @click="generateQuestions"
            :disabled="!form.requirementContent"
            type="primary"
            class="!rounded-xl !h-10 !font-medium"
          >
            <el-icon class="mr-1.5"><Help /></el-icon>
            生成追问
          </el-button>
          <el-button
            @click="generateUserStories"
            :disabled="!form.requirementContent"
            type="success"
            class="!rounded-xl !h-10 !font-medium"
          >
            <el-icon class="mr-1.5"><User /></el-icon>
            生成用户故事
          </el-button>
          <el-button
            @click="generateAcceptanceCriteria"
            :disabled="!form.requirementContent"
            type="warning"
            class="!rounded-xl !h-10 !font-medium"
          >
            <el-icon class="mr-1.5"><CircleCheck /></el-icon>
            生成验收条件
          </el-button>
          <el-button
            @click="getQualityScore"
            :disabled="!form.requirementContent"
            type="danger"
            class="!rounded-xl !h-10 !font-medium"
          >
            <el-icon class="mr-1.5"><Trophy /></el-icon>
            质量评分
          </el-button>
        </div>

        <!-- 智能追问结果 -->
        <transition name="el-zoom-in-top">
          <div v-if="questions.length > 0" class="p-6 bg-indigo-50 rounded-xl mt-6">
            <h3 class="text-lg font-bold mb-4 text-indigo-900">智能追问</h3>
            <div class="space-y-3">
              <div v-for="(question, index) in questions" :key="index" class="p-4 bg-white rounded-lg border border-indigo-100">
                <p class="font-medium text-gray-800">{{ question.question }}</p>
                <span class="inline-block mt-2 px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-600 rounded">
                  {{ question.type }}
                </span>
              </div>
            </div>
          </div>
        </transition>

        <!-- 质量评分结果 -->
        <transition name="el-zoom-in-top">
          <div v-if="qualityScore" class="p-6 bg-rose-50 rounded-xl mt-6">
            <h3 class="text-lg font-bold mb-4 text-rose-900">质量分析报告</h3>
            <div class="flex items-center justify-between mb-6">
              <div>
                <p class="text-sm font-bold text-rose-600">综合质量评分</p>
                <div class="text-3xl font-black text-rose-700">{{ qualityScore.totalScore }}<span class="text-xl text-rose-400 ml-1">/10</span></div>
              </div>
              <el-progress 
                type="circle" 
                :percentage="qualityScore.totalScore * 10" 
                :width="80" 
                :stroke-width="10"
                color="#e11d48"
              />
            </div>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm font-bold mb-2">
                  <span>清晰度</span>
                  <span class="text-indigo-600">{{ qualityScore.clarity * 10 }}%</span>
                </div>
                <el-progress :percentage="qualityScore.clarity * 10" :show-text="false" color="#6366f1" />
              </div>
              <div>
                <div class="flex justify-between text-sm font-bold mb-2">
                  <span>可测试性</span>
                  <span class="text-emerald-600">{{ qualityScore.testability * 10 }}%</span>
                </div>
                <el-progress :percentage="qualityScore.testability * 10" :show-text="false" color="#10b981" />
              </div>
              <div>
                <div class="flex justify-between text-sm font-bold mb-2">
                  <span>完整性</span>
                  <span class="text-purple-600">{{ qualityScore.completeness * 10 }}%</span>
                </div>
                <el-progress :percentage="qualityScore.completeness * 10" :show-text="false" color="#a855f7" />
              </div>
            </div>
            <div class="mt-6">
              <h4 class="text-sm font-bold text-rose-600 mb-3">优化建议</h4>
              <ul class="space-y-2">
                <li v-for="(suggestion, index) in qualityScore.suggestions" :key="index" class="flex items-start gap-2">
                  <el-icon class="text-rose-500 mt-1"><Right /></el-icon>
                  <span class="text-sm text-gray-700">{{ suggestion }}</span>
                </li>
              </ul>
            </div>
          </div>
        </transition>

        <!-- 需求管理核心点 -->
        <el-tabs v-model="activeTab" class="mt-10">
          <!-- 1. 原始需求 -->
          <el-tab-pane label="原始需求" name="rawRequirements">
            <div class="space-y-6">
              <div v-for="(item, index) in form.rawRequirements" :key="index" class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <el-button type="danger" size="small" @click="removeRawRequirement(index)" class="float-right">删除</el-button>
                <el-form-item label="原始需求内容" :prop="`rawRequirements.${index}.content`" :rules="[{ required: true, message: '请输入原始需求内容', trigger: 'blur' }]">
                  <el-input
                    v-model="item.content"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入原始需求的具体内容"
                    class="modern-input"
                  />
                </el-form-item>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <el-form-item label="来源类型">
                    <el-select v-model="item.sourceType" placeholder="请选择来源类型" class="modern-input">
                      <el-option label="用户反馈" value="user_feedback" />
                      <el-option label="市场需求" value="market_need" />
                      <el-option label="内部建议" value="internal_suggestion" />
                      <el-option label="其他" value="other" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="提出人">
                    <el-input v-model="item.proposedBy" placeholder="请输入提出人" class="modern-input" />
                  </el-form-item>
                </div>
                <el-form-item label="场景描述">
                  <el-input
                    v-model="item.scenario"
                    type="textarea"
                    :rows="2"
                    placeholder="请描述原始需求的应用场景"
                    class="modern-input"
                  />
                </el-form-item>
              </div>
              <el-button type="primary" plain @click="addRawRequirement" class="!rounded-xl">添加原始需求</el-button>
            </div>
          </el-tab-pane>

          <!-- 2. 用户故事 -->
          <el-tab-pane label="用户故事" name="userStories">
            <div class="space-y-6">
              <div v-for="(item, index) in form.userStories" :key="index" class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <el-button type="danger" size="small" @click="removeUserStory(index)" class="float-right">删除</el-button>
                <el-form-item label="角色" :prop="`userStories.${index}.role`" :rules="[{ required: true, message: '请输入角色', trigger: 'blur' }]">
                  <el-input v-model="item.role" placeholder="例如：注册用户" class="modern-input" />
                </el-form-item>
                <el-form-item label="想要的功能" :prop="`userStories.${index}.want`" :rules="[{ required: true, message: '请输入想要的功能', trigger: 'blur' }]">
                  <el-input
                    v-model="item.want"
                    type="textarea"
                    :rows="2"
                    placeholder="例如：使用指纹登录系统"
                    class="modern-input"
                  />
                </el-form-item>
                <el-form-item label="带来的价值">
                  <el-input
                    v-model="item.soThat"
                    type="textarea"
                    :rows="2"
                    placeholder="例如：提高登录效率和安全性"
                    class="modern-input"
                  />
                </el-form-item>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <el-form-item label="故事点估算">
                    <el-input-number v-model="item.storyPoints" :min="0" :precision="0" class="modern-input" />
                  </el-form-item>
                  <el-form-item label="验收要点">
                    <el-input v-model="item.acceptanceNotes" placeholder="请输入验收要点" class="modern-input" />
                  </el-form-item>
                </div>
              </div>
              <el-button type="primary" plain @click="addUserStory" class="!rounded-xl">添加用户故事</el-button>
            </div>
          </el-tab-pane>

          <!-- 3. 验收标准 -->
          <el-tab-pane label="验收标准" name="acceptanceCriteria">
            <div class="space-y-6">
              <div v-for="(item, index) in form.acceptanceCriteria" :key="index" class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <el-button type="danger" size="small" @click="removeAcceptanceCriterion(index)" class="float-right">删除</el-button>
                <el-form-item label="验收条件" :prop="`acceptanceCriteria.${index}.criterion`" :rules="[{ required: true, message: '请输入验收条件', trigger: 'blur' }]">
                  <el-input
                    v-model="item.criterion"
                    type="textarea"
                    :rows="3"
                    placeholder="例如：当用户点击'使用指纹登录'按钮时，系统应请求生物识别权限"
                    class="modern-input"
                  />
                </el-form-item>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <el-form-item label="前置条件">
                    <el-input v-model="item.precondition" placeholder="请输入前置条件" class="modern-input" />
                  </el-form-item>
                  <el-form-item label="优先级">
                    <el-select v-model="item.priority" placeholder="请选择优先级" class="modern-input">
                      <el-option label="高" value="high" />
                      <el-option label="中" value="medium" />
                      <el-option label="低" value="low" />
                    </el-select>
                  </el-form-item>
                </div>
                <el-form-item label="预期结果">
                  <el-input
                    v-model="item.expectedResult"
                    type="textarea"
                    :rows="2"
                    placeholder="例如：系统成功获取生物识别权限并进行身份验证"
                    class="modern-input"
                  />
                </el-form-item>
              </div>
              <el-button type="primary" plain @click="addAcceptanceCriterion" class="!rounded-xl">添加验收标准</el-button>
            </div>
          </el-tab-pane>

          <!-- 4. 测试用例 -->
          <el-tab-pane label="测试用例" name="testCases">
            <div class="space-y-6">
              <div v-for="(item, index) in form.testCases" :key="index" class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <el-button type="danger" size="small" @click="removeTestCase(index)" class="float-right">删除</el-button>
                <el-form-item label="测试用例名称" :prop="`testCases.${index}.name`" :rules="[{ required: true, message: '请输入测试用例名称', trigger: 'blur' }]">
                  <el-input v-model="item.name" placeholder="例如：指纹登录功能测试" class="modern-input" />
                </el-form-item>
                <el-form-item label="测试步骤" :prop="`testCases.${index}.steps`" :rules="[{ required: true, message: '请输入测试步骤', trigger: 'blur' }]">
                  <el-input
                    v-model="item.steps"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入详细的测试步骤，每行一个步骤"
                    class="modern-input"
                  />
                </el-form-item>
                <el-form-item label="预期结果" :prop="`testCases.${index}.expectedResult`" :rules="[{ required: true, message: '请输入预期结果', trigger: 'blur' }]">
                  <el-input
                    v-model="item.expectedResult"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入预期的测试结果"
                    class="modern-input"
                  />
                </el-form-item>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <el-form-item label="测试状态">
                    <el-select v-model="item.status" placeholder="请选择测试状态" class="modern-input">
                      <el-option label="未测试" value="not_tested" />
                      <el-option label="通过" value="passed" />
                      <el-option label="失败" value="failed" />
                      <el-option label="阻塞" value="blocked" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="测试数据">
                    <el-input v-model="item.testData" placeholder="请输入测试数据" class="modern-input" />
                  </el-form-item>
                </div>
              </div>
              <el-button type="primary" plain @click="addTestCase" class="!rounded-xl">添加测试用例</el-button>
            </div>
          </el-tab-pane>

          <!-- 5. 业务规则 -->
          <el-tab-pane label="业务规则" name="businessRules">
            <div class="space-y-6">
              <div v-for="(item, index) in form.businessRules" :key="index" class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <el-button type="danger" size="small" @click="removeBusinessRule(index)" class="float-right">删除</el-button>
                <el-form-item label="规则名称" :prop="`businessRules.${index}.name`" :rules="[{ required: true, message: '请输入规则名称', trigger: 'blur' }]">
                  <el-input v-model="item.name" placeholder="例如：生物识别权限规则" class="modern-input" />
                </el-form-item>
                <el-form-item label="规则内容" :prop="`businessRules.${index}.ruleContent`" :rules="[{ required: true, message: '请输入规则内容', trigger: 'blur' }]">
                  <el-input
                    v-model="item.ruleContent"
                    type="textarea"
                    :rows="3"
                    placeholder="请详细描述业务规则内容"
                    class="modern-input"
                  />
                </el-form-item>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <el-form-item label="规则类型">
                    <el-select v-model="item.ruleType" placeholder="请选择规则类型" class="modern-input">
                      <el-option label="权限规则" value="permission" />
                      <el-option label="数据规则" value="data" />
                      <el-option label="流程规则" value="process" />
                      <el-option label="其他" value="other" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="优先级">
                    <el-select v-model="item.priority" placeholder="请选择优先级" class="modern-input">
                      <el-option label="高" value="high" />
                      <el-option label="中" value="medium" />
                      <el-option label="低" value="low" />
                    </el-select>
                  </el-form-item>
                </div>
              </div>
              <el-button type="primary" plain @click="addBusinessRule" class="!rounded-xl">添加业务规则</el-button>
            </div>
          </el-tab-pane>

          <!-- 6. 非功能需求 -->
          <el-tab-pane label="非功能需求" name="nfrRequirements">
            <div class="space-y-6">
              <div v-for="(item, index) in form.nfrRequirements" :key="index" class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <el-button type="danger" size="small" @click="removeNFRRequirement(index)" class="float-right">删除</el-button>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <el-form-item label="NFR类型" :prop="`nfrRequirements.${index}.nfrType`" :rules="[{ required: true, message: '请选择NFR类型', trigger: 'change' }]">
                    <el-select v-model="item.nfrType" placeholder="请选择NFR类型" class="modern-input">
                      <el-option label="性能" value="performance" />
                      <el-option label="安全性" value="security" />
                      <el-option label="可用性" value="usability" />
                      <el-option label="可扩展性" value="scalability" />
                      <el-option label="可靠性" value="reliability" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="指标" :prop="`nfrRequirements.${index}.targetValue`" :rules="[{ required: true, message: '请输入目标指标', trigger: 'blur' }]">
                    <el-input v-model="item.targetValue" placeholder="例如：响应时间<1秒" class="modern-input" />
                  </el-form-item>
                </div>
                <el-form-item label="详细说明">
                  <el-input
                    v-model="item.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请详细说明非功能需求的要求和约束"
                    class="modern-input"
                  />
                </el-form-item>
                <el-form-item label="测试方法">
                  <el-input
                    v-model="item.testMethod"
                    type="textarea"
                    :rows="2"
                    placeholder="请描述如何测试该非功能需求"
                    class="modern-input"
                  />
                </el-form-item>
              </div>
              <el-button type="primary" plain @click="addNFRRequirement" class="!rounded-xl">添加非功能需求</el-button>
            </div>
          </el-tab-pane>

          <!-- 7. 依赖关系 -->
          <el-tab-pane label="依赖关系" name="dependencies">
            <div class="space-y-6">
              <div v-for="(item, index) in form.dependencies" :key="index" class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <el-button type="danger" size="small" @click="removeDependency(index)" class="float-right">删除</el-button>
                <el-form-item label="依赖需求" :prop="`dependencies.${index}.dependsOnId`" :rules="[{ required: true, message: '请选择依赖需求', trigger: 'change' }]">
                  <el-select v-model="item.dependsOnId" placeholder="请选择依赖的需求" class="modern-input">
                    <el-option
                      v-for="req in allRequirements"
                      :key="req.id"
                      :label="req.title"
                      :value="req.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="依赖类型">
                  <el-select v-model="item.dependencyType" placeholder="请选择依赖类型" class="modern-input">
                    <el-option label="前置依赖" value="predecessor" />
                    <el-option label="资源依赖" value="resource" />
                    <el-option label="技术依赖" value="technical" />
                    <el-option label="其他" value="other" />
                  </el-select>
                </el-form-item>
                <el-form-item label="依赖描述">
                  <el-input
                    v-model="item.description"
                    type="textarea"
                    :rows="2"
                    placeholder="请详细描述依赖关系"
                    class="modern-input"
                  />
                </el-form-item>
              </div>
              <el-button type="primary" plain @click="addDependency" class="!rounded-xl">添加依赖关系</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="pt-8 border-t border-gray-50 flex items-center justify-end gap-4">
          <el-button @click="router.back()" class="!rounded-xl px-8 !h-11 !font-bold">
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
            class="!rounded-xl px-10 !h-11 !font-bold bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-lg shadow-indigo-100"
          >
            {{ isEditing ? '保存更新' : '提交分析' }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, DocumentAdd, Warning, Help, User, CircleCheck, Trophy, Right } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from '../utils/api'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const submitting = ref(false)
const projects = ref<any[]>([])
const allRequirements = ref<any[]>([])
const activeTab = ref('rawRequirements')

// AI 功能相关接口定义
interface FuzzyWordAnalysis {
  text: string
  fuzzyWords: Array<{
    word: string
    positions: Array<{
      start: number
      end: number
    }>
  }>
  suggestion: string
}

interface QuestionItem {
  question: string
  type: string
}

interface QualityScore {
  clarity: number
  testability: number
  completeness: number
  totalScore: number
  suggestions: string[]
}

const isEditing = computed(() => !!route.params.id)

// AI 功能相关响应式变量
const fuzzyWordsAnalysis = ref<FuzzyWordAnalysis>({
  text: '',
  fuzzyWords: [],
  suggestion: ''
})
const questions = ref<QuestionItem[]>([])
const qualityScore = ref<QualityScore | null>(null)

// 计算属性：高亮模糊词
const highlightedText = computed(() => {
  if (!fuzzyWordsAnalysis.value.text || !form.value.requirementContent) return form.value.requirementContent
  
  let text = form.value.requirementContent
  const fuzzyWords = fuzzyWordsAnalysis.value.fuzzyWords
  
  fuzzyWords.forEach(fuzzyWord => {
    const regex = new RegExp(fuzzyWord.word, 'gi')
    text = text.replace(regex, match => `<span class="fuzzy-word">${match}</span>`)
  })
  
  return text
})

const form = ref({
  title: '',
  projectId: '',
  requirementType: 'functional',
  requirementContent: '',
  // 1. 原始需求
  rawRequirements: [] as Array<{
    content: string
    sourceType?: string
    sourceMeta?: any
    proposedBy?: string
    proposedAt?: Date
    scenario?: string
  }>,
  // 2. 用户故事
  userStories: [] as Array<{
    role: string
    want: string
    soThat?: string
    acceptanceNotes?: string
    storyPoints?: number
  }>,
  // 3. 验收标准
  acceptanceCriteria: [] as Array<{
    criterion: string
    precondition?: string
    expectedResult: string
    priority?: string
  }>,
  // 4. 测试用例
  testCases: [] as Array<{
    name: string
    steps: string
    expectedResult: string
    status?: string
    testData?: string
  }>,
  // 5. 业务规则
  businessRules: [] as Array<{
    name: string
    ruleContent: string
    ruleType?: string
    priority?: string
  }>,
  // 6. 非功能需求
  nfrRequirements: [] as Array<{
    nfrType: string
    targetValue: string
    description?: string
    testMethod?: string
  }>,
  // 7. 依赖关系
  dependencies: [] as Array<{
    dependsOnId: string
    dependencyType?: string
    description?: string
  }>
})

const rules = {
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }],
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
  requirementContent: [{ required: true, message: '请输入需求内容', trigger: 'blur' }]
}

// AI 功能相关方法
const analyzeFuzzyWords = async () => {
  if (!form.value.requirementContent.trim()) {
    fuzzyWordsAnalysis.value = { text: '', fuzzyWords: [], suggestion: '' }
    return
  }

  try {
    const response = await axios.post('/requirements/analyze/fuzzy-words', {
      text: form.value.requirementContent
    })
    fuzzyWordsAnalysis.value = response.data
  } catch (error) {
    console.error('Error analyzing fuzzy words:', error)
  }
}

const generateQuestions = async () => {
  if (!form.value.requirementContent.trim()) return

  try {
    const response = await axios.post('/requirements/questions', {
      requirementType: form.value.requirementType,
      requirementContent: form.value.requirementContent
    })
    questions.value = response.data.questions || []
  } catch (error) {
    console.error('Error generating questions:', error)
    questions.value = []
  }
}

const generateUserStories = async () => {
  if (!form.value.requirementContent.trim()) return

  try {
    const response = await axios.post('/requirements/user-stories', {
      userInput: form.value.requirementContent
    })
    const userStories = response.data.userStories || []
    // 将生成的用户故事添加到表单中
    form.value.userStories = form.value.userStories.concat(
      userStories.map((story: any) => ({
        role: story.role,
        want: story.feature,
        soThat: story.value,
        storyPoints: story.storyPoints || 0,
        acceptanceNotes: ''
      }))
    )
    // 切换到用户故事标签页
    activeTab.value = 'userStories'
    ElMessage.success('用户故事生成成功')
  } catch (error) {
    console.error('Error generating user stories:', error)
    ElMessage.error('用户故事生成失败')
  }
}

const generateAcceptanceCriteria = async () => {
  if (!form.value.requirementContent.trim()) return

  try {
    const response = await axios.post('/requirements/acceptance-criteria', {
      requirementContent: form.value.requirementContent
    })
    const acceptanceCriteria = response.data.acceptanceCriteria || []
    // 将生成的验收条件添加到表单中
    form.value.acceptanceCriteria = form.value.acceptanceCriteria.concat(
      acceptanceCriteria.map((criterion: any) => ({
        criterion: `${criterion.given} ${criterion.when} ${criterion.then}`,
        precondition: criterion.given,
        expectedResult: criterion.then,
        priority: 'medium'
      }))
    )
    // 切换到验收标准标签页
    activeTab.value = 'acceptanceCriteria'
    ElMessage.success('验收条件生成成功')
  } catch (error) {
    console.error('Error generating acceptance criteria:', error)
    ElMessage.error('验收条件生成失败')
  }
}

const getQualityScore = async () => {
  if (!form.value.requirementContent.trim()) return

  try {
    const response = await axios.post('/requirements/quality-score', {
      text: form.value.requirementContent
    })
    qualityScore.value = response.data
  } catch (error) {
    console.error('Error getting quality score:', error)
    qualityScore.value = null
  }
}

const fetchProjects = async () => {
  try {
    const response = await axios.get('/projects')
    projects.value = response.data
  } catch (error) {
    console.error('Failed to fetch projects:', error)
  }
}

const fetchAllRequirements = async () => {
  try {
    const response = await axios.get('/requirements')
    allRequirements.value = response.data
  } catch (error) {
    console.error('Failed to fetch all requirements:', error)
  }
}

const fetchRequirement = async (id: string) => {
  try {
    const response = await axios.get(`/requirements/${id}/details`)
    const { 
      title, 
      projectId, 
      requirementType, 
      requirementContent,
      rawRequirements,
      userStories,
      acceptanceCriteria,
      testCases,
      businessRules,
      nFRRequirements: nfrRequirements,
      requirementDeps: dependencies
    } = response.data
    
    // 转换依赖关系格式
    const formattedDependencies = dependencies.map((dep: any) => ({
      dependsOnId: dep.dependsOnId,
      dependencyType: dep.dependencyType,
      description: dep.description
    }))
    
    form.value = { 
      title, 
      projectId, 
      requirementType, 
      requirementContent,
      rawRequirements,
      userStories,
      acceptanceCriteria,
      testCases,
      businessRules,
      nfrRequirements,
      dependencies: formattedDependencies
    }
  } catch (error) {
    console.error('Failed to fetch requirement:', error)
    ElMessage.error('获取需求详情失败')
    router.push('/requirements')
  }
}

// 1. 原始需求操作方法
const addRawRequirement = () => {
  form.value.rawRequirements.push({
    content: '',
    sourceType: 'user_feedback',
    proposedBy: '',
    scenario: '',
    proposedAt: new Date()
  })
}

const removeRawRequirement = (index: number) => {
  form.value.rawRequirements.splice(index, 1)
}

// 2. 用户故事操作方法
const addUserStory = () => {
  form.value.userStories.push({
    role: '',
    want: '',
    soThat: '',
    acceptanceNotes: '',
    storyPoints: 0
  })
}

const removeUserStory = (index: number) => {
  form.value.userStories.splice(index, 1)
}

// 3. 验收标准操作方法
const addAcceptanceCriterion = () => {
  form.value.acceptanceCriteria.push({
    criterion: '',
    precondition: '',
    expectedResult: '',
    priority: 'medium'
  })
}

const removeAcceptanceCriterion = (index: number) => {
  form.value.acceptanceCriteria.splice(index, 1)
}

// 4. 测试用例操作方法
const addTestCase = () => {
  form.value.testCases.push({
    name: '',
    steps: '',
    expectedResult: '',
    status: 'not_tested',
    testData: ''
  })
}

const removeTestCase = (index: number) => {
  form.value.testCases.splice(index, 1)
}

// 5. 业务规则操作方法
const addBusinessRule = () => {
  form.value.businessRules.push({
    name: '',
    ruleContent: '',
    ruleType: 'permission',
    priority: 'medium'
  })
}

const removeBusinessRule = (index: number) => {
  form.value.businessRules.splice(index, 1)
}

// 6. 非功能需求操作方法
const addNFRRequirement = () => {
  form.value.nfrRequirements.push({
    nfrType: 'performance',
    targetValue: '',
    description: '',
    testMethod: ''
  })
}

const removeNFRRequirement = (index: number) => {
  form.value.nfrRequirements.splice(index, 1)
}

// 7. 依赖关系操作方法
const addDependency = () => {
  form.value.dependencies.push({
    dependsOnId: '',
    dependencyType: 'predecessor',
    description: ''
  })
}

const removeDependency = (index: number) => {
  form.value.dependencies.splice(index, 1)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        const { 
          rawRequirements, 
          userStories, 
          acceptanceCriteria, 
          testCases, 
          businessRules, 
          nfrRequirements, 
          dependencies,
          ...basicInfo 
        } = form.value
        
        if (isEditing.value) {
          // 更新基本信息
          await axios.put(`/requirements/${route.params.id}`, basicInfo)
          
          // 更新关联信息
          await updateRelatedItems(route.params.id as string)
        } else {
          // 创建需求
          const response = await axios.post('/requirements', basicInfo)
          const requirementId = response.data.id
          
          // 创建关联信息
          await createRelatedItems(requirementId)
        }
        
        ElMessage.success(isEditing.value ? '需求更新成功' : '需求录入成功')
        router.push('/requirements')
      } catch (error: any) {
        console.error('Submit failed:', error)
        ElMessage.error(error.response?.data?.message || '操作失败，请重试')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 创建关联项目
const createRelatedItems = async (requirementId: string) => {
  const { 
    rawRequirements, 
    userStories, 
    acceptanceCriteria, 
    testCases, 
    businessRules, 
    nfrRequirements, 
    dependencies
  } = form.value
  
  // 创建原始需求
  for (const item of rawRequirements) {
    await axios.post(`/requirements/${requirementId}/raw-requirements`, item)
  }
  
  // 创建用户故事
  for (const item of userStories) {
    await axios.post(`/requirements/${requirementId}/user-stories`, item)
  }
  
  // 创建验收标准
  for (const item of acceptanceCriteria) {
    await axios.post(`/requirements/${requirementId}/acceptance-criteria`, item)
  }
  
  // 创建测试用例
  for (const item of testCases) {
    await axios.post(`/requirements/${requirementId}/test-cases`, item)
  }
  
  // 创建业务规则
  for (const item of businessRules) {
    await axios.post(`/requirements/${requirementId}/business-rules`, item)
  }
  
  // 创建非功能需求
  for (const item of nfrRequirements) {
    await axios.post(`/requirements/${requirementId}/nfr-requirements`, item)
  }
  
  // 创建依赖关系
  for (const item of dependencies) {
    await axios.post(`/requirements/${requirementId}/dependencies`, item)
  }
}

// 更新关联项目
const updateRelatedItems = async (requirementId: string) => {
  // 由于时间限制，这里简化处理，先删除所有旧的关联项，再创建新的
  // 实际项目中应该使用更高效的差异更新策略
  
  // 删除所有旧的关联项
  await axios.delete(`/requirements/${requirementId}/raw-requirements`).catch(() => {})
  await axios.delete(`/requirements/${requirementId}/user-stories`).catch(() => {})
  await axios.delete(`/requirements/${requirementId}/acceptance-criteria`).catch(() => {})
  await axios.delete(`/requirements/${requirementId}/test-cases`).catch(() => {})
  await axios.delete(`/requirements/${requirementId}/business-rules`).catch(() => {})
  await axios.delete(`/requirements/${requirementId}/nfr-requirements`).catch(() => {})
  await axios.delete(`/requirements/${requirementId}/dependencies`).catch(() => {})
  
  // 创建新的关联项
  await createRelatedItems(requirementId)
}

onMounted(() => {
  fetchProjects()
  fetchAllRequirements()
  // 如果有项目ID参数，自动填充并禁用选择
  if (route.query.projectId) {
    form.value.projectId = route.query.projectId as string
  }
  if (isEditing.value) {
    fetchRequirement(route.params.id as string)
  }
})
</script>

<style scoped>
:deep(.modern-input .el-input__wrapper),
:deep(.modern-input .el-textarea__inner),
:deep(.modern-input .el-select__wrapper) {
  @apply !rounded-xl !shadow-none !border-gray-200 !bg-gray-50/50 !p-3 focus:!bg-white focus:!border-indigo-500 focus:!ring-4 focus:!ring-indigo-500/10 transition-all duration-300;
}

:deep(.el-form-item__label) {
  @apply !text-gray-700 !font-bold !pb-2;
}

:deep(.fuzzy-word) {
  @apply bg-amber-200 border-b-2 border-amber-500 font-bold px-1 rounded-sm;
}
</style>
