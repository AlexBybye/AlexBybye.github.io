<template>
  <div class="page-container" :class="{ 'page-throw-up': isLeaving }">
    <h1>My Music</h1>
    <p>Discover the music that inspires me.</p>

    <div class="music-interaction-area">
      <div class="music-entry floating-entry" @click="startTransition('/animation3/music/playlist')">
        <div class="music-icon">♬</div>
      </div>

      <div class="music-entry playlist-card" @click="startTransition('/animation3/music/playlist')">
        <div class="playlist-content">
          <div class="playlist-icon">📻</div>
          <span>PLAYLIST</span>
        </div>
      </div>

      <div class="music-entry floating-entry" @click="startTransition('/animation3/music/playlist')">
        <div class="music-icon">♫</div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="isAnimating" class="animation-overlay">
        <div class="wave-bars">
          <div v-for="i in 25" :key="i" class="wave-bar" :style="getWaveStyle(i)"></div>
        </div>
        <div class="floating-notes">
          <div v-for="i in 10" :key="i" class="note" :style="getNoteStyle(i)">
            {{ ['♪', '♫', '♬', '♭'][i % 4] }}
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLeaving = ref(false);
const isAnimating = ref(false);

const startTransition = (path) => {
  isLeaving.value = true;
  // 300ms 后开启音符脉冲遮罩
  setTimeout(() => {
    isAnimating.value = true;
  }, 300);
  // 1.5秒后跳转
  setTimeout(() => {
    router.push(path);
  }, 1500);
};

const getWaveStyle = (i) => ({
  animationDelay: `${i * 0.05}s`,
  left: `${(i - 1) * 4}%`,
  height: `${Math.random() * 50 + 30}%`
});

const getNoteStyle = (i) => ({
  animationDelay: `${i * 0.2}s`,
  left: `${Math.random() * 90}%`
});
</script>

<style scoped>
/* 1. 保留你原来的透明度逻辑 */
.page-container {
  width: 80%;
  margin: 0 auto;
  padding: 40px;
  background-color: #333;
  min-height: calc(100vh - 30% - 40px);
  opacity: 0.1; /* 初始透明度 0.1 */
  transition: all 0.5s ease;
  border-radius: 20px;
}

.page-container:hover {
  opacity: 0.8; /* 悬停透明度 0.8 */
}

/* 2. 布局：左右音符，中间卡片 */
.music-interaction-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
  margin-top: 60px;
}

/* 音乐符号入口：保持你原来的光效，增加浮动 */
.music-icon {
  font-size: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 10px rgba(100, 200, 255, 0.5));
  animation: floatUpDown 3s infinite ease-in-out;
}

.music-icon:hover {
  transform: scale(1.2);
  filter: drop-shadow(0 0 20px rgba(100, 200, 255, 0.8));
}

/* 中间 Playlist 卡片样式 */
.playlist-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 30px 50px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.playlist-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
}

.playlist-icon { font-size: 40px; margin-bottom: 10px; }
.playlist-card span { color: #fff; letter-spacing: 2px; font-weight: bold; }

/* 3. 动画：页面向上抛走 */
.page-throw-up {
  pointer-events: none;
  animation: throwOut 0.8s forwards cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes throwOut {
  0% { transform: translateY(0); opacity: 0.8; }
  100% { transform: translateY(-100vh) rotate(-2deg); opacity: 0; }
}

/* 4. 全屏音符脉冲动画 (保留并优化) */
.animation-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #0f0c29, #24243e);
  z-index: 9999;
  animation: fadeIn 0.4s ease;
}

.wave-bar {
  position: absolute;
  bottom: 0;
  width: 3%;
  background: linear-gradient(to top, #00dbde, #fc00ff);
  animation: waveBurst 1.2s infinite ease-in-out;
  border-radius: 5px 5px 0 0;
}

@keyframes waveBurst {
  0%, 100% { transform: scaleY(0.2); opacity: 0.3; }
  50% { transform: scaleY(1); opacity: 0.7; }
}

@keyframes floatUpDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* 复用音符漂浮 */
.note {
  position: absolute;
  bottom: 0;
  color: #fff;
  font-size: 30px;
  animation: floatNoteUp 2s forwards linear;
}

@keyframes floatNoteUp {
  0% { transform: translateY(0) opacity(0); }
  100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

h1, p { text-align: center; color: #fff; }
</style>