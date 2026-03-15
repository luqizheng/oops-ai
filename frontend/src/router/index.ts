import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/RequirementAnalysis.vue')
    },
    {
      path: '/requirements',
      name: 'requirements',
      component: () => import('@/views/RequirementManagement.vue')
    },
    {
      path: '/llm-config',
      name: 'llm-config',
      component: () => import('@/views/LLMConfiguration.vue')
    }
  ]
})

export default router