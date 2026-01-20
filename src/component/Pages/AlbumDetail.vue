<template>
    <div class="album-detail-view">
        <div class="bg-grid"></div>

        <div class="header">
            <button class="back-button" @click="$router.push('/animation3/album')">← RETURN</button>
            <h2 class="album-title-glow">{{ albumTitle }}</h2>
        </div>

        <div class="physics-container" ref="boundary">
            <div v-for="(item, index) in photoItems" :key="item.id" class="glass-frame"
                :class="{ 'is-visible': item.loaded }" :style="{
                    transform: `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.rotation}deg)`,
                    width: item.width + 'px',
                    zIndex: item.paused ? 100 : 1,
                    transitionDelay: item.delay + 's' // 应用延迟
                }" @mouseenter="item.paused = true" @mouseleave="item.paused = false">
                <img :src="item.src" @load="item.loaded = true" @error="handleImgError(item, $event)" />
                <div class="glass-shine"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps(['id']);
const boundary = ref<HTMLElement | null>(null);
const albumTitle = ref('');
const photoItems = ref<any[]>([]);
let animationFrame: number;

const initPhysics = async () => {
    try {
        const res = await fetch('/album/albumcontext.json');
        const albums = await res.json();
        const current = albums.find((a: any) => a.id === props.id);
        if (!current) return;
        albumTitle.value = current.title;

        // --- 优化点：网格化分布逻辑 ---
        const cols = Math.ceil(Math.sqrt(current.count)); // 计算网格列数
        const rows = Math.ceil(current.count / cols);    // 计算网格行数
        const cellW = window.innerWidth / cols;          // 格子宽度
        const cellH = window.innerHeight / rows;         // 格子高度

        photoItems.value = Array.from({ length: current.count }, (_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            return {
                id: i + 1,
                src: `/album/${props.id}/photo_${i + 1}.jpg`,
                // 初始位置设定在网格中心加上随机偏移，彻底解决“团在一起”
                x: col * cellW + (Math.random() * (cellW - 250)),
                y: row * cellH + (Math.random() * (cellH - 200)),
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                rotation: (Math.random() - 0.5) * 20,
                width: 220 + Math.random() * 60,
                paused: false,
                loaded: false,
                delay: i * 0.1 // --- 优化点：增加出现延迟时间 ---
            };
        });

        animate();
    } catch (e) { console.error(e); }
};

// 格式自动容错：.jpg 不存在则尝试 .png，都失败则移除该框
const handleImgError = (item: any, e: Event) => {
    const img = e.target as HTMLImageElement;
    if (img.src.endsWith('.jpg')) {
        item.src = item.src.replace('.jpg', '.png');
    } else {
        // 彻底失败则从数组中移除，防止出现空框
        photoItems.value = photoItems.value.filter(p => p.id !== item.id);
    }
};

const animate = () => {
    if (!boundary.value) return;

    const bRect = boundary.value.getBoundingClientRect();

    photoItems.value.forEach(item => {
        if (item.paused) return;

        // 更新坐标
        item.x += item.vx;
        item.y += item.vy;

        // 增加微弱的摆动旋转感
        item.rotation += Math.sin(Date.now() / 2000) * 0.02;

        const itemHeight = item.width * 0.7; // 预估比例

        // 边界反弹逻辑
        if (item.x <= 0 || item.x + item.width >= bRect.width) {
            item.vx *= -1;
            item.x = item.x <= 0 ? 0 : bRect.width - item.width;
        }
        if (item.y <= 0 || item.y + itemHeight >= bRect.height) {
            item.vy *= -1;
            item.y = item.y <= 0 ? 0 : bRect.height - itemHeight;
        }
    });

    animationFrame = requestAnimationFrame(animate);
};

onMounted(initPhysics);
onUnmounted(() => cancelAnimationFrame(animationFrame));
</script>

<style scoped>
.album-detail-view {
    width: 100%;
    height: 100vh;
    background: radial-gradient(circle at center, #23263a 0%, #050507 100%);
    overflow: hidden;
    position: relative;
}

/* 装饰性网格背景 */
.bg-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
}

.header {
    position: absolute;
    top: 30px;
    left: 40px;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 30px;
}

.back-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 8px 16px;
    cursor: pointer;
    backdrop-filter: blur(5px);
    transition: all 0.3s;
}

.back-button:hover {
    background: rgba(255, 255, 255, 0.2);
}

.album-title-glow {
    color: white;
    font-family: 'Inter', sans-serif;
    letter-spacing: 5px;
    text-transform: uppercase;
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
    margin: 0;
}

.physics-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.glass-frame {
    position: absolute;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    border-radius: 4px;

    /* 初始状态：缩小且透明 */
    opacity: 0;
    scale: 0.8;

    /* 只有 opacity 和 scale 使用 transition，transform(位移) 由 requestAnimationFrame 处理 */
    transition: opacity 1s ease-out, scale 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    will-change: transform, opacity;
}

/* 显现状态 */
.glass-frame.is-visible {
    opacity: 1;
    scale: 1;
}

.glass-frame img {
    width: 100%;
    display: block;
    border-radius: 2px;
    pointer-events: none;
}

/* 玻璃反光特效 */
.glass-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.15) 0%,
            transparent 50%,
            rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
}

.frame-border {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255, 255, 255, 0.05);
    pointer-events: none;
}
</style>