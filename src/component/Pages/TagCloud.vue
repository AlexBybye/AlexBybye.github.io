<template>
  <div ref="container" class="tag-cloud-container" :class="{ 'static-mode': staticMode }">
    <div ref="cloud" class="tag-cloud" role="group" aria-label="标签筛选">
      <button v-for="(tag, index) in tags" :key="tag.name" :ref="(element) => setTagElement(element, index)"
        class="tag-item" type="button" :aria-pressed="modelValue === tag.name"
        :style="tagStyle(index, tag.count)" @click="select(tag.name)"
        @pointerenter="pauseTag(index)" @pointerleave="resumeTag(index)"
        @focus="pauseTag(index)" @blur="resumeTag(index)">
        <span class="tag-face">
          <strong>{{ tag.name }}</strong>
          <small class="mono">{{ tag.count }}</small>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'

interface TagItem {
  name: string
  count: number
}

interface MovingTag {
  element: HTMLElement
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
  paused: boolean
}

const props = withDefaults(defineProps<{
  tags: TagItem[]
  modelValue?: string | null
}>(), { tags: () => [], modelValue: null })

const emit = defineEmits<{
  'tag-click': [name: string]
  'update:modelValue': [name: string | null]
}>()

const container = ref<HTMLElement | null>(null)
const cloud = ref<HTMLElement | null>(null)
const staticMode = ref(true)
const tagElements: HTMLElement[] = []
let movingTags: MovingTag[] = []
let animationFrame = 0
let lastFrameTime = 0
let resizeObserver: ResizeObserver | null = null
let reducedMotion: MediaQueryList | null = null
let compactViewport: MediaQueryList | null = null
let coarsePointer: MediaQueryList | null = null

function setTagElement(element: unknown, index: number) {
  if (element instanceof HTMLElement) tagElements[index] = element
}

function select(name: string) {
  emit('tag-click', name)
  emit('update:modelValue', props.modelValue === name ? null : name)
}

function stableHash(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function tagStyle(index: number, count: number): CSSProperties {
  const tones = ['#f4f4f5', '#ff3340', '#a1a1aa', '#e30613']
  return {
    '--tag-color': tones[index % tones.length],
    '--tag-scale': Math.min(1.24, .9 + Math.log2(Math.max(1, count) + 1) * .08)
  } as CSSProperties
}

function stopMotion() {
  cancelAnimationFrame(animationFrame)
  animationFrame = 0
  lastFrameTime = 0
}

function pauseTag(index: number) {
  if (movingTags[index]) movingTags[index].paused = true
}

function resumeTag(index: number) {
  if (movingTags[index]) movingTags[index].paused = false
  lastFrameTime = performance.now()
}

function drawFrame(time: number) {
  if (staticMode.value || !cloud.value) return
  const delta = lastFrameTime ? Math.min((time - lastFrameTime) / 1000, .034) : 0
  lastFrameTime = time
  const width = cloud.value.clientWidth
  const height = cloud.value.clientHeight

  movingTags.forEach((tag) => {
    if (!tag.paused) {
      tag.x += tag.vx * delta
      tag.y += tag.vy * delta

      const maxX = Math.max(0, width - tag.width)
      const maxY = Math.max(0, height - tag.height)
      if (tag.x <= 0 || tag.x >= maxX) {
        tag.vx *= -1
        tag.x = Math.min(maxX, Math.max(0, tag.x))
      }
      if (tag.y <= 0 || tag.y >= maxY) {
        tag.vy *= -1
        tag.y = Math.min(maxY, Math.max(0, tag.y))
      }
    }
    tag.element.style.transform = `translate3d(${tag.x.toFixed(2)}px, ${tag.y.toFixed(2)}px, 0)`
  })

  animationFrame = requestAnimationFrame(drawFrame)
}

function initializeMotion() {
  stopMotion()
  movingTags = []
  if (!cloud.value) return

  tagElements.splice(props.tags.length)
  tagElements.forEach((element) => { element.style.transform = '' })
  if (staticMode.value || !props.tags.length) return

  const cloudWidth = cloud.value.clientWidth
  const cloudHeight = cloud.value.clientHeight
  const columns = Math.max(2, Math.ceil(Math.sqrt(props.tags.length * cloudWidth / cloudHeight)))
  const rows = Math.max(1, Math.ceil(props.tags.length / columns))

  movingTags = props.tags.map((tag, index) => {
    const element = tagElements[index]
    if (!element) return null
    const bounds = element.getBoundingClientRect()
    const hash = stableHash(`${tag.name}:${tag.count}`)
    const column = index % columns
    const row = Math.floor(index / columns)
    const maxX = Math.max(0, cloudWidth - bounds.width)
    const maxY = Math.max(0, cloudHeight - bounds.height)
    const baseX = columns === 1 ? maxX / 2 : column / (columns - 1) * maxX
    const baseY = rows === 1 ? maxY / 2 : row / (rows - 1) * maxY
    const angle = hash % 628 / 100
    const speed = 9 + hash % 9
    const x = Math.min(maxX, Math.max(0, baseX + ((hash >> 4) % 13 - 6)))
    const y = Math.min(maxY, Math.max(0, baseY + ((hash >> 9) % 11 - 5)))
    element.style.transform = `translate3d(${x}px, ${y}px, 0)`
    return {
      element,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      width: bounds.width,
      height: bounds.height,
      paused: false
    }
  }).filter((tag): tag is MovingTag => tag !== null)

  animationFrame = requestAnimationFrame(drawFrame)
}

function syncMotionMode() {
  staticMode.value = Boolean(reducedMotion?.matches || compactViewport?.matches || coarsePointer?.matches)
  void nextTick().then(initializeMotion)
}

watch(
  () => props.tags.map((tag) => `${tag.name}:${tag.count}`).join('|'),
  () => { void nextTick().then(initializeMotion) }
)

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  compactViewport = window.matchMedia('(max-width: 767px)')
  coarsePointer = window.matchMedia('(pointer: coarse)')
  ;[reducedMotion, compactViewport, coarsePointer].forEach((query) => query.addEventListener('change', syncMotionMode))
  resizeObserver = new ResizeObserver(() => initializeMotion())
  if (container.value) resizeObserver.observe(container.value)
  syncMotionMode()
})

onBeforeUnmount(() => {
  stopMotion()
  resizeObserver?.disconnect()
  ;[reducedMotion, compactViewport, coarsePointer].forEach((query) => query?.removeEventListener('change', syncMotionMode))
})
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.tag-cloud-container {
  position: relative; height: 238px; overflow: hidden; border: 1px solid @line; border-radius: 16px;
  background: linear-gradient(135deg, rgba(227,6,19,.13), transparent 38%), @surface-raised;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.045);
}
.tag-cloud-container::before { content: ''; position: absolute; top: -52%; left: 54%; width: 3px; height: 210%; background: @accent; opacity: .52; transform: rotate(28deg); pointer-events: none; }
.tag-cloud { position: relative; width: 100%; height: 100%; padding: 14px; }
.tag-item { position: absolute; top: 0; left: 0; border: 0; padding: 0; background: transparent; color: var(--tag-color); cursor: pointer; will-change: transform; }
.tag-face {
  display: inline-flex; min-height: 42px; align-items: center; gap: .65rem; border: 1px solid color-mix(in srgb, var(--tag-color) 44%, transparent);
  border-radius: 12px; padding: .62rem .78rem; background: rgba(9,9,11,.74); backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0,0,0,.23); transform: scale(var(--tag-scale));
  transition: transform 320ms cubic-bezier(.16,1,.3,1), border-color 220ms ease, background 220ms ease;
}
.tag-face strong { font-size: .88rem; font-weight: 680; white-space: nowrap; }
.tag-face small { color: @text-muted; font-size: .68rem; }
.tag-item:hover .tag-face, .tag-item:focus-visible .tag-face, .tag-item[aria-pressed='true'] .tag-face { border-color: @accent-strong; background: #2b171a; transform: scale(calc(var(--tag-scale) * 1.1)); }
.tag-item:focus-visible { outline: 2px solid @text; outline-offset: 4px; }

.static-mode { height: auto; min-height: 0; overflow: visible; border: 0; background: transparent; box-shadow: none; }
.static-mode::before { display: none; }
.static-mode .tag-cloud { display: flex; height: auto; gap: .65rem; overflow-x: auto; padding: .25rem 0 .75rem; scrollbar-color: @line transparent; scroll-snap-type: x proximity; }
.static-mode .tag-item { position: relative; flex: none; scroll-snap-align: start; transform: none !important; }
.static-mode .tag-face { min-height: 44px; transform: none; }
.static-mode .tag-item:hover .tag-face, .static-mode .tag-item:focus-visible .tag-face, .static-mode .tag-item[aria-pressed='true'] .tag-face { transform: none; }

@media (prefers-reduced-transparency: reduce) { .tag-face { background: @surface; backdrop-filter: none; } }
@media (prefers-reduced-motion: reduce) { .tag-face { transition: none; } }
</style>
