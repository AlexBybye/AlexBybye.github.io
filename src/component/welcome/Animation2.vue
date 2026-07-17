<template>
  <section class="showcase-stage">
    <span class="handoff-ball-target" aria-hidden="true">
      <img src="/images/soccer.jpeg" alt="" draggable="false">
    </span>

    <div class="backdrop-stack" aria-hidden="true">
      <img
        v-for="(panel, index) in panels"
        v-show="currentPanelIndex === index"
        :key="panel.id"
        :src="panel.heroImage.src"
        :alt="panel.heroImage.alt"
        class="backdrop-image"
        :class="{ active: currentPanelIndex === index }"
        :loading="index === 0 ? 'eager' : 'lazy'"
        decoding="async"
      />
    </div>

    <div class="technical-grid" aria-hidden="true"></div>
    <div class="split-light" aria-hidden="true"></div>

    <div class="panel-viewport">
      <article
        v-for="(panel, index) in panels"
        v-show="currentPanelIndex === index"
        :key="panel.id"
        class="showcase-panel"
        :class="[panel.tone, panel.direction, { active: currentPanelIndex === index }]"
        :style="{ '--accent': panel.accent }"
      >
        <div class="copy-triangle">
          <div class="triangle-fill" aria-hidden="true"></div>
          <div class="triangle-outline" aria-hidden="true"></div>
          <div class="arrow-rail" aria-hidden="true">
            <span v-for="n in 14" :key="n"></span>
          </div>
          <div class="copy-content">
            <div class="copy-strike">
              <p class="panel-kicker">{{ panel.kicker }}</p>
              <h1>{{ panel.title }}</h1>
            </div>
            <div class="copy-readable">
              <p>{{ panel.body }}</p>
              <span>{{ panel.stat }}</span>
            </div>
          </div>
        </div>

        <div class="media-zone">
          <figure class="hero-photo">
            <img :src="panel.photos[0].src" :alt="panel.photos[0].alt" :loading="index === 0 ? 'eager' : 'lazy'" decoding="async" />
          </figure>

          <figure v-if="panel.photos[1]" class="support-photo">
            <img :src="panel.photos[1].src" :alt="panel.photos[1].alt" loading="lazy" decoding="async" />
          </figure>

          <div class="gif-strip" aria-hidden="true">
            <figure v-for="(gif, gifIndex) in panel.gifs" :key="gif.src" :class="`gif-chip gif-${gifIndex + 1}`">
              <img :src="gif.src" :alt="gif.alt" loading="lazy" decoding="async" />
            </figure>
          </div>
        </div>
      </article>
    </div>

    <div class="stage-footer">
      <div class="progress-markers" aria-hidden="true">
        <span
          v-for="(_, index) in panels"
          :key="index"
          :class="{ active: currentPanelIndex === index }"
        ></span>
      </div>

      <button
        type="button"
        class="enter-home-button"
        :class="{ entering: isEntering }"
        :style="{ '--countdown': `${countdownDurationMs}ms` }"
        @click="enterHome"
      >
        <span class="button-fill" aria-hidden="true"></span>
        <span class="button-label">
          <span>{{ isEntering ? '进入中' : '进入主页' }}</span>
          <span class="button-hint">{{ remainingSeconds }}s 后自动进入</span>
        </span>
        <span class="button-arrow" aria-hidden="true">→</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loadShowcaseConfig } from './welcomeResources'

const router = useRouter()

// 内容与时序全部来自 resources/welcomeShowcase.json，此处仅保存解析后的运行时数据
const panels = ref([])
const resources = ref([])
// 兜底时序，配置加载完成后会被 JSON 覆盖：每页 5s、总计 30s 强制跳转
const timing = ref({ panelDurationMs: 5000, totalDurationMs: 30000 })

const currentPanelIndex = ref(0)
const isEntering = ref(false)
// 倒计时按钮的填充动画时长直接绑定总时长
const countdownDurationMs = computed(() => timing.value.totalDurationMs)
const remainingMs = ref(timing.value.totalDurationMs)
const remainingSeconds = computed(() => Math.max(0, Math.ceil(remainingMs.value / 1000)))

let panelTimer = null
let routeTimer = null
let countdownTimer = null

const clearTimers = () => {
  if (panelTimer) window.clearInterval(panelTimer)
  if (routeTimer) window.clearTimeout(routeTimer)
  if (countdownTimer) window.clearInterval(countdownTimer)
  panelTimer = null
  routeTimer = null
  countdownTimer = null
}

const enterHome = () => {
  if (isEntering.value) return

  isEntering.value = true
  clearTimers()
  router.push({ name: 'Animation3' })
}

const startTimers = () => {
  const { panelDurationMs, totalDurationMs } = timing.value
  remainingMs.value = totalDurationMs

  // 每页停留 panelDurationMs 后切换到下一页（循环）
  panelTimer = window.setInterval(() => {
    if (panels.value.length === 0) return
    currentPanelIndex.value = (currentPanelIndex.value + 1) % panels.value.length
  }, panelDurationMs)

  countdownTimer = window.setInterval(() => {
    remainingMs.value = Math.max(0, remainingMs.value - 100)
  }, 100)

  // 总时长 totalDurationMs 后强制进入主页
  routeTimer = window.setTimeout(() => {
    enterHome()
  }, totalDurationMs)
}

onMounted(async () => {
  try {
    const config = await loadShowcaseConfig()
    panels.value = config.panels
    resources.value = config.resources
    timing.value = config.timing
  } catch (error) {
    console.error('加载 welcome showcase 配置失败:', error)
  }

  startTimers()
})

onUnmounted(() => {
  clearTimers()
})
</script>

<style scoped>
.showcase-stage {
  position: relative;
  width: 100vw;
  min-height: 100dvh;
  overflow: hidden;
  background:
    linear-gradient(110deg, #050505 0%, #181818 46%, #070707 100%),
    #090909;
  color: #f4f4f5;
  isolation: isolate;
}

.handoff-ball-target {
  position: absolute;
  top: 22px;
  left: 50%;
  z-index: 12;
  display: block;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.52));
  transform: translateX(-50%);
  view-transition-name: match-ball;
  animation: handoffBallSettle 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.handoff-ball-target::after {
  position: absolute;
  top: 50%;
  right: calc(100% + 8px);
  width: clamp(70px, 10vw, 160px);
  height: 2px;
  content: '';
  background: linear-gradient(90deg, transparent, rgba(227, 6, 19, 0.84));
  transform: translateY(-50%);
}

.handoff-ball-target img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.backdrop-stack {
  position: absolute;
  inset: 0;
  z-index: -3;
  overflow: hidden;
}

.backdrop-image {
  position: absolute;
  inset: -5%;
  width: 110%;
  height: 110%;
  object-fit: cover;
  opacity: 0;
  filter: saturate(1.18) contrast(1.06) brightness(0.56);
  transform: scale(1.08);
  transition:
    opacity 0.9s ease,
    transform 4.3s ease;
}

.backdrop-image.active {
  opacity: 0.42;
  transform: scale(1.01);
}

.technical-grid {
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.075) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(135deg, rgba(227, 6, 19, 0.26), transparent 34%, rgba(255, 255, 255, 0.08) 62%, transparent);
  background-size: 82px 82px, 82px 82px, 100% 100%;
  mask-image: linear-gradient(to bottom, #000 0%, #000 78%, transparent 100%);
  opacity: 0.62;
}

.split-light {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(90deg, rgba(227, 6, 19, 0.28), transparent 28%, transparent 70%, rgba(255, 255, 255, 0.1)),
    radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.62) 72%);
  pointer-events: none;
}

.panel-viewport {
  position: relative;
  width: 100%;
  height: 100%;
}

.showcase-panel {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: minmax(360px, 0.86fr) minmax(460px, 1.14fr);
  align-items: center;
  gap: 4vw;
  padding: 7.5vh 7vw 18vh;
  box-sizing: border-box;
  opacity: 0;
  transform: translateX(40px) scale(0.985);
  transition:
    opacity 0.72s ease,
    transform 0.72s ease;
  pointer-events: none;
}

.showcase-panel.to-left {
  grid-template-columns: minmax(460px, 1.14fr) minmax(360px, 0.86fr);
  transform: translateX(-40px) scale(0.985);
}

.showcase-panel.active {
  opacity: 1;
  transform: translateX(0) scale(1);
  pointer-events: auto;
}

.showcase-panel.to-left .copy-triangle {
  grid-column: 2;
  grid-row: 1;
}

.showcase-panel.to-left .media-zone {
  grid-column: 1;
  grid-row: 1;
}

.copy-triangle {
  position: relative;
  display: grid;
  align-items: center;
  min-height: 520px;
}

.triangle-fill,
.triangle-outline {
  position: absolute;
  inset: 4% 0;
  /* 红色面放在左侧，三角指向右侧的图片（指向与放置相反） */
  clip-path: polygon(100% 50%, 0 0, 0 100%);
}

.to-left .triangle-fill,
.to-left .triangle-outline {
  /* 黑色面放在右侧，三角指向左侧的图片 */
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
}

.triangle-fill {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent), #f4f4f5 12%), rgba(9, 9, 11, 0.82)),
    var(--accent);
  box-shadow:
    inset 0 0 60px rgba(255, 255, 255, 0.12),
    0 24px 60px rgba(0, 0, 0, 0.42);
  opacity: 0.92;
}

.black .triangle-fill {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0.96)),
    #0d0d0d;
}

.triangle-outline {
  inset: -1.5% -2%;
  border: 1px solid rgba(255, 255, 255, 0.42);
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.18), transparent 45%),
    repeating-linear-gradient(0deg, transparent 0 16px, rgba(255, 255, 255, 0.08) 16px 17px);
  opacity: 0.42;
}

.copy-content {
  position: relative;
  z-index: 2;
  width: min(74%, 440px);
  margin-left: 16%;
  color: #f4f4f5;
}

.to-left .copy-content {
  margin-right: 16%;
  margin-left: auto;
  text-align: right;
}

.copy-strike {
  transform: rotate(-22deg);
  transform-origin: left bottom;
}

.to-left .copy-strike {
  transform: rotate(22deg);
  transform-origin: right bottom;
}

.copy-readable {
  margin-top: 2rem;
  transform: rotate(-6deg);
  transform-origin: left top;
}

.to-left .copy-readable {
  transform: rotate(6deg);
  transform-origin: right top;
}

.panel-kicker {
  margin: 0 0 14px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.84rem;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.copy-content h1 {
  margin: 0;
  max-width: 11ch;
  font-size: 4.4rem;
  line-height: 0.9;
  letter-spacing: 0;
  text-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
}

.copy-readable p {
  margin: 0 0 18px;
  max-width: 26rem;
  color: rgba(255, 255, 255, 0.86);
  font-size: 1.02rem;
  line-height: 1.72;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.55);
}

.copy-readable span {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: rgba(0, 0, 0, 0.32);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.media-zone {
  position: relative;
  min-height: 560px;
}

/* 主图：右侧为斜边的三角切口，箭头贴着这条斜边流动 */
.hero-photo {
  position: absolute;
  left: 2%;
  top: 6%;
  z-index: 2;
  width: 74%;
  height: 78%;
  margin: 0;
  overflow: visible;
  clip-path: polygon(0 0, 100% 0, 82% 100%, 0 100%);
  filter: drop-shadow(0 26px 60px rgba(0, 0, 0, 0.6));
}

.to-left .hero-photo {
  left: auto;
  right: 2%;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 18% 100%);
}

.hero-photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  clip-path: polygon(0 0, 100% 0, 82% 100%, 0 100%);
}

.to-left .hero-photo img {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 18% 100%);
}

/* 流动箭头条：水平放置在大三角下方、照片墙上方，与三角形水平居中对齐 */
.arrow-rail {
  position: absolute;
  top: 100%;
  left: 50%;
  z-index: 5;
  display: flex;
  gap: 10px;
  width: 80%;
  max-width: 460px;
  height: 60px;
  align-items: center;
  overflow: hidden;
  transform: translateX(-50%);
  background:
    linear-gradient(90deg, rgba(227, 6, 19, 0.85), rgba(255, 255, 255, 0.18), rgba(227, 6, 19, 0));
  border-block: 1px solid rgba(255, 255, 255, 0.36);
  mask-image: linear-gradient(90deg, #000 0%, #000 72%, transparent);
}

.to-left .arrow-rail {
  left: 50%;
  right: auto;
  transform: translateX(-50%) scaleX(-1);
  background:
    linear-gradient(90deg, rgba(15, 15, 15, 0.9), rgba(255, 255, 255, 0.2), rgba(227, 6, 19, 0));
}

.arrow-rail span {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  clip-path: polygon(0 0, 100% 50%, 0 100%);
  background: rgba(255, 255, 255, 0.95);
  animation: railMove 1.15s linear infinite;
}

.black .arrow-rail span {
  background: #e30613;
}

/* 副图：填在主图斜边外侧的空缺，不与主图重叠 */
.support-photo {
  position: absolute;
  right: 1%;
  bottom: 3%;
  z-index: 1;
  width: 40%;
  height: 40%;
  margin: 0;
  overflow: hidden;
  clip-path: polygon(18% 0, 100% 0, 100% 100%, 0 100%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
}

.to-left .support-photo {
  right: auto;
  left: 1%;
  clip-path: polygon(0 0, 82% 0, 100% 100%, 0 100%);
}

.support-photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* GIF：切成与画面斜切语言一致的高竖“刀片”，贴在主图斜边外侧融入构图 */
.gif-strip {
  position: absolute;
  right: 0;
  top: 4%;
  height: 46%;
  z-index: 3;
  display: flex;
  gap: 0;
  align-items: stretch;
  transform: skewX(-11deg);
}

.to-left .gif-strip {
  right: auto;
  left: 0;
  transform: skewX(11deg);
  flex-direction: row-reverse;
}

.gif-chip {
  position: relative;
  width: 92px;
  margin: 0;
  overflow: hidden;
  background: #0a0a0a;
  box-shadow:
    0 20px 46px rgba(0, 0, 0, 0.55),
    inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

/* 相邻刀片之间留一条主题色缝隙，形成条码般的节奏 */
.gif-chip + .gif-chip {
  margin-left: 6px;
  box-shadow:
    0 20px 46px rgba(0, 0, 0, 0.55),
    inset 0 0 0 1px rgba(255, 255, 255, 0.12),
    -6px 0 0 -1px var(--accent, #e30613);
}

.gif-chip::after {
  position: absolute;
  inset: 0;
  content: '';
  /* 主题化叠色 + 顶部渐隐，让 GIF 融进红黑背景而非突兀漂浮 */
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.7), transparent 34%, transparent 62%, rgba(0, 0, 0, 0.78)),
    linear-gradient(150deg, rgba(227, 6, 19, 0.5), rgba(0, 0, 0, 0.3));
  mix-blend-mode: multiply;
  pointer-events: none;
}

.black .gif-chip::after {
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.72), transparent 34%, transparent 62%, rgba(0, 0, 0, 0.8)),
    linear-gradient(150deg, rgba(12, 12, 12, 0.6), rgba(227, 6, 19, 0.34));
}

.gif-chip img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 反向斜切抵消父级 skew，让画面内容不被拉歪，只保留外形斜切 */
  transform: skewX(11deg) scale(1.3);
  filter: contrast(1.1) saturate(0.82) brightness(0.92) grayscale(0.15);
}

.to-left .gif-chip img {
  transform: skewX(-11deg) scale(1.3);
}

/* 两片错落：第二片略窄并下沉，形成动势 */
.gif-2 {
  width: 74px;
  align-self: flex-end;
  height: 82%;
}

.resource-rail {
  position: absolute;
  left: 50%;
  bottom: 2.4vh;
  z-index: 7;
  display: flex;
  gap: 10px;
  width: min(74vw, 980px);
  height: 58px;
  overflow: hidden;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.34);
  transform: translateX(-50%) skewX(-12deg);
  mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
}

.resource-rail img {
  flex: 0 0 72px;
  width: 72px;
  height: 46px;
  object-fit: cover;
  transform: skewX(12deg);
  animation: resourceDrift 8s linear infinite;
}

.stage-footer {
  position: absolute;
  right: 5vw;
  bottom: 4.3vh;
  z-index: 9;
  display: flex;
  align-items: center;
  gap: 20px;
}

.progress-markers {
  display: flex;
  gap: 7px;
  align-items: center;
}

.progress-markers span {
  width: 26px;
  height: 4px;
  background: rgba(255, 255, 255, 0.28);
  transition:
    width 0.25s ease,
    background 0.25s ease;
}

.progress-markers span.active {
  width: 46px;
  background: #e30613;
}

.enter-home-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-width: 188px;
  height: 56px;
  padding: 0 22px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.48);
  background:
    linear-gradient(135deg, rgba(20, 20, 20, 0.92), rgba(8, 8, 8, 0.94)),
    #101010;
  color: #f4f4f5;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0;
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%);
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.46),
    0 0 26px rgba(227, 6, 19, 0.28);
  transition:
    transform 0.24s ease,
    filter 0.24s ease,
    box-shadow 0.24s ease;
}

.button-fill {
  position: absolute;
  inset: 0;
  z-index: 0;
  transform-origin: left center;
  transform: scaleX(0);
  background: linear-gradient(135deg, rgba(227, 6, 19, 0.95), rgba(120, 0, 10, 0.92));
  animation: countdownFill var(--countdown, 18000ms) linear forwards;
}

.enter-home-button.entering .button-fill {
  animation: none;
  transform: scaleX(1);
}

.button-label {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.15;
}

.button-hint {
  font-size: 0.62rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.66);
  letter-spacing: 0.02em;
}

.enter-home-button:hover {
  transform: translateY(-2px);
  filter: brightness(1.14);
  box-shadow:
    0 22px 48px rgba(0, 0, 0, 0.5),
    0 0 32px rgba(227, 6, 19, 0.52);
}

.enter-home-button:active {
  transform: translateY(1px);
}

.button-arrow {
  position: relative;
  z-index: 1;
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  animation: arrowNudge 1.4s ease-in-out infinite;
}

@keyframes countdownFill {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

@keyframes handoffBallSettle {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(34px) rotate(-80deg) scale(0.62);
  }

  62% {
    opacity: 1;
    transform: translateX(-50%) translateY(-3px) rotate(22deg) scale(1.08);
  }

  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) rotate(0) scale(1);
  }
}

@keyframes arrowNudge {
  0%,
  100% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(3px);
  }
}

@keyframes railMove {
  0% {
    transform: translateX(-44px);
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  100% {
    transform: translateX(44px);
    opacity: 0.15;
  }
}

@keyframes resourceDrift {
  0% {
    transform: translateX(0) skewX(12deg);
  }

  100% {
    transform: translateX(-168px) skewX(12deg);
  }
}

@media (max-width: 980px) {
  .showcase-panel,
  .showcase-panel.to-left {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 5vh 5vw 17vh;
  }

  .showcase-panel.to-left .copy-triangle,
  .showcase-panel.to-left .media-zone {
    grid-column: 1;
  }

  .showcase-panel.to-left .copy-triangle {
    grid-row: 1;
  }

  .showcase-panel.to-left .media-zone {
    grid-row: 2;
  }

  .copy-triangle {
    min-height: 300px;
  }

  .triangle-fill,
  .triangle-outline,
  .to-left .triangle-fill,
  .to-left .triangle-outline {
    clip-path: polygon(0 0, 100% 0, 86% 100%, 0 100%);
  }

  .copy-content,
  .to-left .copy-content {
    width: min(84%, 560px);
    margin: 0 auto;
    text-align: left;
  }

  .copy-strike,
  .to-left .copy-strike,
  .copy-readable,
  .to-left .copy-readable {
    transform: none;
  }

  .copy-readable {
    margin-top: 1rem;
  }

  .copy-content h1 {
    max-width: 14ch;
    font-size: 3rem;
  }

  .copy-readable p {
    margin: 14px 0 12px;
    font-size: 0.98rem;
    line-height: 1.55;
  }

  .media-zone {
    min-height: 340px;
  }

  .hero-photo,
  .to-left .hero-photo {
    left: 4%;
    right: 4%;
    top: 4%;
    width: 74%;
    height: 66%;
  }

  .support-photo,
  .to-left .support-photo {
    width: 44%;
    height: 40%;
  }

  .gif-strip {
    height: 40%;
  }

  .gif-chip {
    width: 62px;
  }

  .gif-2 {
    width: 50px;
  }

  .resource-rail {
    left: 4vw;
    bottom: 2.2vh;
    width: 52vw;
    transform: skewX(-12deg);
  }

  .stage-footer {
    right: 4vw;
    bottom: 2.5vh;
    gap: 12px;
  }

  .progress-markers {
    display: none;
  }
}

@media (max-width: 620px) {
  .showcase-panel,
  .showcase-panel.to-left {
    padding: 4vh 4vw 17vh;
  }

  .copy-triangle {
    min-height: 270px;
  }

  .copy-content h1 {
    font-size: 2.34rem;
  }

  .copy-readable p {
    font-size: 0.9rem;
  }

  .copy-readable span {
    min-height: 32px;
    font-size: 0.66rem;
  }

  .media-zone {
    min-height: 320px;
  }

  .hero-photo,
  .to-left .hero-photo {
    width: 80%;
    height: 60%;
  }

  .support-photo,
  .to-left .support-photo {
    width: 46%;
    height: 38%;
  }

  .gif-strip {
    height: 34%;
  }

  .gif-chip {
    width: 50px;
  }

  .gif-2 {
    width: 40px;
  }

  .arrow-rail {
    width: 44vw;
    height: 44px;
  }

  .resource-rail {
    width: 46vw;
    height: 50px;
  }

  .resource-rail img {
    flex-basis: 56px;
    width: 56px;
    height: 38px;
  }

  .enter-home-button {
    min-width: 122px;
    height: 48px;
    padding: 0 16px;
    font-size: 0.9rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .backdrop-image,
  .showcase-panel,
  .arrow-rail span,
  .resource-rail img,
  .button-fill,
  .button-arrow {
    animation: none !important;
    transition: none !important;
  }

  .handoff-ball-target {
    animation: none !important;
  }

  .button-fill {
    transform: scaleX(1);
    opacity: .35;
  }
}
</style>
