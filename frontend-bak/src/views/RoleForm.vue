<template>
  <div class="space-y-6">
    <!-- 面包屑和顶部区域 -->
    <div class="flex items-center space-x-4 mb-2">
      <el-button
        @click="goBack"
        :icon="Back"
        circle
        class="border-gray-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm"
      />
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/roles' }"
            >角色管理</el-breadcrumb-item
          >
          <el-breadcrumb-item>{{
            isEditing ? "编辑角色" : "新建角色"
          }}</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="text-2xl font-bold text-gray-900 mt-2">
          {{ isEditing ? "编辑角色" : "创建新角色" }}
        </h2>
      </div>
    </div>

    <!-- 表单卡片 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div v-if="loading" class="py-12 flex justify-center">
        <el-icon class="is-loading text-4xl text-indigo-500"
          ><Loading
        /></el-icon>
      </div>

      <el-form
        v-else
        ref="roleFormRef"
        :model="role"
        :rules="rules"
        label-position="top"
        class="max-w-2xl"
      >
        <div class="space-y-6">
          <el-form-item label="角色名称" prop="name">
            <el-input
              v-model="role.name"
              placeholder="请输入角色名称（如：系统管理员）"
              size="large"
              class="rounded-lg shadow-sm"
            >
              <template #prefix>
                <el-icon><CollectionTag /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="角色描述" prop="description">
            <el-input
              v-model="role.description"
              type="textarea"
              :rows="4"
              placeholder="请详细描述该角色的主要指责和权限范围..."
              class="rounded-lg shadow-sm"
            />
          </el-form-item>
        </div>

        <div
          class="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-4"
        >
          <el-button @click="goBack" size="large" class="rounded-xl px-6">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="submitting"
            size="large"
            class="rounded-xl px-8 bg-gradient-to-r from-indigo-500 to-purple-500 border-none shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-white font-medium"
          >
            {{ isEditing ? "保存修改" : "确认创建" }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import axios from "../utils/api";
import { Back, CollectionTag, Loading } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

const isEditing = computed(() => route.path.includes("/edit"));
const roleId = computed(() => route.params.id as string);

const roleFormRef = ref<FormInstance>();
const loading = ref(false);
const submitting = ref(false);

const role = ref({
  name: "",
  description: "",
});

const rules = {
  name: [
    { required: true, message: "请输入角色名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
};

const fetchRole = async () => {
  if (!isEditing.value) return;

  loading.value = true;
  try {
    const response = await axios.get(`/roles/${roleId.value}`);
    const data = response.data;
    role.value = {
      name: data.name || "",
      description: data.description || "",
    };
  } catch (error) {
    ElMessage.error("获取角色信息失败");
    goBack();
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push("/roles");
};

const handleSubmit = async () => {
  if (!roleFormRef.value) return;

  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        if (isEditing.value) {
          await axios.put(`/roles/${roleId.value}`, role.value);
          ElMessage.success("角色更新成功");
        } else {
          await axios.post("/roles", role.value);
          ElMessage.success("角色创建成功");
        }
        goBack();
      } catch (error: any) {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "操作失败";
        ElMessage.error(msg);
      } finally {
        submitting.value = false;
      }
    }
  });
};

onMounted(async () => {
  await fetchRole();
});
</script>
