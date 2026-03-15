<template>
  <div id="app">
    <nav class="bg-gray-800 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <h1 class="text-xl font-bold">OOPS-AI</h1>
          <span class="text-sm text-gray-300">软件团队专属需求智能体</span>
        </div>
        <div class="space-x-4">
          <router-link to="/" class="hover:text-blue-300">需求分析</router-link>
          <router-link to="/requirements" class="hover:text-blue-300">需求管理</router-link>
          <router-link to="/llm-config" class="hover:text-blue-300">AI配置</router-link>
        </div>
      </div>
    </nav>
    <main class="container mx-auto p-4">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>