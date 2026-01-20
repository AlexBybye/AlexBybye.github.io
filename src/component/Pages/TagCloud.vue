<template>
  <div class="tag-cloud-container">
    <div class="tag-cloud" ref="tagCloudRef">
      <span v-for="(tag, index) in tags" :key="index" class="tag-item" :style="getTagStyle(index)"
        @click="handleTagClick(tag.name)" @mouseenter="handleMouseEnter(index)" @mouseleave="handleMouseLeave(index)">
        {{ tag.name }} ({{ tag.count }})
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { CSSProperties } from 'vue';

interface Tag {
  name: string;
  count: number;
}

const props = defineProps<{
  tags: Tag[];
}>();

const emit = defineEmits(['tag-click']);

const tagCloudRef = ref<HTMLElement | null>(null);
let animationFrameId: number | null = null;

// 存储标签的状态
interface TagState {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  originalColor: string;
  isHovered: boolean;
}

// 初始化标签状态
const tagStates = ref<TagState[]>([]);

// 生成稳定的HSL颜色
const generateColor = (index: number, count: number): string => {
  // 基于标签名称和数量生成相对稳定但略有变化的颜色
  const hue = (index * 137.508) % 360; // 使用黄金角度避免相似颜色
  const saturation = 60 + (count % 40); // 基于计数调整饱和度
  const lightness = 50 + (index % 30);  // 基于索引调整亮度
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// 为每个标签生成初始状态
const initPositions = () => {
  if (!props.tags.length) {
    tagStates.value = [];
    return;
  }

  // 为了更好地分散标签，我们根据容器尺寸分配位置
  const container = tagCloudRef.value;
  const containerWidth = container?.clientWidth || 100;
  const containerHeight = container?.clientHeight || 100;

  tagStates.value = props.tags.map((tag, index) => ({
    x: Math.random() * 80 + 10, // 避免贴边
    y: Math.random() * 80 + 10,
    dx: (Math.random() - 0.5) * 0.5, // 稍微增加速度
    dy: (Math.random() - 0.5) * 0.5,
    color: generateColor(index, tag.count), // 生成稳定颜色
    originalColor: generateColor(index, tag.count), // 保存原始颜色
    isHovered: false // 是否处于悬停状态
  }));
};

// 获取标签样式
const getTagStyle = (index: number): CSSProperties => {
  if (index < tagStates.value.length) {
    const state = tagStates.value[index];
    return {
      position: 'absolute',
      left: `${state.x}%`,
      top: `${state.y}%`,
      fontSize: `${0.8 + (props.tags[index].count / 10)}rem`,
      opacity: state.isHovered ? 1 : (0.7 + (props.tags[index].count / 30)),
      color: state.color,
      padding: '5px 10px',
      borderRadius: '15px',
      background: state.isHovered ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: state.isHovered ? '1px solid rgba(255, 255, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: state.isHovered
        ? '0 8px 25px rgba(0, 0, 0, 0.2), 0 4px 15px rgba(255, 255, 255, 0.3)'
        : '0 4px 10px rgba(0, 0, 0, 0.1), 0 2px 5px rgba(255, 255, 255, 0.1)',
      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // 添加更平滑的过渡效果
      transform: `translate(-50%, -50%) scale(${state.isHovered ? 1.1 : 1})`, // 悬停时轻微放大
      cursor: 'pointer', // 鼠标悬停样式
      zIndex: state.isHovered ? 10 : 1, // 悬停时层级更高
      whiteSpace: 'nowrap', // 防止文本换行
      fontWeight: state.isHovered ? 'bold' : 'normal', // 悬停时字体加粗
      textShadow: state.isHovered ? '0 0 8px rgba(255, 255, 255, 0.5)' : 'none' // 悬停时文字阴影
    } as CSSProperties;
  }
  return {};
};

// 处理标签点击
const handleTagClick = (tagName: string) => {
  emit('tag-click', tagName);
};

// 处理鼠标悬停
const handleMouseEnter = (index: number) => {
  if (index < tagStates.value.length) {
    tagStates.value[index].isHovered = true;
    // 悬停时改变颜色为更亮的颜色
    tagStates.value[index].color = 'rgba(255, 255, 255, 0.9)';
  }
};

// 处理鼠标离开
const handleMouseLeave = (index: number) => {
  if (index < tagStates.value.length) {
    tagStates.value[index].isHovered = false;
    // 恢复原始颜色
    tagStates.value[index].color = tagStates.value[index].originalColor;
  }
};

// 动画循环
const animate = () => {
  if (tagStates.value.length === 0) return;

  tagStates.value = tagStates.value.map(state => {
    let newX = state.x + state.dx;
    let newY = state.y + state.dy;

    // 边界检测和反弹 - 使用固定范围
    if (newX > 90 || newX < 10) {
      state.dx *= -1;
      newX = newX > 90 ? 90 : 10;
    }
    if (newY > 90 || newY < 10) {
      state.dy *= -1;
      newY = newY > 90 ? 90 : 10;
    }

    return { ...state, x: newX, y: newY };
  });

  animationFrameId = requestAnimationFrame(animate);
};

onMounted(() => {
  // 初始设置
  initPositions();

  // 延迟启动动画，确保DOM完全渲染
  setTimeout(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(animate);
  }, 100);
});

// 当标签数组发生变化时重新初始化
watch(() => props.tags, () => {
  initPositions();
}, { deep: true });

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.tag-cloud-container {
  width: 100%;
  height: 200px;
  margin: 20px 0;
  position: relative;
  overflow: hidden;
  border-radius: 15px;
  /* 增加圆角 */
  background: rgba(255, 255, 255, 0.6);
  /* 0.6透明度的白色背景 */
  backdrop-filter: blur(10px);
  /* 增加模糊效果 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  /* 添加阴影效果 */
}

.tag-cloud-container:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  /* 悬停时增强阴影 */
}

.tag-cloud {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>