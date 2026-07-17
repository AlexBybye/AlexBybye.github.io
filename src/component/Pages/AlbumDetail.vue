<template>
  <div class="album-detail-page">
    <div class="page-shell">
      <div class="detail-toolbar">
        <button class="back-button" type="button" @click="$router.push('/Animation3/album')">
          <PhArrowLeft :size="18" weight="bold" />返回相册
        </button>
        <div class="view-switcher" role="group" aria-label="照片排列方式">
          <button type="button" :aria-pressed="viewMode === 'free'" @click="viewMode = 'free'">
            <PhGridFour :size="18" aria-hidden="true" />自由阵型
          </button>
          <button type="button" :aria-pressed="viewMode === 'squad'" @click="viewMode = 'squad'">
            <PhStrategy :size="18" aria-hidden="true" />比赛阵型
          </button>
        </div>
      </div>

      <header class="detail-hero">
        <div class="album-title-block">
          <span class="mono">PHOTO ALBUM</span>
          <h1 :aria-label="album?.title || 'Album'">
            <span v-for="(character, index) in titleCharacters" :key="`${character}-${index}`"
              aria-hidden="true" :style="{ '--character-index': index }">
              {{ character === ' ' ? '\u00A0' : character }}
            </span>
          </h1>
        </div>

        <div class="album-introduction">
          <PhCamera :size="28" weight="bold" aria-hidden="true" />
          <p v-if="album?.description">{{ album.description }}</p>
          <dl>
            <div><dt>拍摄日期</dt><dd class="mono">{{ album ? formatAlbumDate(album.date) : '-' }}</dd></div>
            <div><dt>场上照片</dt><dd class="mono">{{ photos.length }}</dd></div>
          </dl>
          <div class="load-pitch" :class="{ complete: loadPercent === 100 }" aria-live="polite">
            <span class="load-line" aria-hidden="true"><i :style="{ transform: `scaleX(${loadPercent / 100})` }" /></span>
            <span class="mono">{{ loadedCount }} / {{ photos.length }} READY</span>
            <PhSoccerBall :size="22" weight="fill" aria-hidden="true" />
          </div>
        </div>
      </header>

      <div v-if="loading" class="photo-grid loading-grid"><span v-for="n in 8" :key="n" /></div>
      <div v-else-if="error" class="state-box">
        <PhWarningCircle :size="25" /><p>{{ error }}</p><button type="button" @click="loadAlbum">重新加载</button>
      </div>

      <Transition v-else name="grid-switch" mode="out-in">
        <div :key="viewMode" class="photo-grid" :class="`mode-${viewMode}`">
          <template v-for="(photo, index) in photos" :key="photo.id">
            <button v-if="!photo.failed" type="button" class="photo-button" :class="{ loaded: photo.loaded }"
              :style="{ '--photo-index': index }" :aria-label="`打开${album?.title || '相册'}第 ${index + 1} 张照片`"
              @click="openViewer(index)" @pointermove="tiltPhoto" @pointerleave="resetPhoto">
              <span class="photo-frame">
                <img :src="photo.src" :alt="`${album?.title || '相册'} 第 ${index + 1} 张照片`"
                  loading="lazy" decoding="async" @load="markPhotoLoaded(photo)" @error="handleImageError(photo)">
                <span class="photo-shine" aria-hidden="true" />
              </span>
            </button>
          </template>
        </div>
      </Transition>
    </div>

    <Teleport to="body">
      <Transition name="viewer">
        <div v-if="selectedIndex !== null" class="viewer" role="dialog" aria-modal="true" aria-label="照片查看器" @click="closeViewer">
          <button class="viewer-close" type="button" aria-label="关闭照片" @click="closeViewer"><PhX :size="24" weight="bold" /></button>
          <button class="viewer-nav prev" type="button" aria-label="上一张" @click.stop="previousPhoto"><PhArrowLeft :size="24" weight="bold" /></button>
          <div class="viewer-stage" @click.stop>
            <Transition name="photo-swap" mode="out-in">
              <img :key="photos[selectedIndex].id" :class="`direction-${viewDirection}`" :src="photos[selectedIndex].src"
                :alt="`${album?.title || '相册'} 第 ${selectedIndex + 1} 张照片`">
            </Transition>
          </div>
          <button class="viewer-nav next" type="button" aria-label="下一张" @click.stop="nextPhoto"><PhArrowRight :size="24" weight="bold" /></button>
          <div class="viewer-count mono"><PhSoccerBall :size="18" weight="fill" aria-hidden="true" />{{ selectedIndex + 1 }} / {{ photos.length }}</div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  PhArrowLeft,
  PhArrowRight,
  PhCamera,
  PhGridFour,
  PhSoccerBall,
  PhStrategy,
  PhWarningCircle,
  PhX
} from '@/design/icons'

const props = defineProps<{ id: string }>()
interface AlbumItem { id: string; title: string; date: string; count: number; description: string }
interface PhotoItem { id: number; src: string; fallbackStep: number; loaded: boolean; failed: boolean }
type ViewMode = 'free' | 'squad'

const album = ref<AlbumItem | null>(null)
const photos = ref<PhotoItem[]>([])
const selectedIndex = ref<number | null>(null)
const loading = ref(true)
const error = ref('')
const viewMode = ref<ViewMode>('free')
const viewDirection = ref<'next' | 'previous'>('next')
let tiltFrame = 0

const titleCharacters = computed(() => Array.from(album.value?.title || 'Album'))
const loadedCount = computed(() => photos.value.filter((photo) => photo.loaded || photo.failed).length)
const loadPercent = computed(() => photos.value.length ? Math.round(loadedCount.value / photos.value.length * 100) : 0)

async function loadAlbum() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch('/album/albumcontext.json')
    if (!response.ok) throw new Error(`相册索引加载失败 (${response.status})`)
    const albums = await response.json() as AlbumItem[]
    album.value = albums.find((item) => item.id === props.id) || null
    if (!album.value) throw new Error('没有找到这个相册。')
    photos.value = Array.from({ length: album.value.count }, (_, index) => ({
      id: index + 1,
      src: `/album/${props.id}/photo_${index + 1}.webp`,
      fallbackStep: 0,
      loaded: false,
      failed: false
    }))
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '相册加载失败' }
  finally { loading.value = false }
}

function formatAlbumDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))
}
function markPhotoLoaded(photo: PhotoItem) { photo.loaded = true }
function handleImageError(photo: PhotoItem) {
  if (photo.fallbackStep === 0) { photo.fallbackStep = 1; photo.src = photo.src.replace('.webp', '.jpg'); return }
  if (photo.fallbackStep === 1) { photo.fallbackStep = 2; photo.src = photo.src.replace('.jpg', '.png'); return }
  photo.failed = true
}
function openViewer(index: number) { selectedIndex.value = index; document.body.style.overflow = 'hidden' }
function closeViewer() { selectedIndex.value = null; document.body.style.overflow = '' }
function previousPhoto() {
  if (selectedIndex.value === null) return
  viewDirection.value = 'previous'
  selectedIndex.value = (selectedIndex.value - 1 + photos.value.length) % photos.value.length
}
function nextPhoto() {
  if (selectedIndex.value === null) return
  viewDirection.value = 'next'
  selectedIndex.value = (selectedIndex.value + 1) % photos.value.length
}
function handleKey(event: KeyboardEvent) {
  if (selectedIndex.value === null) return
  if (event.key === 'Escape') closeViewer()
  if (event.key === 'ArrowLeft') previousPhoto()
  if (event.key === 'ArrowRight') nextPhoto()
}
function tiltPhoto(event: PointerEvent) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - .5
  const y = (event.clientY - rect.top) / rect.height - .5
  cancelAnimationFrame(tiltFrame)
  tiltFrame = requestAnimationFrame(() => {
    button.style.setProperty('--shine-x', `${(x + .5) * 100}%`)
    button.style.setProperty('--shine-y', `${(y + .5) * 100}%`)
    button.style.transform = `perspective(900px) rotateX(${-y * 2.6}deg) rotateY(${x * 3.4}deg) translate3d(0,-3px,0)`
  })
}
function resetPhoto(event: PointerEvent) {
  const button = event.currentTarget as HTMLElement
  cancelAnimationFrame(tiltFrame)
  tiltFrame = requestAnimationFrame(() => { button.style.transform = '' })
}

onMounted(() => { void loadAlbum(); window.addEventListener('keydown', handleKey) })
onBeforeUnmount(() => {
  cancelAnimationFrame(tiltFrame)
  window.removeEventListener('keydown', handleKey)
  document.body.style.overflow = ''
})
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.album-detail-page { min-height: 100dvh; background: @surface; color: @text; }
.detail-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-top: 1.25rem; }
.back-button,.view-switcher button { display: inline-flex; min-height: 44px; align-items: center; gap: .5rem; border: 1px solid @line; border-radius: 12px; padding: .65rem .85rem; background: @surface-raised; color: @text; font-weight: 650; white-space: nowrap; cursor: pointer; transition: border-color 180ms ease,transform 180ms ease,background 180ms ease; }
.back-button:hover,.view-switcher button:hover { border-color: @accent; transform: translateY(-2px); }.back-button:active,.view-switcher button:active { transform: scale(.97); }
.view-switcher { display: flex; gap: .4rem; }.view-switcher button { border-color: transparent; color: @text-muted; }.view-switcher button[aria-pressed='true'] { background: @accent; color: @text; }

.detail-hero { display: grid; grid-template-columns: minmax(0,1.18fr) minmax(300px,.82fr); gap: clamp(2rem,8vw,7rem); min-height: 510px; align-items: end; padding-block: clamp(3rem,7vw,6rem); border-bottom: 1px solid @line; }
.album-title-block > span { color: @accent-strong; font-size: .72rem; font-weight: 700; letter-spacing: .14em; }.album-title-block h1 { max-width: 10ch; margin: 1rem 0 0; font-size: clamp(3.5rem,8.5vw,7.6rem); font-weight: 720; letter-spacing: .015em; line-height: .88; text-transform: uppercase; }
.album-title-block h1 > span { display: inline-block; animation: character-kick 720ms calc(var(--character-index) * 58ms) cubic-bezier(.16,1,.3,1) both; }
.album-introduction { position: relative; border-left: 2px solid @accent; padding-left: clamp(1.25rem,3vw,2.2rem); }.album-introduction > svg { color: @accent-strong; }.album-introduction > p { max-width: 34ch; margin: 1.2rem 0 0; color: #d4d4d8; font-family: Georgia,'Times New Roman',serif; font-size: clamp(1.2rem,2.2vw,1.65rem); font-style: italic; line-height: 1.55; letter-spacing: .025em; }
.album-introduction dl { display: grid; grid-template-columns: repeat(2,1fr); gap: 1rem; margin: 2rem 0 0; }.album-introduction dt { color: @text-muted; font-size: .72rem; }.album-introduction dd { margin: .45rem 0 0; font-size: .82rem; font-weight: 650; }
.load-pitch { display: grid; grid-template-columns: 1fr auto auto; gap: .65rem; align-items: center; margin-top: 1.4rem; color: @text-muted; }.load-line { position: relative; height: 2px; overflow: hidden; background: @line; }.load-line i { display: block; width: 100%; height: 100%; background: @accent; transform-origin: left; transition: transform 500ms cubic-bezier(.16,1,.3,1); }.load-pitch > span:nth-child(2) { font-size: .68rem; white-space: nowrap; }.load-pitch > svg { transition: transform 500ms cubic-bezier(.16,1,.3,1); }.load-pitch.complete > svg { color: @accent-strong; transform: rotate(360deg) scale(1.12); }

.photo-grid { padding-block: clamp(3rem,7vw,6rem); content-visibility: auto; contain-intrinsic-size: 1200px; }.photo-grid.mode-free { columns: 3 280px; column-gap: 1rem; }.photo-grid.mode-squad { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); grid-auto-rows: 250px; gap: 1rem; }.mode-squad .photo-button { height: 100%; margin: 0; }.mode-squad .photo-button:nth-child(9n + 1) { grid-column: span 2; grid-row: span 2; }.mode-squad .photo-button:nth-child(9n + 5) { grid-row: span 2; }
.photo-button { --shine-x: 50%; --shine-y: 50%; display: block; width: 100%; margin: 0 0 1rem; break-inside: avoid; border: 0; border-radius: 16px; padding: 0; background: transparent; opacity: 0; transform: translate3d(0,35px,0) scale(.96); cursor: zoom-in; transform-style: preserve-3d; transition: opacity 620ms ease calc(var(--photo-index) * 24ms),transform 680ms cubic-bezier(.16,1,.3,1),filter 220ms ease; }.photo-button.loaded { opacity: 1; transform: none; }.photo-frame { position: relative; display: block; width: 100%; height: 100%; overflow: hidden; border: 1px solid @line; border-radius: 16px; padding: 10px; background: rgba(24,24,27,.86); box-shadow: 0 16px 42px rgba(0,0,0,.24); }.photo-button img { display: block; width: 100%; height: auto; border-radius: 10px; object-fit: cover; filter: saturate(.78) contrast(1.03); transition: filter 240ms ease,transform 700ms cubic-bezier(.16,1,.3,1); }.mode-squad .photo-button img { height: 100%; }.photo-shine { position: absolute; inset: 10px; border-radius: 10px; pointer-events: none; opacity: 0; background: radial-gradient(circle at var(--shine-x) var(--shine-y),rgba(255,255,255,.16),transparent 30%); transition: opacity 220ms ease; }.photo-button:hover .photo-shine { opacity: 1; }.photo-button:hover img { filter: saturate(1); transform: scale(1.025); }
.loading-grid { columns: 3 280px; column-gap: 1rem; }.loading-grid span { display: block; height: 330px; margin-bottom: 1rem; border-radius: 16px; background: linear-gradient(90deg,@surface-raised 25%,@surface-soft 46%,@surface-raised 66%); background-size: 220% 100%; animation: loading-sweep 1.2s ease-in-out infinite; }.loading-grid span:nth-child(3n) { height: 470px; }
.state-box { display: flex; align-items: center; gap: 1rem; margin-block: 3rem; border: 1px dashed @line; border-radius: 16px; padding: 2rem; color: @text-muted; }.state-box p { margin: 0; }.state-box button { min-height: 44px; margin-left: auto; border: 0; border-radius: 12px; padding: .7rem 1rem; background: @accent; color: @text; cursor: pointer; }

.viewer { position: fixed; z-index: 40; inset: 0; display: grid; grid-template-columns: 64px minmax(0,1fr) 64px; place-items: center; gap: 1rem; padding: max(1rem,env(safe-area-inset-top)) max(1rem,env(safe-area-inset-right)) max(1rem,env(safe-area-inset-bottom)) max(1rem,env(safe-area-inset-left)); background: rgba(9,9,11,.95); backdrop-filter: blur(16px); }.viewer::before { content: ''; position: absolute; top: 0; right: 0; left: 0; height: 3px; background: @accent; }.viewer-stage { display: grid; width: 100%; height: calc(100dvh - 5rem); place-items: center; overflow: hidden; }.viewer-stage > img { max-width: 100%; max-height: 100%; border: 1px solid @line; border-radius: 16px; object-fit: contain; box-shadow: 0 28px 80px rgba(0,0,0,.48); }.viewer-close,.viewer-nav { display: grid; width: 48px; height: 48px; place-items: center; border: 1px solid @line; border-radius: 12px; background: @surface-raised; color: @text; cursor: pointer; transition: background 180ms ease,transform 180ms ease; }.viewer-close:hover,.viewer-nav:hover { background: @accent; transform: scale(1.05); }.viewer-close { position: absolute; z-index: 2; top: max(1rem,env(safe-area-inset-top)); right: max(1rem,env(safe-area-inset-right)); }.viewer-count { position: absolute; bottom: max(1rem,env(safe-area-inset-bottom)); left: 50%; display: inline-flex; align-items: center; gap: .45rem; color: @text-muted; transform: translateX(-50%); }
.viewer-enter-active,.viewer-leave-active { transition: opacity 320ms ease; }.viewer-enter-active .viewer-stage,.viewer-leave-active .viewer-stage { transition: transform 520ms cubic-bezier(.16,1,.3,1); }.viewer-enter-from,.viewer-leave-to { opacity: 0; }.viewer-enter-from .viewer-stage { transform: scale(.9) translate3d(0,24px,0); }.viewer-leave-to .viewer-stage { transform: scale(.94); }
.photo-swap-enter-active,.photo-swap-leave-active { transition: opacity 220ms ease,transform 420ms cubic-bezier(.16,1,.3,1); }.photo-swap-enter-from.direction-next { opacity: 0; transform: translate3d(48px,0,0) rotate(1deg); }.photo-swap-enter-from.direction-previous { opacity: 0; transform: translate3d(-48px,0,0) rotate(-1deg); }.photo-swap-leave-to { opacity: 0; transform: scale(.96); }
.grid-switch-enter-active,.grid-switch-leave-active { transition: opacity 240ms ease,transform 420ms cubic-bezier(.16,1,.3,1); }.grid-switch-enter-from { opacity: 0; transform: translate3d(0,26px,0); }.grid-switch-leave-to { opacity: 0; transform: translate3d(0,-18px,0); }
@keyframes character-kick { from { opacity: 0; transform: translate3d(-28px,22px,0) rotate(-6deg); } to { opacity: 1; transform: none; } } @keyframes loading-sweep { to { background-position: -120% 0; } }

@media (max-width: 767px) {
  .detail-toolbar { align-items: stretch; flex-direction: column; }.view-switcher { width: 100%; }.view-switcher button { flex: 1; justify-content: center; }
  .detail-hero { grid-template-columns: 1fr; gap: 2.5rem; min-height: auto; align-items: start; padding-block: 3rem; }.album-title-block h1 { font-size: clamp(3.4rem,17vw,5rem); }.album-introduction { padding-left: 1.1rem; }
  .photo-grid.mode-free,.loading-grid { columns: 2 150px; column-gap: .65rem; }.photo-button { margin-bottom: .65rem; }.photo-frame { padding: 6px; }.photo-shine { inset: 6px; }.photo-grid.mode-squad { grid-template-columns: repeat(2,minmax(0,1fr)); grid-auto-rows: 180px; gap: .65rem; }.mode-squad .photo-button:nth-child(9n + 1) { grid-column: span 2; }
  .viewer { grid-template-columns: 44px minmax(0,1fr) 44px; gap: .25rem; }.viewer-close,.viewer-nav { width: 42px; height: 42px; }.viewer-stage { height: calc(100dvh - 7rem); }.state-box { align-items: start; flex-direction: column; }.state-box button { width: 100%; margin: 0; }
}
@media (prefers-reduced-transparency: reduce) { .viewer { background: @surface; backdrop-filter: none; } }
@media (prefers-reduced-motion: reduce) { .album-title-block h1 > span,.loading-grid span { animation: none; }.back-button,.view-switcher button,.load-line i,.load-pitch > svg,.photo-button,.photo-button img,.photo-shine,.viewer-enter-active,.viewer-leave-active,.viewer-enter-active .viewer-stage,.viewer-leave-active .viewer-stage,.photo-swap-enter-active,.photo-swap-leave-active,.grid-switch-enter-active,.grid-switch-leave-active,.viewer-close,.viewer-nav { transition: none; }.photo-button { opacity: 1; transform: none; } }
</style>
