<template>
  <div class="space-y-8">
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">项目挂历</h2>
      </div>

      <!-- 日历导航 -->
      <div class="flex justify-between items-center mb-4">
        <el-button
          @click="previousMonth"
          type="default"
          size="small"
          class="rounded-lg"
        >
          上个月
        </el-button>
        <h3 class="text-xl font-semibold text-gray-900">
          {{ currentYear }}年{{ currentMonth + 1 }}月
        </h3>
        <el-button
          @click="nextMonth"
          type="default"
          size="small"
          class="rounded-lg"
        >
          下个月
        </el-button>
      </div>

      <!-- 日历网格 -->
      <div class="grid grid-cols-7 gap-1">
        <!-- 星期标题 -->
        <div
          v-for="day in weekDays"
          :key="day"
          class="text-center font-medium text-gray-600 py-2"
        >
          {{ day }}
        </div>

        <!-- 日历日期 -->
        <div
          v-for="date in calendarDays"
          :key="date.date.toISOString()"
          class="min-h-[100px] border border-gray-200 p-1 rounded-lg"
          :class="{
            'bg-gray-50': !date.isCurrentMonth,
            'bg-blue-50': isToday(date.date),
          }"
        >
          <div class="text-right text-sm font-medium mb-1">
            {{ date.date.getDate() }}
          </div>

          <!-- 显示当天的项目事件 -->
          <div class="space-y-1">
            <div
              v-for="event in getEventsForDate(date.date)"
              :key="event.id"
              class="text-xs p-1 rounded-full truncate"
              :class="
                event.type === 'project'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              "
              :title="event.title"
            >
              {{ event.title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目列表 -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
    >
      <h3 class="text-xl font-semibold text-gray-900 mb-4">项目列表</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in projects"
          :key="project.id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
        >
          <h4 class="font-semibold text-lg text-blue-600">
            {{ project.name }}
          </h4>
          <p class="text-sm text-gray-500 mt-2">
            {{ project.description || "无描述" }}
          </p>
          <div class="mt-3 text-xs text-gray-600">
            <span>创建时间: {{ formatDate(project.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "../utils/api";

interface ProjectSettings {
  id: string;
  projectId: string;
  workflowConfig: any;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  projectSettings: ProjectSettings | null;
  createdAt: string;
  updatedAt: string;
}

interface Requirement {
  id: string;
  projectId: string;
  title: string;
  dueDate: string | null;
  project: Project;
}

interface CalendarEvent {
  id: string;
  title: string;
  type: "project" | "requirement";
  date: Date;
}

// 状态管理
const projects = ref<Project[]>([]);
const requirements = ref<Requirement[]>([]);
const currentDate = ref(new Date());

// 星期标题
const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

// 当前年份和月份
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

// 获取项目列表
const fetchProjects = async () => {
  try {
    const response = await axios.get("/projects");
    projects.value = response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    projects.value = [];
  }
};

// 获取需求列表（包含截止日期）
const fetchRequirements = async () => {
  try {
    const response = await axios.get("/requirements");
    requirements.value = response.data;
  } catch (error) {
    console.error("Error fetching requirements:", error);
    requirements.value = [];
  }
};

// 生成日历天数
const calendarDays = computed(() => {
  const days = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push({
      date,
      isCurrentMonth: date.getMonth() === currentMonth.value,
    });
  }

  return days;
});

// 导航到上个月
const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
};

// 导航到下个月
const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
};

// 检查是否为今天
const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// 生成所有事件
const events = computed(() => {
  const eventList: CalendarEvent[] = [];

  // 添加项目创建日期事件
  projects.value.forEach((project) => {
    eventList.push({
      id: `project-${project.id}`,
      title: `项目创建: ${project.name}`,
      type: "project",
      date: new Date(project.createdAt),
    });
  });

  // 添加需求截止日期事件
  requirements.value.forEach((requirement) => {
    if (requirement.dueDate) {
      eventList.push({
        id: `requirement-${requirement.id}`,
        title: `需求截止: ${requirement.title}`,
        type: "requirement",
        date: new Date(requirement.dueDate),
      });
    }
  });

  return eventList;
});

// 获取指定日期的事件
const getEventsForDate = (date: Date) => {
  return events.value.filter((event) => {
    return (
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  });
};

// 初始化数据
onMounted(() => {
  fetchProjects();
  fetchRequirements();
});
</script>
