<template>
  <div class="animation3-container">
    <!-- 顶部背景 + 横幅 + 导航 -->
    <div class="header-section">
      <!-- 滚动横幅 -->
      <div class="scroll-banner-container" ref="bannerContainer">
        <div class="scroll-banner-wrapper" ref="bannerWrapper">
          <img src="/images/rolling.png" alt="banner" class="original-img" />
        </div>
      </div>

      <!-- 导航栏 -->
      <nav class="nav-bar">
        <ul>
          <li @click="$router.push('/about')">About</li>
          <li @click="$router.push('/knowledge')">Knowledge</li>
          <li @click="$router.push('/music')">Music</li>
          <li @click="$router.push('/album')">Album</li>
        </ul>
      </nav>
    </div>

    <!-- 背景图 -->
    <div class="header-bg">
      <img src="/images/background_2.jpg" alt="Background" />
    </div>

    <!-- 内容区 -->
    <main class="content-section">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const bannerContainer = ref(null)
const bannerWrapper = ref(null)

let animationFrameId = null
let isPaused = false
let imgWidth = 0  // 存储图片宽度

// 鼠标悬停暂停
const pauseAnimation = () => { isPaused = true }
const resumeAnimation = () => { isPaused = false }

// 填充图片到足够长度，实现无缝滚动
const fillBannerImages = () => {
  if (!bannerContainer.value || !bannerWrapper.value) return
  const container = bannerContainer.value
  const wrapper = bannerWrapper.value
  const img = wrapper.querySelector('.original-img')

  // 确保图片加载完成
  const loadImage = () => {
    imgWidth = img.offsetWidth
    const containerWidth = container.offsetWidth
    
    // 计算需要的图片数量，确保至少是容器宽度的2倍
    const needCount = Math.ceil((containerWidth * 2) / imgWidth) + 1
    
    // 先清空已有的克隆元素（保留原始元素）
    const existingClones = wrapper.querySelectorAll('.clone-img')
    existingClones.forEach(clone => clone.remove())
    
    // 添加足够的克隆元素
    for (let i = 0; i < needCount; i++) {
      const clone = img.cloneNode(true)
      clone.classList.remove('original-img')
      clone.classList.add('clone-img')
      wrapper.appendChild(clone)
    }
    
    // 确保DOM更新后再开始动画
    nextTick(() => {
      startBannerAnimation()
    })
  }

  if (!img.complete) {
    img.onload = loadImage
  } else {
    loadImage()
  }
}

// 启动滚动动画
const startBannerAnimation = () => {
  if (!bannerWrapper.value || imgWidth === 0) return
  const wrapper = bannerWrapper.value
  let translateX = 0

  // 清除可能存在的旧动画
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  const animate = () => {
    if (!isPaused) {
      translateX -= 0.25  // 滚动速度
      
      // 当滚动距离达到一张图片宽度时，重置位置，实现无缝滚动
      if (Math.abs(translateX) >= imgWidth) {
        translateX += imgWidth  // 不是重置为0，而是向前移动一张图片的宽度
      }
      
      wrapper.style.transform = `translateX(${translateX}px)`
    }
    animationFrameId = requestAnimationFrame(animate)
  }
  
  animate()
}

// 窗口大小改变时重新计算
const handleResize = () => {
  // 暂停当前动画
  const wasPaused = isPaused
  isPaused = true
  
  // 重新填充图片并重启动画
  nextTick(() => {
    fillBannerImages()
    isPaused = wasPaused
  })
}

onMounted(() => {
  fillBannerImages()
  
  // 添加事件监听
  bannerContainer.value?.addEventListener('mouseenter', pauseAnimation)
  bannerContainer.value?.addEventListener('mouseleave', resumeAnimation)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  bannerContainer.value?.removeEventListener('mouseenter', pauseAnimation)
  bannerContainer.value?.removeEventListener('mouseleave', resumeAnimation)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.animation3-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 顶部背景区域 + 横幅 + 导航 */
.header-section {
  position: relative;
  height: 30%;
}

/* 背景图 */
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 30%;
  z-index: -1;
}

.header-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 滚动横幅 */
.scroll-banner-container {
  position: relative;
  width: 100%;
  height: 25px;
  overflow: hidden;
}

.scroll-banner-wrapper {
  display: flex;
  will-change: transform;
}

.scroll-banner-wrapper img {
  max-height: 100%;
  max-width: 250px; 
  flex-shrink: 0;
  object-fit: contain;
  background-color: transparent;
}

/* 导航栏 */
.nav-bar {
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.6);
}

.nav-bar ul {
  display: flex;
  justify-content: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-bar li {
  margin: 0 20px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
}

/* 内容区 */
.content-section {
  flex: 1;
  overflow-y: auto;
  background-image: url('/images/background_3.png'); 
  background-size: cover; 
  background-position: center; 
  background-repeat: no-repeat; 
  background-attachment: local; 
  padding: 20px; 
}
</style>
