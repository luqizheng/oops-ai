const Layout = () => import("@/layout/index.vue");

export default {
  path: "/system",
  name: "System",
  component: Layout,
  redirect: "/system/user",
  meta: {
    title: "系统管理",
    icon: "ri:settings-3-line",
    rank: 10
  },
  children: [
    {
      path: "/system/user",
      name: "UserManagement",
      component: () => import("@/views/system/user/index.vue"),
      meta: {
        title: "用户管理",
        icon: "ri:user-settings-line",
        showLink: true,
        // roles: ["admin", "super-admin"],
        keepAlive: false
      }
    },

    {
      path: "/system/llm-config",
      name: "LLMConfigManagement",
      component: () => import("@/views/system/llm-config/index.vue"),
      meta: {
        title: "LLM 配置",
        icon: "ri:robot-line",
        showLink: true,
        keepAlive: false
      }
    },
    {
      path: "/system/prompt-template",
      name: "PromptTemplateManagement",
      component: () => import("@/views/system/prompt-template/index.vue"),
      meta: {
        title: "提示词模板",
        icon: "ri-file-text-line",
        showLink: true,
        keepAlive: false
      }
    }
  ]
} satisfies RouteConfigsTable;
