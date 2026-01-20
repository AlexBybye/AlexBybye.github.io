<template>
  <div id="app-background">
    <router-view />

    <div class="header-section">
      <h1 class="breathing-text">SHOT ON THE TARGET</h1>
      <p class="sub-hint">KICK THE FOOTBALL BELOW</p>
    </div>

    <svg class="shot-trajectory" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path id="ballPath" d="M 50 95 Q 50 50 50 15" fill="transparent" stroke="rgba(0, 191, 255, 0.8)"
        stroke-width="0.5" stroke-dasharray="100" stroke-dashoffset="100" :class="{ 'animate-trail': isKicked }" />
      <circle v-if="isKicked" cx="50" cy="95" r="2" fill="none" stroke="#00bfff" stroke-width="0.2">
        <animate attributeName="r" from="0" to="10" dur="0.8s" fill="freeze" />
        <animate attributeName="opacity" from="1" to="0" dur="0.8s" fill="freeze" />
      </circle>
    </svg>

    <div class="football-click-area" @click="handleKick" :class="{ 'kicked': isKicked }">
      <div class="hover-glow"></div>
    </div>

    <div class="vignette"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isKicked = ref(false);

const handleKick = () => {
  if (isKicked.value) return;

  // 触发动画状态
  isKicked.value = true;

  // 延时 1.2 秒跳转，给足蓝色轨迹划向球门的时间
  setTimeout(() => {
    router.push('/animation2');
  }, 1200);
};
</script>

<style scoped>
#app-background {
  background-image: url('/images/background_1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  width: 100vw;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

/* 顶部区域美化 */
.header-section {
  position: absolute;
  top: 8%;
  z-index: 10;
  text-align: center;
}

.breathing-text {
  font-size: clamp(2.5rem, 10vw, 7rem);
  font-weight: 900;
  letter-spacing: 0.15em;
  background: linear-gradient(135deg, #ff8c00 0%, #ff4500 50%, #e63900 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 5px 15px rgba(255, 69, 0, 0.4));
  animation: breathe 3s infinite ease-in-out;
  margin-bottom: 10px;
}

.sub-hint {
  color: white;
  font-family: 'Arial', sans-serif;
  letter-spacing: 0.4em;
  font-size: 0.9rem;
  opacity: 0.8;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  animation: pulse 2s infinite;
}

/* 射门轨迹 SVG */
.shot-trajectory {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.animate-trail {
  animation: drawPath 1s forwards cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes drawPath {
  to {
    stroke-dashoffset: 0;
    filter: blur(1px);
  }
}

/* 足球交互区 */
.football-click-area {
  position: absolute;
  bottom: 2%;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 180px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 5;
  transition: all 0.3s;
}

.hover-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 191, 255, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s;
}

.football-click-area:hover .hover-glow {
  opacity: 1;
}

/* 沉浸感美化 */
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
  pointer-events: none;
}

/* 动画定义 */
@keyframes breathe {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.9;
  }

  50% {
    transform: scale(1.03);
    opacity: 1;
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.5;
    transform: translateY(0);
  }

  50% {
    opacity: 1;
    transform: translateY(-5px);
  }
}

@keyframes kickFlash {
  0% {
    background: rgba(0, 191, 255, 0);
  }

  50% {
    background: rgba(0, 191, 255, 0.2);
  }

  100% {
    background: rgba(0, 191, 255, 0);
  }
}

.kicked {
  animation: kickFlash 0.5s ease-out;
}
</style>