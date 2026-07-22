<template>
  <div class="album-page">
    <div class="page-shell">
      <header class="album-header"><h1>{{ t('album.title') }}</h1><p>{{ t('album.description') }}</p></header>
      <div v-if="loading" class="album-list"><div v-for="n in 3" :key="n" class="album-row skeleton" /></div>
      <div v-else-if="error" class="state-box"><PhWarningCircle :size="25" /><p>{{ error }}</p><button type="button" @click="loadAlbums">{{ t('common.retry') }}</button></div>
      <div v-else class="album-list" :aria-label="t('album.listLabel')">
        <RevealOnScroll v-for="(album, index) in albums" :key="album.id" :delay="Math.min(index * 70, 280)">
          <RouterLink class="album-row" :class="{ reverse: index % 2 === 1 }" :to="`/Animation3/album/detail/${album.id}`">
            <div class="album-copy">
              <span class="mono">{{ String(index + 1).padStart(2, '0') }} / {{ t('album.photos', { count: album.count }) }}</span>
              <h2>{{ album.title }}</h2>
              <p>{{ album.description }}</p>
              <span class="album-link">{{ t('album.open') }}<PhSoccerBall class="album-ball" :size="18" weight="fill" /><PhArrowRight :size="19" weight="bold" /></span>
            </div>
            <div class="album-preview" :class="previewLayoutClass(album)">
              <img v-for="photo in previewPhotos(album)" :key="photo" :src="photo" :alt="t('album.previewAlt', { title: album.title })"
                :loading="index === 0 ? 'eager' : 'lazy'" decoding="async" @error="handleImageError($event, album.id)">
            </div>
          </RouterLink>
        </RevealOnScroll>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhArrowRight, PhSoccerBall, PhWarningCircle } from '@/design/icons'
import RevealOnScroll from '@/components/ui/RevealOnScroll.vue'

interface AlbumItem { id: string; title: string; date: string; count: number; description: string; previews?: number[] }
const albums = ref<AlbumItem[]>([])
const { t } = useI18n()
const loading = ref(true)
const error = ref('')

async function loadAlbums() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch('/album/albumcontext.json')
    if (!response.ok) throw new Error(t('album.indexLoadFailed', { status: response.status }))
    albums.value = await response.json()
  } catch (cause) { error.value = cause instanceof Error ? cause.message : t('album.loadFailed') }
  finally { loading.value = false }
}
function previewNumbers(album: AlbumItem) {
  return Array.isArray(album.previews)
    ? album.previews
    : [1, Math.max(2, Math.ceil(album.count / 2)), album.count]
}
function previewPhotos(album: AlbumItem) {
  return previewNumbers(album).map(number => `/album/${album.id}/photo_${number}.webp`)
}
function previewLayoutClass(album: AlbumItem) {
  const count = previewNumbers(album).length
  return { single: count === 1, pair: count === 2, many: count >= 4 }
}
function handleImageError(event: Event, albumId: string) {
  const image = event.target as HTMLImageElement
  if (image.dataset.fallback) return
  image.dataset.fallback = 'true'
  image.src = `/album/${albumId}/photo_1.webp`
}
onMounted(loadAlbums)
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';
.album-page { min-height: 100dvh; background: transparent; color: @text; }
.album-header { max-width: 800px; padding-block: clamp(2.5rem, 7vw, 6rem); }.album-header h1 { margin: 0; font-size: clamp(3.2rem, 10vw, 7.4rem); letter-spacing: -.08em; line-height: .9; }.album-header p { max-width: 54ch; margin: 1.4rem 0 0; color: @text-muted; font-size: 1.1rem; line-height: 1.65; }
.album-list { display: grid; gap: 1rem; }
.album-list :deep(.reveal) { min-width: 0; }
.album-row { display: grid; grid-template-columns: .78fr 1.22fr; min-height: 430px; overflow: hidden; border: 1px solid @line; border-radius: 16px; background: @surface-raised; color: @text; text-decoration: none; cursor: pointer; }
.album-row.reverse { grid-template-columns: 1.1fr .9fr; }.album-row.reverse .album-copy { order: 2; }.album-row.reverse .album-preview { order: 1; }
.album-copy { display: flex; flex-direction: column; justify-content: center; padding: clamp(1.5rem, 5vw, 4rem); }.album-copy > span:first-child { color: @accent-strong; font-size: .72rem; }.album-copy h2 { max-width: 10ch; margin: 1.1rem 0 .8rem; font-size: clamp(2.2rem, 5vw, 4.8rem); letter-spacing: -.06em; line-height: .95; }.album-copy p { max-width: 42ch; margin: 0; color: @text-muted; line-height: 1.65; }.album-link { display: inline-flex; width: fit-content; min-height: 44px; align-items: center; gap: .5rem; margin-top: 1.8rem; color: @text; font-weight: 680; }
.album-preview { display: grid; grid-template-columns: 1.4fr .6fr; grid-template-rows: repeat(2, 1fr); gap: 4px; min-width: 0; background: @surface; }.album-preview img { width: 100%; height: 100%; object-fit: cover; filter: saturate(.72); transition: transform 700ms cubic-bezier(.16,1,.3,1), filter 300ms ease; }.album-preview img:first-child { grid-row: 1 / -1; }.album-row:hover .album-preview img { filter: saturate(.95); transform: scale(1.018); }
.album-preview.single { grid-template-columns: 1fr; grid-template-rows: 1fr; }.album-preview.pair { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: 1fr; }.album-preview.many { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: none; grid-auto-rows: minmax(0, 1fr); }
.album-preview.single img:first-child,.album-preview.pair img:first-child,.album-preview.many img:first-child { grid-row: auto; }
.album-row:hover .album-preview img:nth-child(2) { transform: scale(1.035) translateY(-5px); }.album-row:hover .album-preview img:nth-child(3) { transform: scale(1.035) translateY(5px); }.album-copy h2,.album-link :deep(svg) { transition: transform 360ms cubic-bezier(.16,1,.3,1),letter-spacing 360ms ease; }.album-row:hover .album-copy h2 { letter-spacing: -.035em; transform: translateX(8px); }.album-row:hover .album-link > :deep(svg:last-child) { transform: translateX(5px); }.album-row:hover .album-ball { transform: translateX(4px) rotate(180deg); }
.skeleton { min-height: 430px; cursor: default; animation: pulse 1.2s ease-in-out infinite alternate; } @keyframes pulse { to { opacity: .48; } }
.state-box { display: flex; align-items: center; gap: 1rem; border: 1px dashed @line; border-radius: 16px; padding: 2rem; color: @text-muted; }.state-box p { margin: 0; }.state-box button { min-height: 44px; margin-left: auto; border: 0; border-radius: 12px; padding: .7rem 1rem; background: @accent; color: @text; cursor: pointer; }
@media (max-width: 767px) {
  .album-row, .album-row.reverse { grid-template-columns: 1fr; min-height: 0; }.album-row.reverse .album-copy, .album-row.reverse .album-preview { order: initial; }.album-copy { min-height: 300px; }.album-preview { min-height: 320px; }
  .state-box { align-items: start; flex-direction: column; }.state-box button { width: 100%; margin: 0; }
}
@media (prefers-reduced-motion: reduce) { .album-preview img,.album-copy h2,.album-link :deep(svg) { transition: none; transform: none; } }
</style>
