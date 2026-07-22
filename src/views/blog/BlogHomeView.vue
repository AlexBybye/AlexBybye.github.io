<template>
  <section class="pack-page" aria-labelledby="pack-title">
    <div class="pack-copy">
      <span class="pack-eyebrow mono">{{ t('home.packOpening') }}</span>
      <h1 id="pack-title">{{ flipped ? t('home.hereIAm') : t('home.whoAmI') }}</h1>
      <p>{{ flipped ? t('home.flippedDescription') : t('home.prompt') }}</p>
    </div>

    <div class="pack-stage">
      <button
        ref="card"
        type="button"
        class="card"
        :class="{ flipped }"
        :aria-pressed="flipped"
        :aria-label="flipped ? t('home.flipBack') : t('home.flipOpen')"
        @click="flip"
      >
        <div class="card-face card-back" aria-hidden="true">
          <div class="pixel-grid"></div>
          <span class="pixel-mark">?</span>
          <span class="back-word mono">{{ t('home.whoAmI') }}</span>
          <span class="back-le mono">LE</span>
        </div>

        <div class="card-face card-front">
          <img src="/images/starcard.webp" :alt="t('home.cardAlt')" decoding="async" draggable="false" />
          <span class="holo" aria-hidden="true"></span>
          <span class="holo-glare" aria-hidden="true"></span>
        </div>
      </button>
    </div>

    <div class="pack-actions" :class="{ visible: flipped }">
      <button type="button" class="enter-btn" @click="enterSite">
        <span>{{ t('home.enter') }}</span>
        <PhArrowRight :size="19" weight="bold" aria-hidden="true" />
      </button>
      <button v-if="needsTilt" type="button" class="tilt-btn" @click="enableTilt">
        <PhDeviceMobile :size="18" weight="bold" aria-hidden="true" />
        <span>{{ t('home.tilt') }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PhArrowRight, PhDeviceMobile } from '@/design/icons'

const router = useRouter()
const { t } = useI18n()
const card = ref<HTMLElement | null>(null)
const flipped = ref(false)
const needsTilt = ref(false)

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

let frame = 0
let tiltActive = false

function setGlow(px: number, py: number) {
  const el = card.value
  if (!el) return
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    // px, py in range [-0.5, 0.5]
    el.style.setProperty('--mx', `${(px + 0.5) * 100}%`)
    el.style.setProperty('--my', `${(py + 0.5) * 100}%`)
    el.style.setProperty('--rx', `${-py * 14}deg`)
    el.style.setProperty('--ry', `${px * 14}deg`)
  })
}

function resetGlow() {
  const el = card.value
  if (!el) return
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    el.style.setProperty('--mx', '50%')
    el.style.setProperty('--my', '50%')
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  })
}

function handlePointerMove(event: PointerEvent) {
  const el = card.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5
  setGlow(x, y)
}

function handleTouchMove(event: TouchEvent) {
  const el = card.value
  const touch = event.touches[0]
  if (!el || !touch) return
  const rect = el.getBoundingClientRect()
  const x = (touch.clientX - rect.left) / rect.width - 0.5
  const y = (touch.clientY - rect.top) / rect.height - 0.5
  setGlow(x, y)
}

function handleOrientation(event: DeviceOrientationEvent) {
  const gamma = event.gamma ?? 0 // left-right [-90, 90]
  const beta = event.beta ?? 0 // front-back [-180, 180]
  const x = Math.max(-0.5, Math.min(0.5, gamma / 45))
  const y = Math.max(-0.5, Math.min(0.5, (beta - 45) / 45))
  setGlow(x, y)
}

async function fireConfetti() {
  if (reduceMotion()) return
  const { default: confetti } = await import('canvas-confetti')
  const rect = card.value?.getBoundingClientRect()
  const origin = rect
    ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight }
    : { x: 0.5, y: 0.45 }
  confetti({ particleCount: 120, spread: 78, startVelocity: 42, origin, colors: ['#e30613', '#f4f4f5', '#71717a'], scalar: 1.1 })
  window.setTimeout(() => confetti({ particleCount: 60, spread: 100, startVelocity: 30, origin, colors: ['#e30613', '#f4f4f5'], scalar: 0.9 }), 160)
}

function flip() {
  flipped.value = !flipped.value
  if (flipped.value) {
    fireConfetti()
    // iOS: 翻面同手势里请求陀螺仪授权
    if (needsTilt.value) enableTilt()
  } else {
    resetGlow()
  }
}

function enterSite() {
  router.push({ name: 'About' })
}

function bindOrientation() {
  window.addEventListener('deviceorientation', handleOrientation)
  tiltActive = true
  needsTilt.value = false
}

type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }

async function enableTilt() {
  const Ctor = window.DeviceOrientationEvent as OrientationCtor | undefined
  if (!Ctor) return
  if (typeof Ctor.requestPermission === 'function') {
    try {
      const res = await Ctor.requestPermission()
      if (res === 'granted') bindOrientation()
    } catch {
      // 授权失败：静默退化到 touch 拖动
      needsTilt.value = false
    }
  } else {
    bindOrientation()
  }
}

onMounted(() => {
  resetGlow()
  const el = card.value
  if (!el) return

  if (finePointer() && !reduceMotion()) {
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerleave', resetGlow)
    return
  }

  // 触屏：touch 拖动始终可用
  if (!reduceMotion()) {
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', resetGlow)
  }

  // 陀螺仪：iOS 需授权按钮，其它环境自动绑定
  const Ctor = window.DeviceOrientationEvent as OrientationCtor | undefined
  if (Ctor && !reduceMotion()) {
    if (typeof Ctor.requestPermission === 'function') needsTilt.value = true
    else bindOrientation()
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  const el = card.value
  el?.removeEventListener('pointermove', handlePointerMove)
  el?.removeEventListener('pointerleave', resetGlow)
  el?.removeEventListener('touchmove', handleTouchMove)
  el?.removeEventListener('touchend', resetGlow)
  if (tiltActive) window.removeEventListener('deviceorientation', handleOrientation)
})
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.pack-page {
  display: grid;
  grid-template-rows: auto auto auto;
  place-items: center;
  gap: clamp(1.5rem, 4vw, 2.75rem);
  width: min(100% - 2rem, 1200px);
  min-height: calc(100dvh - 140px);
  margin-inline: auto;
  padding-block: clamp(2rem, 5vw, 4rem);
  text-align: center;
}
.pack-copy { max-width: 44ch; }
.pack-eyebrow { display: block; margin-bottom: .9rem; color: @accent-strong; font-size: .74rem; font-weight: 700; letter-spacing: .16em; }
.pack-copy h1 { margin: 0; font-size: clamp(2.4rem, 6vw, 4.4rem); font-weight: 720; letter-spacing: -.05em; line-height: .92; }
.pack-copy p { max-width: 40ch; margin: 1rem auto 0; color: @text-muted; font-size: clamp(.95rem, 1.5vw, 1.1rem); line-height: 1.6; }

.pack-stage { perspective: 1600px; }
.card {
  position: relative; width: clamp(230px, 62vw, 340px); aspect-ratio: 660 / 1002;
  border: 0; padding: 0; background: transparent; cursor: pointer;
  transform-style: preserve-3d; transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform 240ms cubic-bezier(.16, 1, .3, 1);
  --mx: 50%; --my: 50%;
}
.card.flipped { transform: rotateX(var(--rx, 0deg)) rotateY(calc(180deg + var(--ry, 0deg))); transition: transform 720ms cubic-bezier(.16, 1, .3, 1); }
.card-face {
  position: absolute; inset: 0; overflow: hidden; border-radius: 18px;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, .55), inset 0 1px 0 rgba(255, 255, 255, .08);
}

/* 卡背：像素风 + 问号 */
.card-back {
  display: grid; place-items: center;
  border: 1px solid @line;
  background: radial-gradient(120% 90% at 50% 20%, #211016, #0b0b0e 70%);
}
.pixel-grid {
  position: absolute; inset: 0; opacity: .5; image-rendering: pixelated;
  background:
    repeating-linear-gradient(0deg, rgba(227, 6, 19, .16) 0 2px, transparent 2px 16px),
    repeating-linear-gradient(90deg, rgba(227, 6, 19, .16) 0 2px, transparent 2px 16px),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, .04) 0 8px, transparent 8px 16px);
  mask-image: radial-gradient(circle at 50% 42%, #000 30%, transparent 78%);
}
.pixel-mark {
  position: relative; z-index: 2; color: @text;
  font-family: 'Geist Mono Variable', monospace; font-size: clamp(6rem, 22vw, 11rem); font-weight: 800; line-height: 1;
  text-shadow: 0 4px 0 @accent, 4px 0 0 rgba(255, 255, 255, .12), 0 0 0 #000;
  filter: drop-shadow(0 8px 0 rgba(0, 0, 0, .4));
  -webkit-text-stroke: 2px rgba(9, 9, 11, .9);
}
.back-word { position: absolute; bottom: 12%; z-index: 2; color: @accent-strong; font-size: clamp(.8rem, 2.4vw, 1.05rem); font-weight: 700; letter-spacing: .28em; }
.back-le { position: absolute; top: 7%; z-index: 2; color: rgba(244, 244, 245, .5); font-size: .8rem; font-weight: 750; letter-spacing: .2em; }
/* 翻面后隐藏卡背的问号与文字，避免透背 */
.card.flipped .pixel-mark, .card.flipped .back-word, .card.flipped .back-le { opacity: 0; }

/* 卡正面：照片 + 全息 */
.card-front { transform: rotateY(180deg); border: 1px solid rgba(244, 244, 245, .2); background: #0b0b0e; }
.card-front img { width: 100%; height: 100%; object-fit: cover; user-select: none; -webkit-user-drag: none; }
.holo {
  position: absolute; inset: 0; pointer-events: none; mix-blend-mode: color-dodge; opacity: .55;
  background: linear-gradient(115deg, transparent 30%, rgba(227, 6, 19, .5) 45%, rgba(255, 255, 255, .55) 50%, rgba(120, 180, 255, .4) 56%, transparent 72%);
  background-size: 260% 260%; background-position: var(--mx) var(--my);
  transition: opacity 260ms ease;
}
.holo-glare {
  position: absolute; inset: 0; pointer-events: none; mix-blend-mode: soft-light; opacity: .8;
  background: radial-gradient(circle at var(--mx) var(--my), rgba(255, 255, 255, .5), transparent 42%);
}

/* CTA */
.pack-actions { display: flex; gap: .8rem; align-items: center; opacity: 0; transform: translateY(12px); pointer-events: none; transition: opacity 400ms ease, transform 400ms cubic-bezier(.16, 1, .3, 1); }
.pack-actions.visible { opacity: 1; transform: none; pointer-events: auto; }
.enter-btn { display: inline-flex; min-height: 50px; align-items: center; gap: .55rem; border: 0; border-radius: @radius-control; padding: 0 1.5rem; background: @accent; color: @text; font-weight: 720; cursor: pointer; transition: background 180ms ease, transform 180ms ease; }
.enter-btn:hover { background: @accent-strong; transform: translateY(-2px); }
.enter-btn:active { transform: scale(.97); }
.tilt-btn { display: inline-flex; min-height: 50px; align-items: center; gap: .5rem; border: 1px solid @line; border-radius: @radius-control; padding: 0 1.1rem; background: @surface-raised; color: @text; font-weight: 640; cursor: pointer; transition: border-color 180ms ease; }
.tilt-btn:hover { border-color: @accent; }

@media (prefers-reduced-motion: reduce) {
  .card, .card.flipped { transition: none; }
  .holo, .holo-glare { display: none; }
  .pack-actions { transition: none; }
}
@media (max-width: 767px) {
  .pack-page { min-height: calc(100dvh - 120px); }
  .card { width: clamp(220px, 74vw, 300px); }
}
</style>
