<template>
    <div class="animation-container">
        <div class="goal-background">
            <img src="/images/GOAL.png" alt="GOAL" class="goal-image" />
        </div>
        <!-- 背景装饰 -->
        <div class="background-overlay"></div>

        <!-- 动态背景图像 -->
        <div class="floating-elements">
            <div class="floating-element element-1"></div>
            <div class="floating-element element-2"></div>
            <div class="floating-element element-3"></div>
        </div>

        <!-- 彩带Canvas -->
        <canvas ref="canvas" class="confetti-canvas"></canvas>

        <!-- 内容区域 -->
        <div class="content-wrapper">
            <div class="welcome-card">
                <h1 class="welcome-title">Welcome!</h1>
                <p class="welcome-subtitle">To My Personal Website</p>
                <div class="continue-indicator">→ Click below to continue →</div>
            </div>

            <!-- 继续按钮 -->
            <div class="continue-button" @click="goToAnimation3">
                <div class="button-content">
                    <span class="button-text">Enter Site</span>
                    <div class="arrow-icon">→</div>
                </div>
                <div class="button-glow"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import confetti from 'canvas-confetti'
import { useRouter } from 'vue-router';

const router = useRouter();
const canvas = ref(null)
let myConfetti = null
let confettiInterval = null

const goToAnimation3 = () => {
    router.push('/animation3');
};

onMounted(() => {
    if (canvas.value) {
        myConfetti = confetti.create(canvas.value, {
            resize: true,
            useWorker: true
        })

        confettiInterval = setInterval(() => {
            myConfetti({
                particleCount: 10,       // 每次喷射的彩带数量增加
                spread: 50,                // 集中发射
                origin: { y: 0, x: Math.random() }, // 从顶部随机水平位置开始
                angle: 100 * Math.random(),                // 朝下发射
                startVelocity: 30,        // 初始速度
                scalar: 1.2,              // 粒子大小
                drift: 0,
                decayNumber: 0.7,
                gravity: 0.9,                 // 无横向漂移
                ticks: 700,              // 粒子生命周期（较长）
                colors: ['#bb0000', '#ffffff', '#00bb00', '#0000bb', '#ffff00']
            })
        }, 100) // 缩短间隔，使喷射更频繁
    }
})

onUnmounted(() => {
    if (confettiInterval) {
        clearInterval(confettiInterval)
    }
    if (myConfetti && typeof myConfetti.reset === 'function') {
        myConfetti.reset()
    }
})
</script>

<style scoped>
.animation-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
    display: flex;
    justify-content: center;
    align-items: center;
}

.background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
    z-index: 1;
}

.floating-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
}

.floating-element {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent 70%);
    opacity: 0.3;
}

.element-1 {
    width: 300px;
    height: 300px;
    top: 10%;
    left: 15%;
    animation: float 15s ease-in-out infinite;
}

.element-2 {
    width: 200px;
    height: 200px;
    bottom: 20%;
    right: 10%;
    animation: float 12s ease-in-out infinite reverse;
}

.element-3 {
    width: 150px;
    height: 150px;
    top: 40%;
    right: 20%;
    animation: float 10s ease-in-out infinite;
}

@keyframes float {

    0%,
    100% {
        transform: translate(0, 0);
    }

    25% {
        transform: translate(-30px, -30px);
    }

    50% {
        transform: translate(0, -60px);
    }

    75% {
        transform: translate(30px, -30px);
    }
}

.confetti-canvas {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    width: 100vw;
    height: 100vh;
    z-index: 3;
}

.content-wrapper {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
}

.welcome-card {
    text-align: center;
    padding: 40px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transform: translateY(0);
    transition: all 0.4s ease;
}

.welcome-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
    background: rgba(255, 255, 255, 0.08);
}

.welcome-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    margin: 0 0 10px 0;
    background: linear-gradient(45deg, #ff8c00, #ffd700);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 2px 10px rgba(255, 140, 0, 0.2);
    animation: titleGlow 3s ease-in-out infinite alternate;
}

@keyframes titleGlow {
    0% {
        text-shadow: 0 0 10px rgba(255, 140, 0, 0.3);
    }

    100% {
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 140, 0, 0.4);
    }
}

.welcome-subtitle {
    font-size: clamp(1.2rem, 2.5vw, 1.8rem);
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 20px 0;
    font-weight: 300;
}

.continue-indicator {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 2px;
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 0.6;
    }

    50% {
        opacity: 1;
    }
}

.continue-button {
    position: relative;
    width: 200px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 30px;
    background: linear-gradient(45deg, #ff8c00, #ff4500);
    overflow: hidden;
    border: none;
    box-shadow: 0 5px 15px rgba(255, 140, 0, 0.4);
    transition: all 0.3s ease;
}

.continue-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 140, 0, 0.6);
}

.continue-button:active {
    transform: translateY(1px);
}

.button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    z-index: 2;
    position: relative;
}

.button-text {
    font-size: 1.1rem;
    font-weight: bold;
    color: white;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.arrow-icon {
    font-size: 1.2rem;
    font-weight: bold;
    color: white;
    animation: arrowMove 1s infinite alternate;
}

@keyframes arrowMove {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(5px);
    }
}

.button-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.4), transparent 70%);
    transform: rotate(0deg);
    animation: rotateGlow 3s linear infinite;
    pointer-events: none;
    opacity: 0.3;
}

@keyframes rotateGlow {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* GOAL 背景容器 */
.goal-background {
    position: absolute;
    top: 45%;
    /* 稍微偏上，避开下方的 Enter 按钮 */
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70%;
    /* 宽度控制，根据你的图片比例调整 */
    max-width: 800px;
    z-index: 0;
    /* 确保在所有内容的最底层 */
    pointer-events: none;
    /* 防止图片遮挡鼠标点击事件 */
    display: flex;
    justify-content: center;
}

/* GOAL 图片本身 */
.goal-image {
    width: 100%;
    height: auto;
    opacity: 0.4;
    /* 提高了透明度，让图片更清晰 */

    /* 混合模式：让橙色与深蓝色背景融合，避免生硬的黑边 */
    mix-blend-mode: screen;

    /* 动画：让背景图轻微缩放呼吸 */
    animation: goalBreathe 4s infinite alternate ease-in-out;
}

/* 保证卡片文字清晰的关键：增强毛玻璃效果 */
.welcome-card {
    position: relative;
    z-index: 10;
    padding: 40px 60px;
    background: rgba(0, 0, 0, 0.4);
    /* 加深卡片背景色 */
    backdrop-filter: blur(2px);
    /* 增强模糊，彻底隔绝背景图对文字的干扰 */
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
}

/* 背景图呼吸动画 */
@keyframes goalBreathe {
    0% {
        transform: scale(1);
        filter: brightness(1) drop-shadow(0 0 10px rgba(255, 140, 0, 0.2));
    }

    100% {
        transform: scale(1.05);
        filter: brightness(1.3) drop-shadow(0 0 30px rgba(255, 140, 0, 0.5));
    }
}
</style>