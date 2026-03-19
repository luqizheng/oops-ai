import { ref } from "vue";
import { ElMessage } from "element-plus";

export interface UserStory {
  id: string;
  role: string;
  want: string;
  soThat?: string;
  storyPoints?: number;
  requirement?: { title: string };
  createdAt: string;
}

export const useUserStories = () => {
  const stories = ref<UserStory[]>([]);
  const loading = ref(false);
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const search = ref("");

  const loadStories = async () => {
    loading.value = true;
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
      total.value = 2;
    } catch (error: any) {
      ElMessage.error(error.message || "加载故事列表失败");
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    page.value = 1;
    loadStories();
  };

  const handleSizeChange = () => {
    page.value = 1;
    loadStories();
  };

  const handlePageChange = () => {
    loadStories();
  };

  const handleCreate = () => {
    ElMessage.info("创建故事功能");
  };

  const handleEdit = (row: UserStory) => {
    ElMessage.info(`编辑故事: ${row.id}`);
  };

  const handleDelete = (row: UserStory) => {
    ElMessage.warning(`删除故事: ${row.id}`);
  };

  return {
    stories,
    loading,
    page,
    pageSize,
    total,
    search,
    loadStories,
    handleSearch,
    handleSizeChange,
    handlePageChange,
    handleCreate,
    handleEdit,
    handleDelete
  };
};
