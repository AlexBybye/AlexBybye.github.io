import { defineStore } from 'pinia';
import { useMusicStore } from './musicStore';

export const useAudioManager = defineStore('audioManager', () => {
  let audioElement: HTMLAudioElement | null = null;
  let isInitialized = false;

  // 初始化音频元素
  const initializeAudio = () => {
    if (!audioElement) {
      audioElement = new Audio();
      audioElement.preload = 'metadata'; // 预加载元数据而不是整个文件

      // 音频加载成功时
      audioElement.onloadedmetadata = () => {
        console.log('Audio metadata loaded successfully');
        const musicStore = useMusicStore();
        if (audioElement && !isNaN(audioElement.duration)) {
          musicStore.setTotalTime(audioElement.duration);
          console.log('Total time set:', audioElement.duration);
        }
      };

      // 音频可以播放时
      audioElement.oncanplay = () => {
        console.log('Audio can play');
        const musicStore = useMusicStore();
        if (audioElement && !isNaN(audioElement.duration) && audioElement.duration > 0) {
          musicStore.setTotalTime(audioElement.duration);
          console.log('Total time updated on canplay:', audioElement.duration);
        }
      };

      // 音频加载错误时
      audioElement.onerror = (error) => {
        console.error('Audio playback error:', error);
        console.log('Failed to load audio source:', audioElement?.src);

        // 尝试下一个曲目
        const musicStore = useMusicStore();
        setTimeout(() => {
          musicStore.playNext();
        }, 1000);
      };

      // 音频结束时播放下一首
      audioElement.onended = () => {
        console.log('Audio ended, playing next');
        const musicStore = useMusicStore();
        musicStore.playNext();
      };

      // 时间更新时同步到store
      audioElement.ontimeupdate = () => {
        const musicStore = useMusicStore();
        if (audioElement) {
          musicStore.setCurrentTime(audioElement.currentTime);
          // 确保总时间也被更新
          if (!isNaN(audioElement.duration) && audioElement.duration > 0) {
            musicStore.setTotalTime(audioElement.duration);
          }
        }
      };
    }
    isInitialized = true;
  };

  // 响应音乐store的变化
  const setupWatchers = () => {
    const musicStore = useMusicStore();

    // 监听当前曲目的变化
    musicStore.$subscribe((mutation, state) => {
      const events = Array.isArray(mutation.events) ? mutation.events : [mutation.events];
      for (const event of events) {
        if ((event.key === 'currentTrackIndex') && state.tracks[state.currentTrackIndex]) {
          playCurrentTrack();
        } else if (event.key === 'isPlaying') {
          if (state.isPlaying) {
            play();
          } else {
            pause();
          }
        } else if (event.key === 'volume') {
          setVolume(state.volume);
        }
      }
    });
  };

  // 播放当前曲目
  const playCurrentTrack = () => {
    const musicStore = useMusicStore();
    if (!musicStore.currentTrack) return;

    initializeAudio();

    if (audioElement) {
      // 构建正确的音频文件路径
      const audioPath = `/music/${musicStore.currentTrack.filename}`;

      console.log('Attempting to play:', audioPath);

      // 设置音频源
      audioElement.src = audioPath;

      // 立即尝试播放，如果失败则等待canplay事件
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Autoplay prevented, waiting for user interaction:', error);
          // 如果自动播放被阻止，仍会在用户操作后正常工作
        });
      }
    }
  };

  // 播放
  const play = () => {
    if (!audioElement) initializeAudio();
    if (audioElement && audioElement.readyState >= 1) { // HAVE_METADATA
      audioElement.play().catch(error => {
        console.error('Playback failed:', error);
      });
    }
  };

  // 暂停
  const pause = () => {
    if (audioElement) {
      audioElement.pause();
    }
  };

  // 设置音量
  const setVolume = (volume: number) => {
    if (!audioElement) initializeAudio();
    if (audioElement) {
      audioElement.volume = volume / 100;
    }
  };

  // 跳转到指定百分比位置
  const seekToPercentage = (percentage: number) => {
    if (!audioElement) initializeAudio();
    if (audioElement && !isNaN(audioElement.duration)) {
      const newTime = (percentage / 100) * audioElement.duration;
      audioElement.currentTime = newTime;
    }
  };

  // 初始化音频管理器
  const init = () => {
    if (!isInitialized) {
      initializeAudio();
      setupWatchers();
    }
  };

  return {
    init,
    play,
    pause,
    setVolume,
    seekToPercentage,
    playCurrentTrack
  };
});