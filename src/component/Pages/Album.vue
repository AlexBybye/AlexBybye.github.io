<template>
  <div 
    class="album-page-container" 
    :class="{ 'page-throw-up': isLeaving }"
    :style="{ opacity: isLeaving ? 1 : (isHovered ? 0.8 : 0.2) }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <h1>Photo Albums</h1>
    
    <div class="album-list">
      <div 
        v-for="(album, index) in albums" 
        :key="album.id"
        class="album-row"
        @click="goToAlbum(album.id, index)"
      >
        <div class="album-info">
          <div class="text-group">
            <h3 class="artistic-title">{{ album.title }}</h3>
            <span class="album-date">{{ album.date }}</span>
          </div>
        </div>
        
        <div class="album-images-container">
          <div class="image-strip" :ref="el => setStripRef(el, index)">
            <div v-for="group in 3" :key="group" class="film-unit">
              <div class="decoration-bar top-bar"></div>
              <div class="images-wrapper">
                <div v-for="n in album.count" :key="n" class="album-image">
                  <img 
                    :src="`/album/${album.id}/photo_${n}.jpg`" 
                    @error="handleImgFallback($event, album.id)" 
                  />
                </div>
              </div>
              <div class="decoration-bar bottom-bar"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div 
        v-if="isLeaving" 
        class="flash-overlay" 
        :style="{ opacity: flashOpacity }"
      ></div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const albums = ref<any[]>([])
const stripRefs = ref<HTMLElement[]>([])
const speeds = ref<number[]>([])
const isHovered = ref(false)
const isLeaving = ref(false)
const flashOpacity = ref(0)
const animationId = ref(0)

// 关键修复：图片空缺处理
const handleImgFallback = (e: Event, albumId: string) => {
  const img = e.target as HTMLImageElement;
  // 1. 如果 jpg 失败，尝试 png
  if (img.src.endsWith('.jpg')) {
    img.src = img.src.replace('.jpg', '.png');
    return;
  }
  // 2. 如果 png 也失败，加载当前相册的 photo_1 作为占位（通常 photo_1 肯定存在）
  // 这样可以保证胶片序列是完整的，没有黑洞
  const fallbackUrl = `/album/${albumId}/photo_1.jpg`;
  if (img.src !== window.location.origin + fallbackUrl) {
    img.src = fallbackUrl;
  } else {
    // 3. 如果连 photo_1 都没有，显示一张全站通用的占位底图
    img.src = '/assets/placeholder-film.jpg'; 
  }
}

const loadAlbums = async () => {
  try {
    const res = await fetch('/album/albumcontext.json');
    if (res.ok) {
      albums.value = await res.json();
      // 初始化速度：初始非常慢
      speeds.value = albums.value.map(() => 0.5);
    }
  } catch (e) { console.error(e); }
}

const setStripRef = (el: any, index: number) => { if (el) stripRefs.value[index] = el }

const startAnimations = () => {
  const animate = () => {
    stripRefs.value.forEach((strip, i) => {
      if (!strip) return;
      
      // 速度逻辑：未悬停 0.5，悬停 1.8，点击后指数爆发
      let targetSpeed = isHovered.value ? 1.8 : 0.5;
      
      // 缓动平滑速度切换
      speeds.value[i] += (targetSpeed - speeds.value[i]) * 0.1;

      const direction = i % 2 === 0 ? 1 : -1;
      let currentX = parseFloat(strip.getAttribute('data-x') || '0');
      
      currentX -= speeds.value[i] * direction;
      
      const unitWidth = strip.firstElementChild?.clientWidth || 0;
      if (unitWidth > 0) {
        if (direction === 1) {
          if (Math.abs(currentX) >= unitWidth) currentX = 0;
        } else {
          if (currentX >= 0) currentX = -unitWidth;
        }
      }

      strip.setAttribute('data-x', currentX.toString());
      strip.style.transform = `translateX(${currentX}px)`;
      
      // 点击跳转时的逻辑
      if (isLeaving.value) {
        speeds.value[i] *= 1.2; // 极速飞出
        flashOpacity.value = Math.min(0.8, flashOpacity.value + 0.015); // 渐变到 0.8
      }
    });
    animationId.value = requestAnimationFrame(animate);
  }
  animate();
}

const goToAlbum = (id: string, index: number) => {
  if (isLeaving.value) return;
  isLeaving.value = true;
  setTimeout(() => router.push(`/animation3/album/detail/${id}`), 1000);
}

onMounted(async () => { await loadAlbums(); startAnimations(); })
onUnmounted(() => cancelAnimationFrame(animationId.value))
</script>

<style scoped>
.album-page-container {
  width: 90%;
  margin: 0 auto;
  padding: 40px 0;
  background-color: #333;
  min-height: 90vh;
  transition: opacity 0.6s ease;
  overflow: hidden;
}

.album-list {
  display: flex;
  flex-direction: column;
  gap: 0; 
}

.album-row {
  display: flex;
  height: 180px;
  cursor: pointer;
  background: #f0f0f0;
  overflow: hidden;
  border-bottom: 1px solid #444;
}

.album-info {
  width: 15%;
  flex-shrink: 0;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  border-right: 1px solid #999;
}

.artistic-title {
  color: white;
  font-family: 'Impact', sans-serif;
  font-size: 1.1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  white-space: nowrap;
  text-transform: uppercase;
}

.album-images-container {
  flex-grow: 1;
  overflow: hidden;
  background: #111; /* 深色背景防止闪烁 */
}

.image-strip { display: flex; height: 100%; }

.film-unit { 
  display: flex; 
  flex-direction: column; 
  flex-shrink: 0; 
  min-width: 100%; /* 确保单组长度不低于容器 */
}

.images-wrapper { display: flex; height: 140px; }

.album-image { 
  width: 240px; 
  height: 100%; 
  flex-shrink: 0; 
}

.album-image img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; /* 改为 cover 避免拉伸畸形 */
}

/* 装饰条紧凑对齐 */
.decoration-bar {
  height: 20px;
  width: 100%;
  background: repeating-linear-gradient(
    to right,
    #000 0px, #000 40px,
    #fff 40px, #fff 80px
  );
}

.flash-overlay {
  position: fixed;
  inset: 0;
  background: white;
  z-index: 99999;
  pointer-events: none;
}

.page-throw-up {
  pointer-events: none;
  animation: throwOut 0.8s forwards ease-in;
}

@keyframes throwOut {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}
</style>