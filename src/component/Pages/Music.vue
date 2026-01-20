<template>
  <div class="page-container" :class="{ 'page-throw-up': isLeaving }">
    <h1>My Music</h1>
    <p>Discover the music that inspires me.</p>

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

      <div class="tech-grid-overlay">
        <svg viewBox="0 0 800 200" class="circuit-lines">
          <path d="M150,0 V50 L400,120" class="path-line" />
          <path d="M400,0 V120" class="path-line" />
          <path d="M650,0 V50 L400,120" class="path-line" />
          
          <circle r="1.5" fill="#00f3ff">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M150,0 V50 L400,120" />
          </circle>
          <circle r="1.5" fill="#00f3ff">
            <animateMotion dur="1.8s" repeatCount="indefinite" path="M400,0 V120" />
          </circle>
          <circle r="1.5" fill="#00f3ff">
            <animateMotion dur="2.2s" repeatCount="indefinite" path="M650,0 V50 L400,120" />
          </circle>
        </svg>
        <div class="core-tag">CORE_LINK_ESTABLISHED</div>
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
  padding: 40px;
  background-color: #333;
  min-height: calc(100vh - 30% - 40px);
  opacity: 0.1;
  transition: all 0.5s ease;
  border-radius: 20px;
  position: relative;
  overflow: hidden; /* 裁剪溢出的导线 */
}

.page-container:hover { opacity: 0.8; }

.music-interaction-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
  margin-top: 60px;
  position: relative;
  padding-bottom: 150px; /* 为下方导线留出空间 */
}

/* --- 新增：故障艺术特效 --- */
.glitch-hover {
  position: relative;
  display: inline-block;
}

.glitch-hover:hover::before,
.glitch-hover:hover::after {
  content: attr(data-glitch);
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: transparent;
}

.glitch-hover:hover::before {
  left: 2px;
  text-shadow: -2px 0 #ff00ff;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim 0.5s infinite linear alternate-reverse;
}

.glitch-hover:hover::after {
  left: -2px;
  text-shadow: -2px 0 #00ffff;
  clip: rect(10px, 450px, 30px, 0);
  animation: glitch-anim2 0.5s infinite linear alternate-reverse;
}

/* --- 新增：Telemetry 参数监控码 --- */
.telemetry {
  display: flex;
  flex-direction: column;
  font-family: 'Courier New', monospace;
  font-size: 9px;
  color: rgba(0, 243, 255, 0.6);
  margin-top: 15px;
  pointer-events: none;
  text-align: left;
}

.telemetry.center { text-align: center; margin-top: 10px; }
.telemetry span { line-height: 1.4; letter-spacing: 1px; }

/* --- 新增：SVG 科技导线 --- */
.tech-grid-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 150px;
  pointer-events: none;
}

.circuit-lines {
  width: 100%;
  height: 100%;
  opacity: 0.4;
}

.path-line {
  fill: none;
  stroke: #00f3ff;
  stroke-width: 0.5;
  stroke-dasharray: 2, 2;
}

.core-tag {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  color: #00f3ff;
  border: 1px solid rgba(0, 243, 255, 0.3);
  padding: 2px 8px;
  border-radius: 4px;
}

/* --- 原有动画与样式 --- */
.music-icon {
  font-size: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 10px rgba(100, 200, 255, 0.5));
  animation: floatUpDown 3s infinite ease-in-out;
}

.playlist-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 30px 50px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
}

.playlist-card:hover { background: rgba(255, 255, 255, 0.15); transform: translateY(-5px); }
.playlist-icon { font-size: 40px; margin-bottom: 10px; }
.playlist-card span { color: #fff; letter-spacing: 2px; font-weight: bold; }

@keyframes glitch-anim {
  0% { clip: rect(20px, 999px, 30px, 0); }
  100% { clip: rect(60px, 999px, 80px, 0); }
}

@keyframes glitch-anim2 {
  0% { clip: rect(40px, 999px, 50px, 0); }
  100% { clip: rect(10px, 999px, 40px, 0); }
}

@keyframes floatUpDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

/* 其余原有特效代码保持不变... */
.page-throw-up {
  pointer-events: none;
  animation: throwOut 0.8s forwards cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes throwOut {
  0% { transform: translateY(0); opacity: 0.8; }
  100% { transform: translateY(-100vh) rotate(-2deg); opacity: 0; }
}
.animation-overlay {
  position: fixed; inset: 0; background: linear-gradient(135deg, #0f0c29, #24243e); z-index: 9999;
}
.wave-bar {
  position: absolute; bottom: 0; width: 3%; background: linear-gradient(to top, #00dbde, #fc00ff);
  animation: waveBurst 1.2s infinite ease-in-out; border-radius: 5px 5px 0 0;
}
@keyframes waveBurst { 0%, 100% { transform: scaleY(0.2); opacity: 0.3; } 50% { transform: scaleY(1); opacity: 0.7; } }
.note { position: absolute; bottom: 0; color: #fff; font-size: 30px; animation: floatNoteUp 2s forwards linear; }
@keyframes floatNoteUp { 0% { transform: translateY(0) opacity(0); } 100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; } }
h1, p { text-align: center; color: #fff; }
</style>