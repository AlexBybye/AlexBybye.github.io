<template>
  <div class="page-container" :class="{ 'page-throw-up': isLeaving }">
    <h1>Music</h1>
    <p>Discover the music that inspires me.</p>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <!-- 上方入口区域 -->
    <div class="music-interaction-area">
      <div class="music-entry floating-entry" @click="startTransition('/animation3/music/playlist')">
        <div class="music-icon glitch-hover" data-glitch="♬">♬</div>
        <div class="telemetry">
          <span>LN_01: ACTIVE</span>
          <span>FREQ: 44.1KHZ</span>
        </div>
      </div>

      <div class="music-entry playlist-card" @click="startTransition('/animation3/music/playlist')">
        <div class="playlist-content">
          <div class="playlist-icon">📻</div>
          <span>PLAYLIST</span>
        </div>
        <div class="telemetry center">
          <span>SYSTEM_SYNC: OK [98.2%]</span>
        </div>
      </div>

      <div class="music-entry floating-entry" @click="startTransition('/animation3/music/playlist')">
        <div class="music-icon glitch-hover" data-glitch="♫">♫</div>
        <div class="telemetry">
          <span>BITRATE: 320K</span>
          <span>LATENCY: 12MS</span>
        </div>
      </div>
    </div>

    <!-- 中央电路图层 -->
    <div class="tech-grid-overlay">
      <svg viewBox="0 0 1000 300" class="circuit-lines">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#glow)">
          <!-- 主连接线 -->
          <path d="M200,50 V100 L500,200" class="path-line" />
          <path d="M500,50 V200" class="path-line" />
          <path d="M800,50 V100 L500,200" class="path-line" />

          <!-- 辅助连接线 -->
          <path d="M200,150 L400,180" class="path-line secondary" />
          <path d="M600,180 L800,150" class="path-line secondary" />
        </g>

        <!-- 动态数据点 -->
        <circle r="5" fill="#00f3ff" class="data-pulse">
          <animateMotion dur="2.5s" repeatCount="indefinite" path="M200,50 V100 L500,200" />
        </circle>
        <circle r="5" fill="#ff00ff" class="data-pulse">
          <animateMotion dur="2s" repeatCount="indefinite" path="M500,50 V200" />
        </circle>
        <circle r="5" fill="#00f3ff" class="data-pulse">
          <animateMotion dur="2.2s" repeatCount="indefinite" path="M800,50 V100 L500,200" />
        </circle>
        <circle r="4" fill="#ffff00" class="data-pulse">
          <animateMotion dur="3s" repeatCount="indefinite" path="M200,150 L400,180" />
        </circle>
        <circle r="4" fill="#00ff00" class="data-pulse">
          <animateMotion dur="2.8s" repeatCount="indefinite" path="M600,180 L800,150" />
        </circle>
      </svg>
      <div class="core-tag">CORE_LINK_ESTABLISHED</div>
    </div>

    <!-- 底部遥测信息 -->
    <div class="telemetry-grid">
      <div class="telemetry-code">LOADING... 78%</div>
      <div class="telemetry-code">BITRATE: 320KBPS</div>
      <div class="telemetry-code">FREQ: 44.1KHZ</div>
      <div class="telemetry-code">BUFFER: 2.4S</div>
      <div class="telemetry-code">STATUS: ONLINE</div>
      <div class="telemetry-code">PEAK: -1.2dB</div>
      <div class="telemetry-code">RMS: -8.7dB</div>
      <div class="telemetry-code">CPU: 12%</div>
      <div class="telemetry-code">RAM: 34%</div>
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
  setTimeout(() => {
    isAnimating.value = true;
  }, 300);
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
/* --- 原有基础样式保持不变 --- */
.page-container {
  width: 80%;
  margin: 0 auto;
  padding: 60px 40px;
  /* 增加上下内边距增加呼吸感 */
  background-color: #1a1a1a;
  /* 加深背景，让科幻光效更明显 */
  min-height: calc(100vh - 30% - 40px);
  opacity: 0.1;
  transition: all 0.5s ease;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 243, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-container:hover {
  opacity: 0.8;
}

/* 增加悬停透明度，更清晰 */

.music-interaction-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 100px;
  /* 进一步拉大间距防止挤压 */
  margin: 60px 0 80px 0;
  /* 使用margin而非padding，更灵活 */
  position: relative;
  z-index: 10;
  width: 100%;
}

/* --- 音乐入口项 --- */
.music-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  z-index: 15;
}

.music-entry:hover {
  transform: scale(1.05);
}

.music-icon {
  font-size: 80px;
  /* 进一步增大图标 */
  margin-bottom: 12px;
  text-shadow: 0 0 15px rgba(0, 243, 255, 0.7);
}

.playlist-card {
  padding: 50px 70px;
  /* 进一步增大卡片 */
  border: 2px solid rgba(0, 243, 255, 0.3);
  background: rgba(0, 243, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.playlist-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00f3ff, transparent);
  animation: scanline 3s infinite linear;
}

@keyframes scanline {
  100% {
    left: 100%;
  }
}

.playlist-card span {
  font-size: 20px;
  /* 进一步增大文字 */
  margin-top: 10px;
}

.playlist-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

/* --- 技术网格覆盖层 --- */
.tech-grid-overlay {
  position: relative;
  width: 100%;
  height: 300px;
  /* 固定高度避免挤压 */
  margin: 40px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circuit-lines {
  width: 100%;
  height: 100%;
  position: absolute;
  top: -180px;
  left: 0;
}

/* --- 线条与数据流优化 --- */
.path-line {
  fill: none;
  stroke: #00f3ff;
  stroke-width: 2.5;
  stroke-dasharray: 6, 6;
  /* 间隙进一步拉大 */
  filter: drop-shadow(0 0 5px rgba(0, 243, 255, 0.5));
}

.path-line.secondary {
  stroke: rgba(0, 243, 255, 0.4);
  stroke-width: 1.5;
  stroke-dasharray: 4, 4;
}

.data-pulse {
  filter: drop-shadow(0 0 10px #00f3ff);
  /* 数据点外发光增强 */
}

/* --- 字体大小优化 --- */
.telemetry {
  font-size: 12px;
  /* 进一步增大字体 */
  font-weight: bold;
  color: rgba(0, 243, 255, 0.9);
  text-shadow: 0 0 5px rgba(0, 243, 255, 0.5);
  margin-top: 8px;
  white-space: nowrap;
  /* 防止文字换行造成挤压 */
}

.telemetry span {
  display: block;
  margin: 3px 0;
}

.telemetry-code {
  font-size: 13px;
  /* 进一步增大字体 */
  font-weight: 800;
  color: rgba(0, 243, 255, 0.5);
  letter-spacing: 1.2px;
  margin: 6px 0;
  white-space: nowrap;
  /* 防止文字换行 */
}

.core-tag {
  font-size: 14px;
  /* 增大标签字体 */
  font-weight: bold;
  padding: 6px 16px;
  border: 2px solid #00f3ff;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.4);
  background: rgba(0, 0, 0, 0.3);
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
}

/* --- 遥测网格 --- */
.telemetry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  /* 自适应列宽 */
  gap: 15px;
  width: 100%;
  margin-top: 60px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 243, 255, 0.1);
  border-radius: 8px;
}

/* --- 其余动画逻辑保持一致 --- */
.glitch-hover {
  position: relative;
  display: inline-block;
  transition: all 0.3s ease;
}

.glitch-hover::before,
.glitch-hover::after {
  content: attr(data-glitch);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.glitch-hover::before {
  left: 3px;
  text-shadow: -3px 0 #ff00ff;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim 0.5s infinite linear alternate-reverse;
}

.glitch-hover::after {
  left: -3px;
  text-shadow: -3px 0 #00ffff;
  clip: rect(10px, 450px, 30px, 0);
  animation: glitch-anim2 0.5s infinite linear alternate-reverse;
}

.glitch-hover:hover::before,
.glitch-hover:hover::after {
  opacity: 0.8;
}

@keyframes glitch-anim {
  0% {
    clip: rect(20px, 999px, 30px, 0);
  }

  100% {
    clip: rect(60px, 999px, 80px, 0);
  }
}

@keyframes glitch-anim2 {
  0% {
    clip: rect(40px, 999px, 50px, 0);
  }

  100% {
    clip: rect(10px, 999px, 40px, 0);
  }
}

.telemetry-grid {
  position: absolute;
  top: 15%;
  left: 5%;
  width: 90%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  pointer-events: none;
}

@keyframes floatUpDown {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

.page-throw-up {
  pointer-events: none;
  animation: throwOut 0.8s forwards cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes throwOut {
  0% {
    transform: translateY(0);
    opacity: 0.8;
  }

  100% {
    transform: translateY(-100vh) rotate(-2deg);
    opacity: 0;
  }
}

.animation-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, #1b2735 0%, #090a0f 100%);
  z-index: 9999;
}

.wave-bar {
  position: absolute;
  bottom: 0;
  width: 3%;
  background: linear-gradient(to top, #00f3ff, #ff00ff);
  animation: waveBurst 1.2s infinite ease-in-out;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.5);
}

@keyframes waveBurst {

  0%,
  100% {
    transform: scaleY(0.2);
    opacity: 0.3;
  }

  50% {
    transform: scaleY(1);
    opacity: 0.8;
  }
}

.note {
  position: absolute;
  bottom: 0;
  color: #fff;
  font-size: 40px;
  text-shadow: 0 0 10px #00f3ff;
  animation: floatNoteUp 2s forwards linear;
}

@keyframes floatNoteUp {
  0% {
    transform: translateY(0);
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

h1 {
  font-size: 3rem;
  text-transform: uppercase;
  letter-spacing: 10px;
  color: #00f3ff;
  text-shadow: 0 0 20px rgba(0, 243, 255, 0.6);
}
</style>