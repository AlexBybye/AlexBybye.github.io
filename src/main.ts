import { createApp } from 'vue'
import { createPinia } from 'pinia' // 引入Pinia
import { useMusicStore } from '@/stores/musicStore' // 导入音乐store
import { useAudioManager } from '@/stores/audioManager' // 导入音频管理器

import App from './App.vue'
import router from './router/router'

const app = createApp(App)

app.use(createPinia()) // 使用Pinia
app.use(router)

// 在应用挂载前加载音乐数据
app.mount('#app')

// 在应用挂载后立即加载音乐列表和初始化音频管理器
const musicStore = useMusicStore()
musicStore.loadTracks()

// 初始化音频管理器
const audioManager = useAudioManager()
audioManager.initialize()