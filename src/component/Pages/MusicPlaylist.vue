<template>
  <div class="music-playlist-container">
    <h1>Music Playlist</h1>
    <p>Enjoy my curated music collection.</p>

    <div class="playlist-controls">
      <div class="player-controls">
        <button @click="musicStore.togglePlay" class="control-btn">
          {{ musicStore.isPlaying ? '⏸️' : '▶️' }}
        </button>
        <button @click="musicStore.playPrevious" class="control-btn">⏮️</button>
        <button @click="musicStore.playNext" class="control-btn">⏭️</button>
        <input 
          type="range" 
          v-model="musicStore.volume" 
          min="0" 
          max="100" 
          class="volume-slider"
          @change="setVolume"
        />
        <span class="volume-value">{{ musicStore.volume }}%</span>
      </div>

      <div class="current-track-info" v-if="musicStore.currentTrack">
        <div class="current-track-cover">
          <img 
            :src="'/music/' + musicStore.currentTrack.coverImage" 
            :alt="musicStore.currentTrack.title"
            @error="onImageError"
            class="cover-image"
          />
        </div>
        <div class="current-track-details">
          <h2>{{ musicStore.currentTrack.title }}</h2>
          <p>{{ musicStore.currentTrack.artist }}</p>
          <p>Type: {{ musicStore.currentTrack.type }}</p>
        </div>
      </div>
    </div>

    <!-- 音乐类型词云 -->
    <TagCloud :tags="musicTypes" @tag-click="filterByType" />

    <div class="playlist-container">
      <h3>Playlist</h3>
      <div class="track-grid">
        <div 
          v-for="(track, index) in filteredTracks" 
          :key="getTrackKey(track, index)"
          :class="{ 'active-track': isTrackActive(track) }"
          @click="selectTrackByTrack(track)"
          class="track-card"
        >
          <div class="track-cover">
            <img 
              :src="'/music/' + track.coverImage" 
              :alt="track.title"
              @error="onImageError"
              class="cover-image"
            />
          </div>
          <div class="track-info">
            <h4 class="track-title">{{ track.title }}</h4>
            <p class="track-artist">{{ track.artist }}</p>
            <p class="track-type">{{ track.type }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 移除了本地audio元素，改用全局音频管理 -->

    <div class="progress-container">
      <div class="progress-bar" @click="seekMusic">
        <div class="progress" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="time-info">
        <span>{{ formatTime(musicStore.currentTime) }}</span>
        <span>{{ formatTime(musicStore.totalTime) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import { useMusicStore } from '@/stores/musicStore';
import { useAudioManager } from '@/stores/audioManager';
import TagCloud from './TagCloud.vue';

// 移除了本地audioPlayer ref
const progressPercent = ref(0);
const musicStore = useMusicStore();
const audioManager = useAudioManager(); // 使用全局音频管理器

// 修复：添加辅助函数来判断当前曲目是否激活
const isTrackActive = (track) => {
  if (!musicStore.currentTrack) return false;
  return (
    track.title === musicStore.currentTrack.title &&
    track.artist === musicStore.currentTrack.artist &&
    track.filename === musicStore.currentTrack.filename
  );
};

// 修复：通过曲目对象来选择曲目
const selectTrackByTrack = (track) => {
  // 在原始tracks数组中查找匹配的索引
  const actualIndex = musicStore.tracks.findIndex(t => 
    t.title === track.title && 
    t.artist === track.artist && 
    t.filename === track.filename
  );
  
  if (actualIndex !== -1) {
    musicStore.playTrack(actualIndex);
    // 不再调用本地播放函数，而是依赖store和全局音频管理器
  }
};

// 添加辅助函数来生成唯一的key
const getTrackKey = (track, index) => {
  return `${track.title}-${track.artist}-${track.filename}-${index}`;
};

// 获取所有音乐类型用于词云
const musicTypes = computed(() => {
  return musicStore.getMusicTypes();
});

// 过滤后的歌曲列表
const filteredTracks = computed(() => {
  return musicStore.getFilteredTracks();
});

// 按类型过滤
const filterByType = (typeName) => {
  const currentType = musicStore.selectedType;
  musicStore.filterByType(currentType === typeName ? null : typeName);
};

// 处理图片加载错误
const onImageError = (event) => {
  event.target.src = '/images/background_1.png'; // 使用默认图片
};

// 格式化时间显示
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// 格式化持续时间
const formatDuration = (duration) => {
  return formatTime(duration);
};

// 设置音量
const setVolume = () => {
  // 音量变化会通过watch自动同步到全局音频管理器
};

// 更新进度条百分比
const updateProgressPercent = () => {
  if (musicStore.totalTime > 0) {
    progressPercent.value = (musicStore.currentTime / musicStore.totalTime) * 100;
  }
};

// 跳转到指定时间点
const seekMusic = (event) => {
  if (musicStore.totalTime > 0) {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    const newTime = pos * musicStore.totalTime;
    musicStore.setCurrentTime(newTime); // 更新store的时间
    audioManager.seekToPercentage(pos * 100); // 同步到全局音频管理器
  }
};

// 监听音乐store的状态变化并更新进度条
watch(() => musicStore.currentTime, () => {
  updateProgressPercent();
});

watch(() => musicStore.totalTime, () => {
  updateProgressPercent();
});

onMounted(async () => {
  await musicStore.loadTracks();
  if (musicStore.tracks.length > 0) {
    await nextTick();
    // 初始化时不需要主动播放，因为音频管理器会监听store状态
  }
});
</script>

<style scoped>
.music-playlist-container {
  width: 80%;
  margin: 0 auto;
  padding: 40px;
  background-color: #333;
  min-height: calc(100vh - 30% - 40px);
  opacity: 0.1;
  transition: all 0.5s ease;
  border-radius: 20px;
}

.music-playlist-container:hover {
  opacity: 0.8;
}

h1, h2, h3, h4 {
  color: #fff;
  text-align: center;
}

p {
  color: #ccc;
  font-size: 1.2rem;
  line-height: 1.6;
  text-align: center;
}

.playlist-controls {
  margin: 30px 0;
  text-align: center;
}

.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.volume-slider {
  width: 150px;
  margin: 0 10px;
}

.volume-value {
  color: white;
  min-width: 40px;
}

.current-track-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.current-track-cover {
  flex-shrink: 0;
}

.current-track-details {
  text-align: left;
  flex-grow: 1;
}

.current-track-details h2 {
  margin: 0 0 10px 0;
  color: #fff;
}

.current-track-details p {
  margin: 5px 0;
  color: #ccc;
}

.cover-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.playlist-container {
  margin: 30px 0;
}

.track-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.track-card {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: fit-content;
}

.track-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.track-card.active-track {
  background: rgba(255, 255, 255, 0.2);
  border-left: 3px solid #00dbde;
}

.track-cover {
  margin-bottom: 15px;
}

.track-cover .cover-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 6px;
}

.track-info {
  flex-grow: 1;
}

.track-title {
  margin: 0 0 8px 0;
  color: #fff;
  font-size: 1.1rem;
}

.track-artist {
  margin: 5px 0;
  color: #aaa;
  font-size: 0.9rem;
}

.track-type {
  margin: 5px 0;
  color: #888;
  font-size: 0.8rem;
}

.progress-container {
  margin-top: 30px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
  position: relative;
}

.progress {
  height: 100%;
  background: linear-gradient(to right, #00dbde, #fc00ff);
  border-radius: 4px;
  transition: width 0.1s linear;
}

.time-info {
  display: flex;
  justify-content: space-between;
  color: #aaa;
  font-size: 0.9rem;
}
</style>