import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 样式
import 'ant-design-vue/dist/reset.css'
import './index.less'

import App from './App.vue'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)

app.mount('#app')
