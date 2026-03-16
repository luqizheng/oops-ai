<template>
  <div class="space-y-8">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <h2 class="text-2xl font-bold mb-6 text-gray-900">需求分析</h2>
      
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            输入需求描述
          </label>
          <textarea
            v-model="requirementText"
            @input="analyzeFuzzyWords"
            rows="5"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200"
            placeholder="请输入您的需求描述，例如：'用户希望系统响应速度更快'"
          ></textarea>
        </div>

        <div v-if="fuzzyWordsAnalysis.fuzzyWords.length > 0" class="p-4 bg-yellow-50 border-l-2 border-yellow-400 rounded-r-lg">
          <h3 class="text-lg font-medium text-yellow-800 mb-2">模糊词检测</h3>
          <div class="text-yellow-700 mb-2" v-html="highlightedText"></div>
          <p class="text-sm text-yellow-600">{{ fuzzyWordsAnalysis.suggestion }}</p>
        </div>

        <div class="flex flex-wrap gap-3">
          <el-button
            @click="generateQuestions"
            :disabled="!requirementText"
            type="primary"
            class="rounded-lg px-5 py-2 h-10 text-sm"
          >
            生成追问
          </el-button>
          <el-button
            @click="generateUserStories"
            :disabled="!requirementText"
            class="rounded-lg px-5 py-2 h-10 text-sm bg-green-500 hover:bg-green-600 text-white"
          >
            生成用户故事
          </el-button>
          <el-button
            @click="generateAcceptanceCriteria"
            :disabled="!requirementText"
            class="rounded-lg px-5 py-2 h-10 text-sm bg-purple-500 hover:bg-purple-600 text-white"
          >
            生成验收条件
          </el-button>
          <el-button
            @click="getQualityScore"
            :disabled="!requirementText"
            class="rounded-lg px-5 py-2 h-10 text-sm bg-red-500 hover:bg-red-600 text-white"
          >
            质量评分
          </el-button>
        </div>
      </div>
    </div>

    <div v-if="questions.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <h3 class="text-xl font-bold mb-5 text-gray-900">智能追问</h3>
      <div class="space-y-4">
        <div v-for="(question, index) in questions" :key="index" class="p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
          <p class="font-medium text-gray-800">{{ index + 1 }}. {{ question.question }}</p>
          <p class="text-sm text-gray-500 mt-2">类型: {{ question.type }}</p>
        </div>
      </div>
    </div>

    <div v-if="userStories.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <h3 class="text-xl font-bold mb-5 text-gray-900">用户故事</h3>
      <div class="space-y-5">
        <div v-for="(story, index) in userStories" :key="index" class="p-5 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-sm">
          <p class="font-medium text-gray-800">作为 <span class="text-primary-600">{{ story.role }}</span>，</p>
          <p class="mt-2">我想要 <span class="text-green-600">{{ story.feature }}</span>，</p>
          <p class="mt-2">以便 <span class="text-purple-600">{{ story.value }}</span></p>
          <div v-if="story.storyPoints" class="mt-3">
            <span class="inline-block px-3 py-1 text-xs font-semibold bg-primary-100 text-primary-800 rounded-full">
              故事点: {{ story.storyPoints }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="acceptanceCriteria.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <h3 class="text-xl font-bold mb-5 text-gray-900">验收条件</h3>
      <div class="space-y-5">
        <div v-for="(criterion, index) in acceptanceCriteria" :key="index" class="p-5 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-sm">
          <div class="flex items-center mb-3">
            <span class="px-3 py-1 text-xs font-semibold rounded-full"
                  :class="getScenarioClass(criterion.scenarioType)">
              {{ getScenarioText(criterion.scenarioType) }}
            </span>
          </div>
          <p class="font-medium text-gray-800">Given {{ criterion.given }}</p>
          <p class="mt-2 text-gray-700">When {{ criterion.when }}</p>
          <p class="mt-2 text-gray-700">Then {{ criterion.then }}</p>
        </div>
      </div>
    </div>

    <div v-if="qualityScore" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <h3 class="text-xl font-bold mb-5 text-gray-900">质量评分</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div class="space-y-5">
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">清晰度</span>
                <span class="text-sm font-bold text-gray-900">{{ qualityScore.clarity }}/10</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-primary-500 h-3 rounded-full transition-all duration-500 ease-out" :style="{ width: `${qualityScore.clarity * 10}%` }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">可测试性</span>
                <span class="text-sm font-bold text-gray-900">{{ qualityScore.testability }}/10</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out" :style="{ width: `${qualityScore.testability * 10}%` }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">完整性</span>
                <span class="text-sm font-bold text-gray-900">{{ qualityScore.completeness }}/10</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-purple-500 h-3 rounded-full transition-all duration-500 ease-out" :style="{ width: `${qualityScore.completeness * 10}%` }"></div>
              </div>
            </div>
          </div>
          <div class="mt-8 p-4 bg-primary-50 rounded-lg border-l-2 border-primary-400">
            <p class="text-lg font-bold text-primary-800">总分: {{ qualityScore.totalScore }}/10</p>
          </div>
        </div>
        <div>
          <h4 class="font-medium text-gray-700 mb-4">改进建议</h4>
          <ul class="space-y-3">
            <li v-for="(suggestion, index) in qualityScore.suggestions" :key="index" class="flex items-start">
              <span class="inline-block w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span class="text-gray-700">{{ suggestion }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from '../utils/api'

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

interface UserStory {
  role: string
  feature: string
  value: string
  storyPoints?: number
}

interface AcceptanceCriterion {
  given: string
  when: string
  then: string
  scenarioType: 'normal' | 'exception' | 'boundary'
}

interface QualityScore {
  clarity: number
  testability: number
  completeness: number
  totalScore: number
  suggestions: string[]
}

const requirementText = ref('')
const fuzzyWordsAnalysis = ref<FuzzyWordAnalysis>({
  text: '',
  fuzzyWords: [],
  suggestion: ''
})
const questions = ref<QuestionItem[]>([])
const userStories = ref<UserStory[]>([])
const acceptanceCriteria = ref<AcceptanceCriterion[]>([])
const qualityScore = ref<QualityScore | null>(null)

const highlightedText = computed(() => {
  if (!fuzzyWordsAnalysis.value.text) return requirementText.value
  
  let text = requirementText.value
  const fuzzyWords = fuzzyWordsAnalysis.value.fuzzyWords
  
  fuzzyWords.forEach(fuzzyWord => {
    const regex = new RegExp(fuzzyWord.word, 'gi')
    text = text.replace(regex, match => `<span class="fuzzy-word">${match}</span>`)
  })
  
  return text
})

const analyzeFuzzyWords = async () => {
  if (!requirementText.value.trim()) {
    fuzzyWordsAnalysis.value = { text: '', fuzzyWords: [], suggestion: '' }
    return
  }

  try {
    const response = await axios.post('/requirements/analyze/fuzzy-words', {
      text: requirementText.value
    })
    fuzzyWordsAnalysis.value = response.data
  } catch (error) {
    console.error('Error analyzing fuzzy words:', error)
  }
}

const generateQuestions = async () => {
  if (!requirementText.value.trim()) return

  try {
    const response = await axios.post('/requirements/questions', {
      requirementType: 'functional',
      requirementContent: requirementText.value
    })
    questions.value = response.data.questions || []
  } catch (error) {
    console.error('Error generating questions:', error)
    questions.value = []
  }
}

const generateUserStories = async () => {
  if (!requirementText.value.trim()) return

  try {
    const response = await axios.post('/requirements/user-stories', {
      userInput: requirementText.value
    })
    userStories.value = response.data.userStories || []
  } catch (error) {
    console.error('Error generating user stories:', error)
    userStories.value = []
  }
}

const generateAcceptanceCriteria = async () => {
  if (!requirementText.value.trim()) return

  try {
    const response = await axios.post('/requirements/acceptance-criteria', {
      requirementContent: requirementText.value
    })
    acceptanceCriteria.value = response.data.acceptanceCriteria || []
  } catch (error) {
    console.error('Error generating acceptance criteria:', error)
    acceptanceCriteria.value = []
  }
}

const getQualityScore = async () => {
  if (!requirementText.value.trim()) return

  try {
    const response = await axios.post('/requirements/quality-score', {
      text: requirementText.value
    })
    qualityScore.value = response.data
  } catch (error) {
    console.error('Error getting quality score:', error)
    qualityScore.value = null
  }
}

const getScenarioClass = (type: string) => {
  switch (type) {
    case 'normal':
      return 'bg-green-100 text-green-800'
    case 'exception':
      return 'bg-yellow-100 text-yellow-800'
    case 'boundary':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getScenarioText = (type: string) => {
  switch (type) {
    case 'normal':
      return '正常流程'
    case 'exception':
      return '异常流程'
    case 'boundary':
      return '边界条件'
    default:
      return type
  }
}
</script>

<style scoped>
.fuzzy-word {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 3px;
  padding: 0 2px;
  font-weight: 500;
}
</style>