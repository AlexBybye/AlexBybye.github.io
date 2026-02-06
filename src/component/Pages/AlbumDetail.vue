<template>
    <div class="album-detail-view">
        <div class="bg-grid"></div>
        <div class="physics-container" ref="boundary">
            <div class="header">
                <button class="back-button" @click="$router.push('/animation3/album')">← RETURN</button>
                <h2 class="album-title-glow">{{ albumTitle }}</h2>
                <p class="album-description" v-if="albumDescription">{{ albumDescription }}</p>
            </div>

            <div v-for="(item, index) in photoItems" :key="item.id" class="glass-frame"
                :class="{ 'is-visible': item.loaded, 'frame-hovered': item.hovered }" :style="{
                    transform: `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.rotation}deg)`,
                    width: item.width + 'px',
                    zIndex: item.hovered ? 200 : (item.selected ? 300 : 1),
                    transitionDelay: item.delay + 's'
                }" @mouseenter="handleMouseEnter(index)" @mouseleave="handleMouseLeave(index)"
                @click="selectImage(index)">
                <img :src="item.src" @load="onImageLoad(index)" @error="handleImgError(item, $event)"
                    :class="{ 'img-loaded': item.loaded }" loading="lazy" />
                <div class="glass-shine"></div>
            </div>
        </div>

        <!-- 图片查看器模态框 -->
        <div v-if="selectedImageIndex !== null" class="image-viewer-modal" @click="closeImageViewer">
            <div class="image-viewer-content" @click.stop>
                <button class="viewer-close-btn" @click="closeImageViewer">×</button>
                <div class="image-nav" @click.stop>
                    <button class="nav-btn prev" @click="prevImage">❮</button>
                    <img :src="photoItems[selectedImageIndex].src" :alt="`Photo ${selectedImageIndex + 1}`"
                        class="viewer-image" @click.stop />
                    <button class="nav-btn next" @click="nextImage">❯</button>
                </div>
                <div class="image-counter">{{ selectedImageIndex + 1 }} / {{ photoItems.length }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps(['id']);
const boundary = ref<HTMLElement | null>(null);
const albumTitle = ref('');
const albumDescription = ref('');
const photoItems = ref<any[]>([]);
let animationFrame: number;
const selectedImageIndex = ref<number | null>(null);

const initPhysics = async () => {
    try {
        const res = await fetch('./album/albumcontext.json');
        const albums = await res.json();
        const current = albums.find((a: any) => a.id === props.id);
        if (!current) return;
        albumTitle.value = current.title;
        albumDescription.value = current.description || '';

        // 计算网格尺寸，不再限制高度
        const totalPhotos = current.count;
        const aspectRatio = 1.5; // 设定宽高比
        const cols = Math.ceil(Math.sqrt(totalPhotos / aspectRatio));
        const rows = Math.ceil(totalPhotos / cols);

        // 计算每个格子的大小
        const containerWidth = window.innerWidth * 0.9; // 减少容器宽度以留出边距
        const containerHeight = window.innerHeight * 3; // 增加容器高度以避免重叠

        const cellW = containerWidth / cols;
        const cellH = containerHeight / rows;

        photoItems.value = Array.from({ length: current.count }, (_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            return {
                id: i + 1,
                src: `./album/${props.id}/photo_${i + 1}.jpg`,
                // 分布在更大的区域内
                x: col * cellW + (Math.random() * (cellW - 250)) + (window.innerWidth * 0.05),
                y: row * cellH + (Math.random() * (cellH - 200)),
                vx: (Math.random() - 0.5) * 0.3, // 减慢移动速度
                vy: (Math.random() - 0.5) * 0.3, // 减慢移动速度
                rotation: (Math.random() - 0.5) * 10, // 减小初始旋转角度
                width: 200 + Math.random() * 60, // 设置更合适的宽度范围
                selected: false,
                hovered: false,
                loaded: false,
                delay: i * 0.05
            };
        });

        animate();
    } catch (e) { console.error(e); }
};

// 图像加载完成处理
const onImageLoad = (index: number) => {
    if (index >= 0 && index < photoItems.value.length) {
        photoItems.value[index].loaded = true;
    }
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
        // 更新坐标
        item.x += item.vx;
        item.y += item.vy;

        // 增加微弱的摆动旋转感
        item.rotation += Math.sin(Date.now() / 2000) * 0.02;

        const itemHeight = item.width * 0.7; // 预估比例

        // 边界反弹逻辑
        if (item.x <= 0 || item.x + item.width >= bRect.width) {
            item.vx *= -0.9; // 反弹时减弱速度
            item.x = item.x <= 0 ? 0 : bRect.width - item.width;
        }
        if (item.y <= 0 || item.y + itemHeight >= bRect.height) {
            item.vy *= -0.9; // 反弹时减弱速度
            item.y = item.y <= 0 ? 0 : bRect.height - itemHeight;
        }
    });

    animationFrame = requestAnimationFrame(animate);
};

// 鼠标进入处理
const handleMouseEnter = (index: number) => {
    // 仅设置悬停状态，不触发其他效果
    photoItems.value[index].hovered = true;
};

// 鼠标离开处理
const handleMouseLeave = (index: number) => {
    photoItems.value[index].hovered = false;
};

// 选择图片（替代原来的openImageViewer）
const selectImage = (index: number) => {
    selectedImageIndex.value = index;
    document.body.style.overflow = 'hidden'; // 防止背景滚动
};

// 关闭图片查看器
const closeImageViewer = () => {
    selectedImageIndex.value = null;
    document.body.style.overflow = ''; // 恢复背景滚动
};

// 上一张图片
const prevImage = () => {
    if (selectedImageIndex.value !== null) {
        selectedImageIndex.value = (selectedImageIndex.value - 1 + photoItems.value.length) % photoItems.value.length;
    }
};

// 下一张图片
const nextImage = () => {
    if (selectedImageIndex.value !== null) {
        selectedImageIndex.value = (selectedImageIndex.value + 1) % photoItems.value.length;
    }
};

onMounted(initPhysics);
onUnmounted(() => {
    cancelAnimationFrame(animationFrame);
    document.body.style.overflow = ''; // 确保恢复滚动
});
</script>

<style scoped>
.album-detail-view {
    width: 100%;
    min-height: 100vh;
    /* 改为最小高度，允许内容扩展 */
    background: radial-gradient(circle at center, #23263a 0%, #050507 100%);
    overflow: hidden;
    /* 隐藏主容器滚动条，让内部容器处理滚动 */
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
    position: sticky;
    top: 0;
    left: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px 40px;
    background: rgba(5, 5, 7, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 100%;
}

.back-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 8px 16px;
    cursor: pointer;
    backdrop-filter: blur(5px);
    transition: all 0.3s;
    border-radius: 8px;
    overflow: visible;
}

/* 选中状态 */
.glass-frame.is-selected {
    z-index: 300 !important;
    /* 不改变transform，避免位置变化 */
    filter: brightness(1.2) contrast(1.1);
    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.8);
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
    min-height: 100vh;
    position: relative;
    padding-bottom: 100vh;
    overflow: visible;
    overflow-y: auto;
    /* 添加滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.physics-container::-webkit-scrollbar {
    width: 8px;
}

.physics-container::-webkit-scrollbar-track {
    background: transparent;
}

.physics-container::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
}

.glass-frame {
    position: absolute;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    /* 分离transform和opacity的过渡，避免频闪 */

    /* 初始状态：缩小且透明 */
    opacity: 0;
    scale: 0.8;

    /* 只有 opacity 和 scale 使用 transition，transform(位移) 由 requestAnimationFrame 处理 */
    transition: opacity 1s ease-out, scale 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    will-change: transform, opacity;
    pointer-events: auto;
    /* 确保元素可以接收鼠标事件 */
}

/* 显现状态 */
.glass-frame.is-visible {
    opacity: 1;
    scale: 1;
}

/* 悬停状态 - 不改变位置，只增强视觉效果 */
.glass-frame.frame-hovered {
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
    z-index: 200 !important;
    /* 不使用 transform: scale() 以避免位置变化 */
    filter: brightness(1.1);
    transition: box-shadow 0.3s ease, z-index 0.1s ease, filter 0.3s ease;
}

/* 移除:hover伪类，避免与frame-hovered冲突 */

.glass-frame img {
    width: 100%;
    display: block;
    border-radius: 2px;
    pointer-events: none;
    transition: opacity 0.2s ease;
}

/* 图片加载完成后的样式 */
.glass-frame img.img-loaded {
    opacity: 1;
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
    border-radius: 4px;
}

.frame-border {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255, 255, 255, 0.05);
    pointer-events: none;
}

/* 图片查看器模态框 */
.image-viewer-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
}

.image-viewer-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.viewer-close-btn {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 30px;
    cursor: pointer;
    z-index: 10001;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.3s;
}

.viewer-close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.image-nav {
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 24px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    margin: 0 10px;
    transition: background 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-btn:hover {
    background: rgba(255, 255, 255, 0.4);
}

.viewer-image {
    max-width: 80vw;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.image-counter {
    color: white;
    margin-top: 15px;
    font-size: 16px;
}
</style>

<style scoped>
.album-description {
    font-size: 1.2rem;
    font-weight: 300;
    margin: 10px auto;
    max-width: 80%;
    text-align: center;
    color: rgba(255, 255, 255, 0.85);
    font-style: italic;
    letter-spacing: 1px;
    line-height: 1.6;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3),
        0 0 20px rgba(255, 255, 255, 0.2),
        0 0 30px rgba(100, 150, 255, 0.1);
    animation: fadeInUp 1s ease-out;
    font-family: 'Georgia', 'Times New Roman', serif;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .album-description {
        font-size: 1rem;
        max-width: 90%;
        padding: 0 10px;
    }
}
</style>