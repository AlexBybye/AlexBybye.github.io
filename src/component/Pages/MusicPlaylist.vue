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
        <input type="range" v-model="musicStore.volume" min="0" max="100" class="volume-slider" @change="setVolume" />
        <span class="volume-value">{{ musicStore.volume }}%</span>
      </div>

      <div class="current-track-info" v-if="musicStore.currentTrack">
        <div class="current-track-cover">
          <img :src="currentTrackCoverUrl" :alt="musicStore.currentTrack.title" @error="onImageError"
            class="cover-image" />
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
        <div v-for="(track, index) in filteredTracks" :key="getTrackKey(track, index)"
          :class="{ 'active-track': isTrackActive(track) }" @click="selectTrackByTrack(track)" class="track-card">
          <div class="track-cover">
            <img :src="getTrackCoverUrl(track)" :alt="track.title" @error="onImageError" class="cover-image" />
          </div>
          <div class="track-info">
            <h4 class="track-title">{{ track.title }}</h4>
            <p class="track-artist">{{ track.artist }}</p>
            <p class="track-type">{{ track.type }}</p>
          </div>
        </div>
      </div>
    </div>

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

const progressPercent = ref(0);
const musicStore = useMusicStore();
const audioManager = useAudioManager();

// 计算当前曲目的封面URL，确保路径正确
const currentTrackCoverUrl = computed(() => {
  if (!musicStore.currentTrack) return '/images/background_1.png';
  return getAssetUrl(musicStore.currentTrack.coverImage, 'music');
});

// 辅助函数：构建资源URL
const getAssetUrl = (filename, type) => {
  // 如果已经是完整路径，直接返回
  if (filename.startsWith('/') || filename.startsWith('http')) {
    return filename;
  }

  // 根据类型构建路径
  if (type === 'music') {
    return `/music/${filename}`;
  } else if (type === 'images') {
    return `/images/${filename}`;
  }

  return filename;
};

// 获取曲目封面URL
const getTrackCoverUrl = (track) => {
  return getAssetUrl(track.coverImage, 'music');
};

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
  // 只有在tracks为空时才加载音乐，避免重复加载
  if (musicStore.tracks.length === 0) {
    await musicStore.loadTracks();
  }

  // 初始化音频管理器
  audioManager.init();

  if (musicStore.tracks.length > 0 && !musicStore.currentTrack) {
    // 如果没有当前曲目，设置第一个为当前曲目
    musicStore.playTrack(0);
  }

  await nextTick();
});
</script>

<style scoped>
.music-playlist-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  color: white;
}

h1 {
  text-align: center;
  margin-bottom: 10px;
  font-size: 2.5em;
  background: linear-gradient(45deg, #ff7e5f, #feb47b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.playlist-controls {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  justify-content: center;
}

.control-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.volume-slider {
  width: 150px;
  height: 5px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  border: none;
}

.volume-value {
  min-width: 40px;
  text-align: center;
}

.current-track-info {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.current-track-cover {
  flex-shrink: 0;
}

.cover-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.current-track-details h2 {
  margin: 0 0 5px 0;
  font-size: 1.4em;
}

.current-track-details p {
  margin: 3px 0;
  opacity: 0.8;
}

.track-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.track-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.track-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.track-card.active-track {
  background: rgba(100, 150, 255, 0.3);
  border-color: rgba(100, 150, 255, 0.5);
}

.track-cover {
  margin-bottom: 10px;
}

.track-cover img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.track-info {
  text-align: left;
}

.track-title {
  margin: 0 0 5px 0;
  font-size: 1.1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist,
.track-type {
  margin: 3px 0;
  font-size: 0.9em;
  opacity: 0.7;
}

.progress-container {
  margin-top: 20px;
}

.progress-bar {
  width: 100%;
  height: 5px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  cursor: pointer;
  position: relative;
  margin-bottom: 5px;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #ff7e5f, #feb47b);
  border-radius: 5px;
  transition: width 0.1s linear;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  opacity: 0.8;
}
</style>