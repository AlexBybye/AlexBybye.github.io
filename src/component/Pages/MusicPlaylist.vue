<template>
  <div class="playlist-page">
    <div class="page-shell">
      <header class="playlist-header">
        <div><h1>Music Playlist</h1><p>Filter the collection, play a track, and open its discussion.</p></div>
        <div class="library-count mono">{{ filteredTracks.length }} tracks</div>
      </header>

      <section v-if="musicStore.currentTrack" class="player-panel" aria-label="当前播放">
        <img :src="coverFor(musicStore.currentTrack.coverImage)" :alt="musicStore.currentTrack.title" @error="onImageError">
        <div class="current-details"><span class="mono">NOW PLAYING</span><h2>{{ musicStore.currentTrack.title }}</h2><p>{{ musicStore.currentTrack.artist }}</p></div>
        <div class="main-controls">
          <IconButton label="上一首" @click="musicStore.playPrevious"><PhSkipBack :size="20" weight="fill" /></IconButton>
          <button class="primary-play" type="button" :aria-label="musicStore.isPlaying ? '暂停' : '播放'" @click="musicStore.togglePlay">
            <PhPause v-if="musicStore.isPlaying" :size="24" weight="fill" /><PhPlay v-else :size="24" weight="fill" />
          </button>
          <IconButton label="下一首" @click="musicStore.playNext"><PhSkipForward :size="20" weight="fill" /></IconButton>
        </div>
        <div class="progress-area">
          <button class="progress-bar" type="button" aria-label="调整播放进度" @click="seekMusic"><span :style="{ width: `${progressPercent}%` }" /></button>
          <div class="time-row mono"><span>{{ formatTime(musicStore.currentTime) }}</span><span>{{ formatTime(musicStore.totalTime) }}</span></div>
        </div>
      </section>

      <div class="filter-row">
        <TagCloud :tags="musicTypes" :model-value="musicStore.selectedType" @tag-click="filterByType" />
        <label class="volume-control"><span>音量</span><input v-model.number="musicStore.volume" type="range" min="0" max="100"><b class="mono">{{ musicStore.volume }}%</b></label>
      </div>

      <div v-if="!musicStore.tracks.length" class="track-skeletons" aria-label="正在加载歌曲">
        <div v-for="n in 4" :key="n" />
      </div>
      <div v-else-if="!filteredTracks.length" class="empty-state"><PhMusicNote :size="30" /><p>这个筛选条件下没有歌曲。</p></div>
      <section v-else class="track-grid" aria-label="歌曲列表">
        <article v-for="(track, index) in filteredTracks" :key="track.filename" v-memo="[track.filename, isTrackActive(track)]"
          class="track-card" :class="{ active: isTrackActive(track) }" role="button" tabindex="0"
          @click="selectTrack(track)" @keydown.enter="selectTrack(track)" @keydown.space.prevent="selectTrack(track)">
          <img :src="coverFor(track.coverImage)" :alt="track.title" loading="lazy" decoding="async" @error="onImageError">
          <div class="track-info"><span class="mono">{{ String(index + 1).padStart(2, '0') }}</span><h3>{{ track.title }}</h3><p>{{ track.artist }}</p><small>{{ track.type }}</small></div>
          <div class="track-reaction" @click.stop><ReactionBar target-type="song" :target-id="slugFor(track.filename)" compact /></div>
        </article>
      </section>

      <section v-if="musicStore.currentTrack" class="active-discussion">
        <h2>Discuss {{ musicStore.currentTrack.title }}</h2>
        <CommentThread :slug="`song:${slugFor(musicStore.currentTrack.filename)}`" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { PhMusicNote, PhPause, PhPlay, PhSkipBack, PhSkipForward } from '@/design/icons'
import { useAudioManager } from '@/stores/audioManager'
import { useMusicStore } from '@/stores/musicStore'
import CommentThread from '@/components/social/CommentThread.vue'
import ReactionBar from '@/components/social/ReactionBar.vue'
import IconButton from '@/components/ui/IconButton.vue'
import TagCloud from './TagCloud.vue'

const musicStore = useMusicStore()
const audioManager = useAudioManager()
const musicTypes = computed(() => musicStore.getMusicTypes())
const filteredTracks = computed(() => musicStore.getFilteredTracks())
const progressPercent = computed(() => musicStore.totalTime ? musicStore.currentTime / musicStore.totalTime * 100 : 0)

type Track = NonNullable<typeof musicStore.currentTrack>
function isTrackActive(track: Track) { return musicStore.currentTrack?.filename === track.filename }
function selectTrack(track: Track) { const index = musicStore.tracks.findIndex((item) => item.filename === track.filename); if (index >= 0) musicStore.playTrack(index) }
function filterByType(type: string) { musicStore.filterByType(musicStore.selectedType === type ? null : type) }
function slugFor(filename: string) { return encodeURIComponent(filename).replace(/%/g, '').toLowerCase() }
function formatTime(seconds: number) { const value = Number(seconds) || 0; return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}` }
function coverFor(value: string) { return `/music/${value.replace(/\.(jpe?g|png)$/i, '.webp')}` }
function onImageError(event: Event) { (event.target as HTMLImageElement).src = '/music/img/soccer.webp' }
function seekMusic(event: MouseEvent) { const rect = (event.currentTarget as HTMLElement).getBoundingClientRect(); audioManager.seekToPercentage((event.clientX - rect.left) / rect.width * 100) }
onMounted(() => { if (!musicStore.tracks.length) musicStore.loadTracks() })
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';
.playlist-page { min-height: 100dvh; background: transparent; color: @text; }
.playlist-header { display: flex; align-items: end; justify-content: space-between; gap: 2rem; padding-block: 2.5rem 2rem; }
.playlist-header h1 { margin: 0; font-size: clamp(2.8rem, 7vw, 5.8rem); letter-spacing: -.07em; line-height: .94; }
.playlist-header p { margin: 1rem 0 0; color: @text-muted; font-size: 1.05rem; }
.library-count { color: @text-muted; white-space: nowrap; }
.player-panel { display: grid; grid-template-columns: 170px 1fr auto; gap: 1.5rem; align-items: center; border: 1px solid @line; border-radius: 16px; padding: 1rem; background: @surface-raised; }
.player-panel > img { width: 170px; aspect-ratio: 1; border-radius: 12px; object-fit: cover; }
.current-details span { color: @accent-strong; font-size: .72rem; letter-spacing: .12em; }.current-details h2 { max-width: 18ch; margin: .65rem 0 .4rem; font-size: clamp(1.5rem, 3vw, 2.5rem); letter-spacing: -.04em; }.current-details p { margin: 0; color: @text-muted; }
.main-controls { display: flex; gap: .5rem; }.primary-play { display: grid; width: 50px; height: 50px; place-items: center; border: 0; border-radius: 12px; background: @accent; color: @text; cursor: pointer; }
.progress-area { grid-column: 2 / -1; }.progress-bar { display: block; width: 100%; height: 18px; border: 0; padding: 7px 0; background: transparent; cursor: pointer; }.progress-bar::before { content: ''; position: absolute; right: 0; left: 0; height: 3px; background: @line; }.progress-bar { position: relative; }.progress-bar span { position: absolute; z-index: 1; top: 7px; left: 0; height: 3px; background: @accent; }.time-row { display: flex; justify-content: space-between; color: @text-muted; font-size: .72rem; }
.filter-row { display: grid; grid-template-columns: 1fr auto; gap: 1.5rem; align-items: center; margin-block: 2rem; }
.volume-control { display: grid; grid-template-columns: auto 120px 42px; gap: .7rem; align-items: center; color: @text-muted; font-size: .8rem; }.volume-control input { accent-color: @accent; }
.track-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; content-visibility: auto; contain-intrinsic-size: 900px; }
.track-card { display: grid; grid-template-columns: 108px 1fr; gap: 1rem; min-width: 0; overflow: hidden; border: 1px solid @line; border-radius: 16px; padding: .75rem; background: @surface-raised; cursor: pointer; transition: border-color 160ms ease, transform 160ms ease; }
.track-card:nth-child(5n + 1) { grid-column: span 2; grid-template-columns: 160px 1fr auto; }
.track-card:hover, .track-card.active { border-color: @accent; }.track-card:hover { transform: translateY(-2px); }
.track-card > img { width: 108px; height: 108px; border-radius: 12px; object-fit: cover; }.track-card:nth-child(5n + 1) > img { width: 160px; height: 160px; }
.track-info { min-width: 0; align-self: center; }.track-info > span { color: @accent-strong; font-size: .7rem; }.track-info h3 { overflow: hidden; margin: .55rem 0 .3rem; font-size: 1.05rem; text-overflow: ellipsis; white-space: nowrap; }.track-info p { overflow: hidden; margin: 0; color: @text-muted; font-size: .86rem; text-overflow: ellipsis; white-space: nowrap; }.track-info small { display: inline-block; margin-top: .65rem; color: #d4d4d8; font-size: .72rem; }
.track-reaction { grid-column: 1 / -1; }.track-card:nth-child(5n + 1) .track-reaction { grid-column: 3; grid-row: 1; align-self: end; }
.track-skeletons { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }.track-skeletons div { min-height: 135px; border-radius: 16px; background: @surface-raised; animation: pulse 1.2s ease-in-out infinite alternate; } @keyframes pulse { to { opacity: .5; } }
.empty-state { display: flex; align-items: center; gap: 1rem; border: 1px dashed @line; border-radius: 16px; padding: 2rem; color: @text-muted; }
.active-discussion { padding-block: clamp(4rem, 8vw, 7rem); }.active-discussion > h2 { margin: 0; font-size: clamp(2rem, 5vw, 4rem); letter-spacing: -.055em; }
@media (max-width: 767px) {
  .playlist-header { align-items: start; flex-direction: column; }.player-panel { grid-template-columns: 92px 1fr; }.player-panel > img { width: 92px; }.main-controls { grid-column: 1 / -1; justify-content: center; }.progress-area { grid-column: 1 / -1; }
  .filter-row { grid-template-columns: 1fr; }.volume-control { grid-template-columns: auto 1fr 42px; }
  .track-grid, .track-skeletons { grid-template-columns: 1fr; }.track-card, .track-card:nth-child(5n + 1) { grid-column: auto; grid-template-columns: 88px 1fr; }.track-card > img, .track-card:nth-child(5n + 1) > img { width: 88px; height: 88px; }.track-card:nth-child(5n + 1) .track-reaction { grid-column: 1 / -1; grid-row: auto; }
}
@media (prefers-reduced-motion: reduce) { .track-card { transition: none; } }
</style>
