import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/RequirementAnalysis.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/requirements',
      name: 'requirements',
      component: () => import('@/views/RequirementManagement.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/llm-config',
      name: 'llm-config',
      component: () => import('@/views/LLMConfiguration.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('@/views/RoleManagement.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UserManagement.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/organizations',
      name: 'organizations',
      component: () => import('@/views/OrganizationManagement.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectManagement.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/project-calendar',
      name: 'project-calendar',
      component: () => import('@/views/ProjectCalendar.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')
  
  if (to.meta.requiresAuth !== false && !isAuthenticated) {
    // Redirect to login if route requires auth and user is not authenticated
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    // Redirect to home if user is already authenticated and trying to access login/register
    next('/')
  } else {
    next()
  }
})

export default router