<template>
  <section id="app-background" :class="{ kicked: isKicked, scored: hasScored }">
    <canvas ref="canvas" class="confetti-canvas"></canvas>

    <div class="header-section">
      <p class="eyebrow">ALLIANZ ARENA INTRO</p>
      <h1 class="breathing-text">SHOT ON THE TARGET</h1>
      <p class="sub-hint">KICK THE FOOTBALL BELOW</p>
    </div>

    <svg class="shot-trajectory" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path
        class="trajectory-aura"
        d="M 72 94 C 63 74 56 52 54 44 C 51 38 51 56 50 64"
        pathLength="100"
        fill="transparent"
        stroke-linecap="round"
        :class="{ 'animate-trail': isKicked }"
      />
      <path
        class="trajectory-core"
        d="M 72 94 C 63 74 56 52 54 44 C 51 38 51 56 50 64"
        pathLength="100"
        fill="transparent"
        stroke-linecap="round"
        :class="{ 'animate-trail': isKicked }"
      />
    </svg>

    <button
      type="button"
      class="football-click-area"
      :class="{ 'is-flying': isKicked }"
      aria-label="Kick the football"
      @click="handleKick"
    >
      <span class="hover-glow"></span>
      <span class="football-ball" aria-hidden="true">
        <img class="ball-img" src="/images/soccer.jpeg" alt="Football" draggable="false" />
      </span>
    </button>

    <div class="goal-impact" aria-hidden="true">
      <span class="impact-ring"></span>
      <span class="impact-ring delay"></span>
      <span class="goal-word">GOAL</span>
    </div>

    <div class="pitch-wake" aria-hidden="true"></div>
    <div class="vignette"></div>
  </section>
</template>

<script setup>
import { onUnmounted, ref } from 'vue'
import confetti from 'canvas-confetti'
import { useRouter } from 'vue-router'

const router = useRouter()
const canvas = ref(null)
const isKicked = ref(false)
const hasScored = ref(false)

let myConfetti = null
let confettiInterval = null
let goalTimer = null
let confettiStopTimer = null
let routeTimer = null

const launchConfetti = () => {
  if (!canvas.value) return

  myConfetti = confetti.create(canvas.value, {
    resize: true,
    useWorker: true,
  })

  confettiInterval = setInterval(() => {
    myConfetti({
      particleCount: 10,
      spread: 50,
      origin: { y: 0, x: Math.random() },
      angle: 100 * Math.random(),
      startVelocity: 30,
      scalar: 1.2,
      drift: 0,
      decayNumber: 0.7,
      gravity: 0.9,
      ticks: 700,
      colors: ['#bb0000', '#ffffff', '#00bb00', '#0000bb', '#ffff00'],
    })
  }, 100)
}

const stopConfetti = () => {
  if (confettiInterval) {
    clearInterval(confettiInterval)
    confettiInterval = null
  }
}

const handleKick = () => {
  if (isKicked.value) return

  isKicked.value = true

  goalTimer = window.setTimeout(() => {
    hasScored.value = true
    launchConfetti()
  }, 700)

  confettiStopTimer = window.setTimeout(() => {
    stopConfetti()
  }, 4550)

  routeTimer = window.setTimeout(() => {
    router.push({ name: 'Animation2' })
  }, 5300)
}

onUnmounted(() => {
  stopConfetti()

  if (goalTimer) window.clearTimeout(goalTimer)
  if (confettiStopTimer) window.clearTimeout(confettiStopTimer)
  if (routeTimer) window.clearTimeout(routeTimer)

  if (myConfetti && typeof myConfetti.reset === 'function') {
    myConfetti.reset()
  }
})
</script>

<style scoped>
#app-background {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  background-image:
    linear-gradient(180deg, rgba(5, 8, 11, 0.06), rgba(5, 8, 11, 0.5)),
    url('/images/background_1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

#app-background::before {
  position: absolute;
  inset: 0;
  content: '';
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(to bottom, transparent 0%, #000 38%, transparent 100%);
  opacity: 0.35;
  pointer-events: none;
}

.confetti-canvas {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 12;
}

.header-section {
  position: absolute;
  top: 7%;
  left: 50%;
  z-index: 10;
  width: min(92vw, 980px);
  transform: translateX(-50%);
  text-align: center;
}

.eyebrow,
.sub-hint {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.5);
}

.breathing-text {
  margin: 8px 0 10px;
  color: #fff;
  font-size: 5.8rem;
  font-weight: 950;
  line-height: 0.88;
  letter-spacing: 0;
  text-shadow:
    0 2px 0 #b90012,
    0 12px 28px rgba(0, 0, 0, 0.48),
    0 0 38px rgba(219, 0, 18, 0.72);
  animation: titlePulse 2.6s ease-in-out infinite;
}

.shot-trajectory {
  position: absolute;
  inset: 0;
  z-index: 4;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.trajectory-core {
  --trail-opacity: 1;
  stroke: rgba(255, 255, 255, 0.95);
  stroke-width: 0.42;
  stroke-dasharray: 46 240;
  stroke-dashoffset: 46;
  opacity: 0;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.85));
}

.trajectory-aura {
  --trail-opacity: 0.82;
  stroke: rgba(227, 6, 19, 0.95);
  stroke-width: 1.5;
  stroke-dasharray: 46 240;
  stroke-dashoffset: 46;
  opacity: 0;
  filter: blur(0.65px) drop-shadow(0 0 18px rgba(227, 6, 19, 0.9));
}

.animate-trail {
  animation: cometTrail 0.7s linear forwards;
}

.football-click-area {
  position: absolute;
  left: 72%;
  bottom: 6vh;
  z-index: 6;
  width: 132px;
  height: 132px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transform: translateX(-50%);
}

.hover-glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.36), rgba(227, 6, 19, 0.24) 38%, transparent 68%);
  opacity: 0.2;
  transform: scale(0.88);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.football-click-area:hover .hover-glow {
  opacity: 1;
  transform: scale(1);
}

.football-ball {
  position: absolute;
  inset: 14px;
  display: block;
  border-radius: 50%;
  filter: drop-shadow(0 16px 26px rgba(0, 0, 0, 0.42));
}

.ball-img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}

.football-click-area.is-flying {
  pointer-events: none;
  animation: ballFlight 0.7s linear forwards;
}

.football-click-area.is-flying .football-ball {
  animation: ballSpin 0.7s linear forwards;
}

.scored .football-click-area {
  opacity: 0;
}

.pitch-wake {
  position: absolute;
  left: 72%;
  bottom: 3.5vh;
  z-index: 3;
  width: 240px;
  height: 62px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(48, 115, 53, 0.56), rgba(24, 63, 39, 0.24) 55%, transparent 75%);
  opacity: 0;
  transform: translateX(-50%) scale(0.7);
  pointer-events: none;
}

.kicked .pitch-wake {
  animation: turfWake 0.7s ease-out forwards;
}

.goal-impact {
  position: absolute;
  left: 50%;
  top: 64vh;
  z-index: 7;
  width: 210px;
  height: 110px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0;
}

.scored .goal-impact {
  opacity: 1;
}

.impact-ring {
  position: absolute;
  inset: 18px 50px;
  border: 2px solid rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  opacity: 0;
}

.scored .impact-ring {
  animation: impactRing 2s ease-out forwards;
}

.scored .impact-ring.delay {
  border-color: rgba(227, 6, 19, 0.9);
  animation-delay: 0.12s;
}

.goal-word {
  position: absolute;
  inset: 0;
  display: grid;
  align-items: center;
  justify-items: center;
  color: #fff;
  font-size: 3rem;
  font-weight: 950;
  letter-spacing: 0;
  text-shadow:
    0 3px 0 #e30613,
    0 12px 30px rgba(0, 0, 0, 0.55),
    0 0 24px rgba(255, 255, 255, 0.6);
  transform: scale(0.72);
  opacity: 0;
}

.scored .goal-word {
  animation: goalPop 3s cubic-bezier(0.15, 0.72, 0.1, 1.36) forwards;
}

.vignette {
  position: absolute;
  inset: 0;
  z-index: 11;
  background:
    radial-gradient(circle at 50% 52%, transparent 36%, rgba(0, 0, 0, 0.34) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.18), transparent 36%, rgba(0, 0, 0, 0.28));
  pointer-events: none;
}

@keyframes titlePulse {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.94;
  }

  50% {
    transform: translateY(-4px) scale(1.018);
    opacity: 1;
  }
}

@keyframes cometTrail {
  0% {
    stroke-dashoffset: 46;
    opacity: 0;
  }

  10% {
    opacity: var(--trail-opacity);
  }

  68% {
    opacity: var(--trail-opacity);
  }

  100% {
    stroke-dashoffset: -54;
    opacity: 0;
  }
}

@keyframes ballFlight {
  0% {
    transform: translateX(-50%) translate3d(0, 0, 0) scale(1);
  }

  15% {
    transform: translateX(-50%) translate3d(-4vw, -20vh, 0) scale(0.78);
  }

  32% {
    transform: translateX(-50%) translate3d(-9vw, -37vh, 0) scale(0.6);
  }

  50% {
    transform: translateX(-50%) translate3d(-14vw, -47vh, 0) scale(0.44);
  }

  65% {
    transform: translateX(-50%) translate3d(-18vw, -49vh, 0) scale(0.32);
  }

  82% {
    transform: translateX(-50%) translate3d(-21vw, -41vh, 0) scale(0.21);
  }

  100% {
    transform: translateX(-50%) translate3d(-22vw, calc(-30vh + 66px), 0) scale(0.14);
  }
}

@keyframes ballSpin {
  0% {
    transform: rotate(0deg);
    filter: brightness(1);
  }

  100% {
    transform: rotate(820deg);
    filter: brightness(1.25);
  }
}

@keyframes turfWake {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.62);
  }

  30% {
    opacity: 0.7;
  }

  100% {
    opacity: 0;
    transform: translateX(-50%) scale(1.4);
  }
}

@keyframes impactRing {
  0% {
    opacity: 1;
    transform: scale(0.35);
  }

  100% {
    opacity: 0;
    transform: scale(2.3);
  }
}

@keyframes goalPop {
  0% {
    opacity: 0;
    transform: scale(0.62) translateY(10px);
  }

  26% {
    opacity: 1;
    transform: scale(1.08) translateY(0);
  }

  100% {
    opacity: 0;
    transform: scale(1) translateY(-12px);
  }
}

@media (max-width: 760px) {
  .header-section {
    top: 8%;
  }

  .breathing-text {
    font-size: 3.2rem;
  }

  .eyebrow,
  .sub-hint {
    font-size: 0.75rem;
  }

  .football-click-area {
    width: 110px;
    height: 110px;
    bottom: 5vh;
  }

  .goal-impact {
    top: 64vh;
    width: 160px;
  }

  .goal-word {
    font-size: 2.2rem;
  }
}
</style>
