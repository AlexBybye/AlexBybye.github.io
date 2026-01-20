import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface Track {
    title: string;
    artist: string;
    type: string;
    filename: string;
    coverImage: string;
    duration: number;
}

export const useMusicStore = defineStore('music', () => {
    // 当前播放列表
    const tracks = ref<Track[]>([]);
    // 当前播放的曲目索引
    const currentTrackIndex = ref<number>(0);
    // 是否正在播放
    const isPlaying = ref<boolean>(false);
    // 当前音量
    const volume = ref<number>(70);
    // 播放进度
    const currentTime = ref<number>(0);
    const totalTime = ref<number>(0);
    // 播放模式
    const playMode = ref<'order' | 'shuffle' | 'repeat'>('order');
    // 活跃的筛选类型
    const selectedType = ref<string | null>(null);

    // 当前播放的曲目
    const currentTrack = computed(() => {
        if (tracks.value.length > 0 && currentTrackIndex.value >= 0) {
            return tracks.value[currentTrackIndex.value];
        }
        return null;
    });

    // 加载播放列表
    const loadTracks = async () => {
        try {
            const response = await fetch('/music/musiccontext.json');
            const data = await response.json();
            tracks.value = data.tracks || [];
            if (tracks.value.length > 0) {
                currentTrackIndex.value = 0;
            }
        } catch (error) {
            console.error('Failed to load music context:', error);
            // 使用默认数据作为后备
            tracks.value = [
                {
                    title: "Sample Song 1",
                    artist: "Artist 1",
                    type: "Pop",
                    filename: "sample1.mp3",
                    coverImage: "img/sample1.jpg",
                    duration: 240
                },
                {
                    title: "Sample Song 2",
                    artist: "Artist 2",
                    type: "Rock",
                    filename: "sample2.mp3",
                    coverImage: "img/sample2.jpg",
                    duration: 180
                },
                {
                    title: "Sample Song 3",
                    artist: "Artist 3",
                    type: "Jazz",
                    filename: "sample3.mp3",
                    coverImage: "img/sample3.jpg",
                    duration: 300
                }
            ];
            if (tracks.value.length > 0) {
                currentTrackIndex.value = 0;
            }
        }
    };

    // 播放指定索引的曲目
    const playTrack = (index: number) => {
        if (index >= 0 && index < tracks.value.length) {
            currentTrackIndex.value = index;
            isPlaying.value = true;
        }
    };

    // 播放/暂停切换
    const togglePlay = () => {
        isPlaying.value = !isPlaying.value;
    };

    // 播放下一首
    const playNext = () => {
        if (tracks.value.length === 0) return;

        if (playMode.value === 'shuffle') {
            // 随机播放
            currentTrackIndex.value = Math.floor(Math.random() * tracks.value.length);
        } else if (playMode.value === 'repeat') {
            // 单曲循环，保持当前索引
        } else {
            // 顺序播放
            currentTrackIndex.value = (currentTrackIndex.value + 1) % tracks.value.length;
        }

        isPlaying.value = true;
    };

    // 播放上一首
    const playPrevious = () => {
        if (tracks.value.length === 0) return;

        if (currentTrackIndex.value === 0) {
            currentTrackIndex.value = tracks.value.length - 1;
        } else {
            currentTrackIndex.value--;
        }

        isPlaying.value = true;
    };

    // 设置音量
    const setVolume = (vol: number) => {
        volume.value = vol;
    };

    // 设置播放进度
    const setCurrentTime = (time: number) => {
        currentTime.value = time;
    };

    // 设置总时长
    const setTotalTime = (time: number) => {
        totalTime.value = time;
    };

    // 设置播放模式
    const setPlayMode = (mode: 'order' | 'shuffle' | 'repeat') => {
        playMode.value = mode;
    };

    // 按类型筛选
    const filterByType = (type: string | null) => {
        selectedType.value = type;
    };

    // 获取过滤后的曲目列表
    const getFilteredTracks = (): Track[] => {
        if (!selectedType.value) return tracks.value;
        return tracks.value.filter(track => track.type === selectedType.value);
    };

    // 获取所有音乐类型
    const getMusicTypes = (): { name: string; count: number }[] => {
        const typeCounts: Record<string, number> = {};
        tracks.value.forEach(track => {
            typeCounts[track.type] = (typeCounts[track.type] || 0) + 1;
        });

        return Object.entries(typeCounts).map(([name, count]) => ({
            name,
            count
        }));
    };

    return {
        tracks,
        currentTrackIndex,
        currentTrack,
        isPlaying,
        volume,
        currentTime,
        totalTime,
        playMode,
        selectedType,
        loadTracks,
        playTrack,
        togglePlay,
        playNext,
        playPrevious,
        setVolume,
        setCurrentTime,
        setTotalTime,
        setPlayMode,
        filterByType,
        getFilteredTracks,
        getMusicTypes
    };
});