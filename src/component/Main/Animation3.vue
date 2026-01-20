<template>
  <div class="animation3-container">
    <!-- 右上角友链按钮 -->
    <div class="friend-links-button" @click="goToFriendLinks">
      <span class="friend-links-icon">🌐</span>
      <span class="friend-links-text">友链</span>
    </div>

    <!-- 左上角悬浮音乐播放器 -->
    <div class="floating-music-player" v-if="showFloatingPlayer">
      <div class="player-header">
        <div class="album-art" @click="goToMusicPlaylist">
          <img :src="currentTrackCover" alt="Album Art" class="album-thumb" />
        </div>
        <div class="track-info" @click="goToMusicPlaylist">
          <h4>{{ currentTrackTitle }}</h4>
          <p>{{ currentTrackArtist }}</p>
        </div>
        <div class="player-controls">
          <button @click.stop="playPrevious" class="control-btn mini">⏮️</button>
          <button @click.stop="togglePlay" class="control-btn mini">{{ isPlaying ? '⏸️' : '▶️' }}</button>
          <button @click.stop="playNext" class="control-btn mini">⏭️</button>
        </div>
      </div>
    </div>

    <div class="header-section">
      <div class="header-bg">
        <img src="/images/background_2.jpg" alt="Background" />
      </div>

      <div class="scroll-banner-container" ref="bannerContainer">
        <div class="scroll-banner-wrapper" ref="bannerWrapper">
          <img src="/images/rolling.png" alt="banner" class="original-img" />
        </div>
      </div>

      <nav class="nav-bar">
        <ul>
          <li @click="$router.push('/animation3/about')" class="nav-item">
            <span class="nav-text">About</span>
          </li>
          <li @click="$router.push('/animation3/article')" class="nav-item">
            <span class="nav-text">Article</span>
          </li>
          <li @click="$router.push('/animation3/music')" class="nav-item">
            <span class="nav-text">Music</span>
          </li>
          <li @click="$router.push('/animation3/album')" class="nav-item">
            <span class="nav-text">Album</span>
          </li>
        </ul>
      </nav>
    </div>

    <main class="content-section">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/musicStore'

const bannerContainer = ref(null)
const bannerWrapper = ref(null)
const router = useRouter()
const musicStore = useMusicStore()

let animationFrameId = null
let isPaused = false
let imgWidth = 0

// 悬浮音乐播放器相关状态
const showFloatingPlayer = ref(true) // 总是显示悬浮播放器
const currentTrackTitle = ref('暂无歌曲')
const currentTrackArtist = ref('未知艺术家')
const currentTrackCover = ref('/images/background_1.png')
const isPlaying = ref(false)

// 同步音乐播放器状态
watch(() => musicStore.currentTrack, (newTrack) => {
  if (newTrack) {
    currentTrackTitle.value = newTrack.title
    currentTrackArtist.value = newTrack.artist
    currentTrackCover.value = `/music/${newTrack.coverImage}`
  } else {
    currentTrackTitle.value = '暂无歌曲'
    currentTrackArtist.value = '未知艺术家'
    currentTrackCover.value = '/images/background_1.png'
  }
}, { immediate: true })

watch(() => musicStore.isPlaying, (newPlayingState) => {
  isPlaying.value = newPlayingState
}, { immediate: true })

// 导航到音乐播放列表页
const goToMusicPlaylist = () => {
  router.push('/animation3/music/playlist')
}

// 导航到友链页面
const goToFriendLinks = () => {
  router.push('/animation3/friends')
}

// 播放/暂停控制
const togglePlay = () => {
  musicStore.togglePlay()
}

// 下一首
const playNext = () => {
  musicStore.playNext()
}

// 上一首
const playPrevious = () => {
  musicStore.playPrevious()
}

const pauseAnimation = () => { isPaused = true }
const resumeAnimation = () => { isPaused = false }

// --- 保持你原始的滚动逻辑不变 ---
const fillBannerImages = () => {
  if (!bannerContainer.value || !bannerWrapper.value) return
  const container = bannerContainer.value
  const wrapper = bannerWrapper.value
  const img = wrapper.querySelector('.original-img')

  const loadImage = () => {
    imgWidth = img.offsetWidth
    const containerWidth = container.offsetWidth
    const needCount = Math.ceil((containerWidth * 2) / imgWidth) + 1
    const existingClones = wrapper.querySelectorAll('.clone-img')
    existingClones.forEach(clone => clone.remove())
    
    for (let i = 0; i < needCount; i++) {
      const clone = img.cloneNode(true)
      clone.classList.remove('original-img')
      clone.classList.add('clone-img')
      wrapper.appendChild(clone)
    }
    nextTick(() => { startBannerAnimation() })
  }

  if (!img.complete) { img.onload = loadImage } else { loadImage() }
}

const startBannerAnimation = () => {
  if (!bannerWrapper.value || imgWidth === 0) return
  const wrapper = bannerWrapper.value
  let translateX = 0
  if (animationFrameId) { cancelAnimationFrame(animationFrameId) }

  const animate = () => {
    if (!isPaused) {
      translateX -= 0.25
      if (Math.abs(translateX) >= imgWidth) { translateX += imgWidth }
      wrapper.style.transform = `translateX(${translateX}px)`
    }
    animationFrameId = requestAnimationFrame(animate)
  }
  animate()
}

const handleResize = () => {
  isPaused = true
  nextTick(() => { fillBannerImages(); isPaused = false })
}

onMounted(() => {
  fillBannerImages()
  bannerContainer.value?.addEventListener('mouseenter', pauseAnimation)
  bannerContainer.value?.addEventListener('mouseleave', resumeAnimation)
  window.addEventListener('resize', handleResize)
  
  // 监听路由变化更新播放器信息
  router.afterEach(() => {
    // 更新播放器信息通过响应式状态已经自动处理
  })
})
</script>

<style scoped>
.animation3-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
}

/* 友链按钮 */
.friend-links-button {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 8px 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.friend-links-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.friend-links-icon {
  font-size: 1.2rem;
}

.friend-links-text {
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

/* 悬浮音乐播放器 */
.floating-music-player {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 99;
  width: 300px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.floating-music-player:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.2);
}

.player-header {
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 10px;
}

.album-art {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.album-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-info {
  flex-grow: 1;
  cursor: pointer;
  overflow: hidden;
}

.track-info h4 {
  margin: 0 0 4px 0;
  color: white;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-info p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-controls {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}

.control-btn.mini {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.control-btn.mini:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.header-section {
  position: relative;
  height: 30%;
  overflow: hidden;
}

/* 背景图层：z-index 设为最小，保证不挡住横幅 */
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; 
}
.header-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 滚动横幅层：z-index 调高，确保脚本能抓到元素 */
.scroll-banner-container {
  position: relative;
  z-index: 5; 
  width: 100%;
  height: 25px;
  overflow: hidden;
}
.scroll-banner-wrapper {
  display: flex;
  will-change: transform;
}
.scroll-banner-wrapper img {
  max-height: 25px;
  max-width: 250px; 
  flex-shrink: 0;
  object-fit: contain;
}

/* 导航栏层 */
.nav-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.6);
  z-index: 10;
  transition: background-color 0.4s ease;
}

.nav-bar ul {
  display: flex;
  width: 100%;
  height: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-text {
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  transition: all 0.4s ease;
}

/* 悬停动画逻辑 */
.nav-bar ul:hover .nav-item {
  flex: 0;
  opacity: 0;
}
.nav-bar ul .nav-item:hover {
  flex: 1;
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.8);
}
.nav-item:hover .nav-text {
  font-size: 1.4rem;
  letter-spacing: 4px;
}

.content-section {
  flex: 1;
  overflow-y: auto;
  background-image: url('/images/background_3.png'); 
  background-size: cover; 
  background-position: center; 
  padding: 20px; 
}
</style>