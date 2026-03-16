import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// 引入 Element Plus
import ElementPlus from 'element-plus'
// 引入自定义主题
import './styles/element-plus-theme.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')