<template>
  <section id="app-background" :class="{ kicked: isKicked, scored: hasScored }">
    <canvas ref="canvas" class="confetti-canvas"></canvas>

    <div class="header-section">
      <p class="eyebrow">Allianz Arena</p>
      <h1 class="breathing-text">Take the shot</h1>
      <p class="sub-hint">Click or tap the ball to kick off.</p>
    </div>

    <svg class="shot-trajectory" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path
        class="trajectory-aura"
        d="M 72 94 C 63 76 56 55 54 47 C 51 41 51 62 50 70"
        pathLength="100"
        fill="transparent"
        stroke-linecap="round"
        :class="{ 'animate-trail': isKicked }"
      />
      <path
        class="trajectory-core"
        d="M 72 94 C 63 76 56 55 54 47 C 51 41 51 62 50 70"
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
      aria-label="Kick the ball to begin"
      @click="handleKick"
    >
      <span class="hover-glow"></span>
      <span class="football-ball" aria-hidden="true">
        <img class="ball-img" src="/images/soccer.webp" alt="" draggable="false" />
      </span>
    </button>

    <div class="goal-impact" aria-hidden="true">
      <span class="impact-ring"></span>
      <span class="impact-ring delay"></span>
      <span class="goal-word">Goal!</span>
    </div>

    <span class="handoff-ball-source" aria-hidden="true">
      <img src="/images/soccer.webp" alt="" draggable="false">
    </span>

    <div class="pitch-wake" aria-hidden="true"></div>
    <div class="vignette"></div>
  </section>
</template>

<script setup>
import { onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createSiuAudioPlayer } from '@/utils/siuAudio'

const router = useRouter()
const siuAudio = createSiuAudioPlayer()
const canvas = ref(null)
const isKicked = ref(false)
const hasScored = ref(false)

let myConfetti = null
let confettiInterval = null
let goalTimer = null
let confettiStopTimer = null
let routeTimer = null

const launchConfetti = async () => {
  if (!canvas.value) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { default: confetti } = await import('canvas-confetti')

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
      colors: ['#e30613', '#f4f4f5', '#71717a'],
    })
  }, 100)
}

const stopConfetti = () => {
  if (confettiInterval) {
    clearInterval(confettiInterval)
    confettiInterval = null
  }
}

const enterShowcase = () => {
  const navigate = () => router.push({ name: 'Animation2' })
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion && typeof document.startViewTransition === 'function') {
    document.startViewTransition(navigate)
    return
  }
  navigate()
}

const scoreGoal = () => {
  hasScored.value = true
  void siuAudio.play()
  void launchConfetti()
}

const handleKick = () => {
  if (isKicked.value) return

  isKicked.value = true

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scoreGoal()
    routeTimer = window.setTimeout(enterShowcase, 2300)
    return
  }

  // Playback is delayed until the ball reaches the net. Prime the same media
  // element now, while this click still carries a browser user activation.
  void siuAudio.prime()

  goalTimer = window.setTimeout(() => {
    scoreGoal()
  }, 700)

  confettiStopTimer = window.setTimeout(() => {
    stopConfetti()
  }, 4550)

  routeTimer = window.setTimeout(() => {
    enterShowcase()
  }, 5300)
}

onUnmounted(() => {
  stopConfetti()
  siuAudio.stop()

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
  /*
   * The source image is 1600x1167 and its goal centre is at y=764px.
   * With background-size: cover, narrow screens map that point to 65.47dvh;
   * wide screens crop vertically, where the same point is 50dvh + 11.28vw.
   */
  --goal-x: 50vw;
  --goal-y: max(65.47dvh, calc(50dvh + 11.28vw));
  --kick-x: 72vw;
  --kick-bottom: 6dvh;
  --kick-size: 132px;
  --kick-radius: 66px;
  --flight-x: calc(var(--goal-x) - var(--kick-x));
  --flight-y: calc(var(--goal-y) - 100dvh + var(--kick-bottom) + var(--kick-radius));
  position: relative;
  width: 100vw;
  min-height: 100dvh;
  overflow: hidden;
  background-image:
    linear-gradient(180deg, rgba(5, 8, 11, 0.06), rgba(5, 8, 11, 0.5)),
    url('/images/background_1.webp');
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
  height: 100dvh;
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

.header-section::after {
  position: absolute;
  right: 18%;
  bottom: -18px;
  left: 18%;
  height: 2px;
  content: '';
  background: linear-gradient(90deg, transparent, rgba(244, 244, 245, 0.82), #e30613, transparent);
  opacity: 0.55;
  transform: scaleX(0.34);
  animation: stadiumLightSweep 3.1s cubic-bezier(0.16, 1, 0.3, 1) infinite;
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
  color: #f4f4f5;
  font-size: 5.8rem;
  font-weight: 950;
  line-height: 0.88;
  letter-spacing: 0;
  -webkit-text-stroke: 1px rgba(227, 6, 19, 0.58);
  text-shadow:
    0 2px 0 #b90012,
    0 12px 28px rgba(0, 0, 0, 0.48);
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
  left: var(--kick-x);
  bottom: var(--kick-bottom);
  z-index: 6;
  width: var(--kick-size);
  height: var(--kick-size);
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
  transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1), filter 260ms ease;
}

.football-click-area:not(.is-flying):hover .football-ball {
  transform: translate3d(0, 9px, 0) rotate(-8deg) scale(0.94);
  filter: drop-shadow(0 9px 14px rgba(0, 0, 0, 0.5));
}

.football-click-area:not(.is-flying):active .football-ball {
  transform: translate3d(0, 13px, 0) rotate(-11deg) scale(0.88);
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
  left: var(--kick-x);
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
  left: var(--goal-x);
  top: var(--goal-y);
  z-index: 7;
  width: 210px;
  height: 110px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0;
}

.handoff-ball-source {
  position: absolute;
  top: var(--goal-y);
  left: var(--goal-x);
  z-index: 8;
  display: block;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%) scale(0.4) rotate(-80deg);
  transition: opacity 280ms ease, transform 680ms cubic-bezier(0.16, 1, 0.3, 1);
  view-transition-name: match-ball;
}

.handoff-ball-source img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.scored .handoff-ball-source {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1) rotate(18deg);
  animation: matchBallIdle 1.6s 1s ease-in-out infinite;
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
  color: #f4f4f5;
  font-size: 3rem;
  font-weight: 950;
  letter-spacing: 0;
  text-shadow:
    0 3px 0 #e30613,
    0 12px 30px rgba(0, 0, 0, 0.55);
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
    transform: translateY(-2px) scale(1.009);
    opacity: 1;
  }
}

@keyframes stadiumLightSweep {
  0%, 100% { opacity: 0.3; transform: scaleX(0.28) translateX(-16%); }
  50% { opacity: 0.86; transform: scaleX(1) translateX(0); }
}

@keyframes matchBallIdle {
  50% { transform: translate(-50%, -54%) scale(1.08) rotate(46deg); }
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
    transform: translateX(-50%) translate3d(-21vw, -35vh, 0) scale(0.21);
  }

  100% {
    transform: translateX(-50%) translate3d(var(--flight-x), var(--flight-y), 0) scale(0.14);
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
  #app-background {
    --kick-bottom: 5dvh;
    --kick-size: 110px;
    --kick-radius: 55px;
  }

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
    width: var(--kick-size);
    height: var(--kick-size);
    bottom: var(--kick-bottom);
  }

  .goal-impact {
    width: 160px;
  }

  .goal-word {
    font-size: 2.2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .breathing-text,
  .football-click-area,
  .football-ball,
  .pitch-wake,
  .impact-ring,
  .goal-word,
  .handoff-ball-source,
  .animate-trail {
    animation: none !important;
  }

  .header-section::after {
    animation: none;
  }

  .scored .goal-word {
    opacity: 1;
    transform: none;
  }
}
</style>
