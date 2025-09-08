<template>
  <div id="app-background">
    <router-view />

    <div class="breathing-text-container">
      <h1 class="breathing-text">SHOT ON THE TARGET</h1>
    </div>
     <button class="football-click-area" @click="goToAnimation2"></button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToAnimation2 = () => {
  router.push('/animation2'); // 确保 '/animation2' 是你在路由中定义的路径
};
</script>

<style>
#app-background {
  background-image: url('/images/background_1.png'); 
  background-size: cover; /* 确保图片覆盖整个容器 */
  background-position: center; /* 图片居中显示 */
  background-repeat: no-repeat; /* 不重复背景图 */
  min-height: 100vh; /* 确保背景覆盖整个视口高度 */
  width: 100vw; /* 确保背景覆盖整个视口宽度 */
  position: relative; /* 用于文字定位 */
  display: flex; /* 让文字居中 */
  flex-direction: column; /* 垂直排列 */
  justify-content: flex-start; /* 文字位于顶部 */
  align-items: center; /* 水平居中文字 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 其他全局样式，例如重置默认边距 */
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden; /* 防止出现水平滚动条 */
}
</style>

<style scoped>
/* 呼吸效果文字的容器 */
.breathing-text-container {
  position: absolute;
  top: 5%; /* 调整文字与顶部的距离 */
  left: 50%;
  transform: translateX(-50%); /* 水平居中 */
  width: 100%;
  text-align: center;
}

/* 呼吸效果文字的样式 */
.breathing-text {
  font-size: clamp(2rem, 8vw, 6rem); /* 响应式字体大小 */
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0;
  padding: 0;
  
  /* 橙色渐变 */
  background: linear-gradient(to right, #ff8c00, #ff4500); /* 从深橙到亮橙的渐变 */
  -webkit-background-clip: text; /* 剪切背景以适应文本形状 */
  -webkit-text-fill-color: transparent; /* 使文本颜色透明，只显示背景 */
  
  /* 呼吸动画 */
  animation: breathe 2s infinite alternate; /* 2秒动画，无限循环，交替方向 */
}

@keyframes breathe {
  0% {
    opacity: 0.7; /* 初始透明度 */
    transform: scale(1);
  }
  100% {
    opacity: 1; /* 最终透明度 */
    transform: scale(1.05); /* 稍微放大 */
  }
}
.football-click-area {
  position: absolute; /* 绝对定位 */
  bottom: 0; /* 放在底部 */
  left: 50%; /* 水平居中 */
  transform: translateX(-50%); /* 精确居中 */
  width: 20%; /* 调整按钮的宽度，使其覆盖足球区域 */
  height: 200px; /* 调整按钮的高度，使其覆盖足球区域 */
  background-color: rgba(255, 0, 0, 0.0); /* 完全透明，不显示按钮本身 */
  cursor: pointer; /* 鼠标悬停时显示为手型 */
  z-index: 3; /* 确保按钮在背景图和文字上方，可点击 */
  border: none; /* 移除按钮默认边框 */
  outline: none; /* 移除点击时的轮廓 */
}

</style>