import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useMusicStore } from './musicStore';

export const useAudioManager = defineStore('audioManager', () => {
  // 创建一个全局音频元素
  const audioElement = new Audio();
  const isInitialized = ref(false);
  
  // 从音乐store获取状态
  const musicStore = useMusicStore();
  
  // 初始化音频管理器
  const initialize = () => {
    if (isInitialized.value) return;
    
    // 设置音频属性
    audioElement.preload = 'metadata';
    
    // 监听播放结束事件
    audioElement.addEventListener('ended', () => {
      musicStore.playNext();
    });
    
    // 监听时间更新事件
    audioElement.addEventListener('timeupdate', () => {
      musicStore.setCurrentTime(audioElement.currentTime);
    });
    
    // 监听元数据加载完成事件
    audioElement.addEventListener('loadedmetadata', () => {
      musicStore.setTotalTime(audioElement.duration);
    });
    
    isInitialized.value = true;
  };
  
  // 播放当前曲目
  const playCurrentTrack = () => {
    if (musicStore.currentTrack) {
      audioElement.src = `/music/${musicStore.currentTrack.filename}`;
      audioElement.volume = musicStore.volume / 100;
      
      if (musicStore.isPlaying) {
        audioElement.play().catch(error => {
          console.error('Error playing track:', error);
        });
      }
    }
  };
  
  // 监听音乐store的变化并相应地控制音频
  watch(() => musicStore.currentTrack, () => {
    playCurrentTrack();
  });
  
  watch(() => musicStore.isPlaying, (isPlaying) => {
    if (isPlaying) {
      audioElement.play().catch(error => {
        console.error('Error playing track:', error);
      });
    } else {
      audioElement.pause();
    }
  });
  
  watch(() => musicStore.volume, (volume) => {
    audioElement.volume = volume / 100;
  });
  
  // 跳转到指定时间
  const setCurrentTime = (time: number) => {
    audioElement.currentTime = time;
  };
  
  // 跳转到指定百分比位置
  const seekToPercentage = (percentage: number) => {
    if (musicStore.totalTime > 0) {
      audioElement.currentTime = (percentage / 100) * musicStore.totalTime;
    }
  };
  
  return {
    initialize,
    playCurrentTrack,
    setCurrentTime,
    seekToPercentage,
    audioElement
  };
});