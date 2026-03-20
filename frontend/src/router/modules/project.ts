const Layout = () => import("@/layout/index.vue");

export default {
  path: "/project",
  name: "ProjectManagement",
  component: Layout,
  redirect: "/project/list",
  meta: {
    title: "项目管理",
    icon: "ri:settings-3-line",
    rank: 10
  },
  children: [
    {
      path: "/project/list",
      name: "ProjectList",
      component: () => import("@/views/system/project/index.vue"),
      meta: {
        title: "项目管理",
        icon: "ri:folder-settings-line",
        showLink: true,
        //roles: ["admin", "super-admin", "user"],
        keepAlive: false
      }
    },
    {
      path: "/project/:id",
      name: "ProjectDetail",
      component: () => import("@/views/system/project/projectDetail/index.vue"),
      meta: {
        title: "项目详情",
        icon: "ri:folder-open-line",
        showLink: false,
        //roles: ["admin", "super-admin", "user"],
        keepAlive: false,
        activePath: "/system/project"
      }
    },
    {
      path: "/project/:id/raw-requirement",
      name: "RawRequirementDetail",
      component: () =>
        import("@/views/system/project/projectDetail/RawRequirementDetail.vue"),
      meta: {
        title: "原始需求详情",
        icon: "ri:file-text-line",
        showLink: false,
        //roles: ["admin", "super-admin", "user"],
        keepAlive: false,
        activePath: "/project"
      }
    },
    {
      path: "/project/:id/raw-requirement/:requirementId",
      name: "RawRequirementEdit",
      component: () =>
        import("@/views/system/project/projectDetail/RawRequirementDetail.vue"),
      meta: {
        title: "编辑原始需求",
        icon: "ri:file-text-line",
        showLink: false,
        //roles: ["admin", "super-admin", "user"],
        keepAlive: false,
        activePath: "/project"
      }
    }
  ]
} satisfies RouteConfigsTable;
