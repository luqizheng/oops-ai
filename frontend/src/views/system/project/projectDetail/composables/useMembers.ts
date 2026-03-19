import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import {
  getProjectMembers,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
  getAllUsers
} from "@/api/system/project";
import type { ProjectMemberListItem, UserListItem } from "@oops-ai/shared";

export const useMembers = (projectId: string) => {
  const members = ref<ProjectMemberListItem[]>([]);
  const loading = ref(false);
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const search = ref("");
  const roleFilter = ref("");
  const allUsers = ref<UserListItem[]>([]);

  const editDialogVisible = ref(false);
  const editFormData = ref({
    userId: "",
    role: "developer"
  });
  const editSubmitLoading = ref(false);

  const addDialogVisible = ref(false);
  const addFormData = ref({
    userId: "",
    role: "developer"
  });
  const addSubmitLoading = ref(false);

  const availableUsers = computed(() => {
    const memberUserIds = members.value.map(m => m.userId);
    return allUsers.value.filter(user => !memberUserIds.includes(user.id));
  });

  const loadMembers = async () => {
    loading.value = true;
    try {
      const res = await getProjectMembers(projectId);
      members.value = res;
      total.value = res.length;
    } catch (error: any) {
      ElMessage.error(error.message || "加载成员列表失败");
    } finally {
      loading.value = false;
    }
  };

  const loadAllUsers = async () => {
    try {
      const res = await getAllUsers();
      allUsers.value = res.data;
    } catch (error: any) {
      console.error("加载用户列表失败", error);
    }
  };

  const handleSearch = () => {
    page.value = 1;
    loadMembers();
  };

  const handleFilterChange = () => {
    page.value = 1;
    loadMembers();
  };

  const handleSizeChange = () => {
    page.value = 1;
    loadMembers();
  };

  const handlePageChange = () => {
    loadMembers();
  };

  const handleAdd = () => {
    addFormData.value = {
      userId: "",
      role: "developer"
    };
    addDialogVisible.value = true;
  };

  const handleAddSubmit = async () => {
    if (!addFormData.value.userId) {
      ElMessage.warning("请选择用户");
      return;
    }

    addSubmitLoading.value = true;
    try {
      await addProjectMember(projectId, {
        userId: addFormData.value.userId,
        role: addFormData.value.role
      });
      ElMessage.success("添加成员成功");
      addDialogVisible.value = false;
      await loadMembers();
    } catch (error: any) {
      ElMessage.error(error.message || "添加成员失败");
    } finally {
      addSubmitLoading.value = false;
    }
  };

  const handleEdit = (row: ProjectMemberListItem) => {
    editFormData.value = {
      userId: row.userId,
      role: row.role
    };
    editDialogVisible.value = true;
  };

  const handleUpdate = async () => {
    editSubmitLoading.value = true;
    try {
      await updateProjectMember(projectId, editFormData.value.userId, {
        role: editFormData.value.role
      });
      ElMessage.success("成员角色更新成功");
      editDialogVisible.value = false;
      await loadMembers();
    } catch (error: any) {
      ElMessage.error(error.message || "更新成员角色失败");
    } finally {
      editSubmitLoading.value = false;
    }
  };

  const handleRemove = async (row: ProjectMemberListItem) => {
    try {
      await removeProjectMember(projectId, row.userId);
      ElMessage.success("成员已移除");
      await loadMembers();
    } catch (error: any) {
      ElMessage.error(error.message || "移除成员失败");
    }
  };

  const getRoleType = (role?: string) => {
    const typeMap: Record<string, any> = {
      admin: "danger",
      developer: "primary",
      viewer: "info"
    };
    return typeMap[role || "developer"] || "info";
  };

  const getRoleText = (role?: string) => {
    const textMap: Record<string, string> = {
      admin: "管理员",
      developer: "开发者",
      viewer: "观察者"
    };
    return textMap[role || "developer"] || "未知";
  };

  return {
    members,
    loading,
    page,
    pageSize,
    total,
    search,
    roleFilter,
    allUsers,
    availableUsers,
    editDialogVisible,
    editFormData,
    editSubmitLoading,
    addDialogVisible,
    addFormData,
    addSubmitLoading,
    loadMembers,
    loadAllUsers,
    handleSearch,
    handleFilterChange,
    handleSizeChange,
    handlePageChange,
    handleAdd,
    handleAddSubmit,
    handleEdit,
    handleUpdate,
    handleRemove,
    getRoleType,
    getRoleText
  };
};
