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
      path: "/system/project",
      name: "ProjectManagement",
      component: () => import("@/views/system/project/index.vue"),
      meta: {
        title: "项目管理",
        icon: "ri:folder-settings-line",
        showLink: true,
        //roles: ["admin", "super-admin", "user"],
        keepAlive: false
      }
    }
  ]
} satisfies RouteConfigsTable;
