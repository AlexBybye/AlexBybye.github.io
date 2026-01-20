import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/router'
import { useMusicStore } from './stores/musicStore'
import { useAudioManager } from './stores/audioManager'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化音乐store和音频管理器
const musicStore = useMusicStore()
const audioManager = useAudioManager()

// 初始化音频管理器
audioManager.init()

// 应用启动时加载音乐
musicStore.loadTracks().then(() => {
  console.log('Music tracks loaded successfully')
}).catch(error => {
  console.error('Failed to load music tracks:', error)
})

app.mount('#app')