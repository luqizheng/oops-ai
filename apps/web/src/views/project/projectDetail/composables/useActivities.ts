import { ref } from "vue";
import { ElMessage } from "element-plus";

export interface Activity {
  id: string;
  type: string;
  action: string;
  description: string;
  user?: { name: string };
  createdAt: string;
}

export const useActivities = () => {
  const activities = ref<Activity[]>([]);
  const loading = ref(false);
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  const loadActivities = async () => {
    loading.value = true;
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
      total.value = 3;
    } catch (error: any) {
      ElMessage.error(error.message || "加载活动列表失败");
    } finally {
      loading.value = false;
    }
  };

  const handleSizeChange = () => {
    page.value = 1;
    loadActivities();
  };

  const handlePageChange = () => {
    loadActivities();
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

  return {
    activities,
    loading,
    page,
    pageSize,
    total,
    loadActivities,
    handleSizeChange,
    handlePageChange,
    getActivityType
  };
};
