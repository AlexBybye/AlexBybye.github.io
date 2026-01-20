"use strict";
/// <reference types="D:/Vue_trial/PersonalWeb/PersonalWeb/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var canvas_confetti_1 = require("canvas-confetti");
var vue_router_1 = require("vue-router");
var router = (0, vue_router_1.useRouter)();
var goToAnimation3 = function () {
    router.push('/animation3');
};
var canvas = (0, vue_1.ref)(null);
var myConfetti = null;
var confettiInterval = null;
(0, vue_1.onMounted)(function () {
    if (canvas.value) {
        myConfetti = canvas_confetti_1.default.create(canvas.value, {
            resize: true,
            useWorker: true
        });
        confettiInterval = setInterval(function () {
            myConfetti({
                particleCount: 50, // 每次喷射的彩带数量增加
                spread: 50, // 集中发射
                origin: { y: 0, x: Math.random() }, // 从顶部随机水平位置开始
                angle: 100 * Math.random(), // 朝下发射
                startVelocity: 30, // 初始速度
                scalar: 1.2, // 粒子大小
                drift: 0,
                decayNumber: 0.7,
                gravity: 0.8, // 无横向漂移
                ticks: 1000, // 粒子生命周期（较长）
                colors: ['#bb0000', '#ffffff', '#00bb00', '#0000bb', '#ffff00']
            });
        }, 100); // 缩短间隔，使喷射更频繁
    }
});
// 🪝 options参数说明
// 该参数是一个可选对象，它具有以下属性：confetti options
// particleCount Integer （默认值： 50）：要启动的五彩纸屑的数量。越多越有趣…但要酷一点，这涉及到很多数学。
// angle Number （default ： 90）：发射五彩纸屑的角度，以度为单位。90 是笔直向上的。
// spread Number （default： 45）：五彩纸屑可以偏离中心多远，以度为单位。45 表示五彩纸屑将在定义的正负 22.5 度处发射。angle
// startVelocity 数字 （默认值：45）：五彩纸屑开始移动的速度，以像素为单位。
// decay Number （default： 0.9）：五彩纸屑失去速度的速度。将此数字保持在 0 到 1 之间，否则五彩纸屑会加速。更好的是，永远不要改变它。
// gravity Number （default： 1）：粒子下拉的速度。1 是全重力，0.5 是半重力，依此类推，但没有限制。如果您愿意，您甚至可以使粒子上升。
// drift Number （default： 0）：五彩纸屑将漂移到一侧的程度。默认值为 0，这意味着它们将直接下降。对 left 使用负数，对 right 使用正数。
// flat 布尔值 （默认值： false）：（可选）关闭三维五彩纸屑在现实世界中会具有的倾斜和摆动。是的，他们看起来有点难过，但你们都要求他们，所以不要怪我。
// ticks Number （default： 200）：五彩纸屑移动的次数。这是抽象的…但是，如果五彩纸屑对您来说消失得太快，请玩弄它。
// origin Object：从何处开始发射五彩纸屑。如果您愿意，请随时在屏幕外启动。
// origin.x 数字 （默认值：0.5）：页面上的位置，分别是左边缘和右边缘。x01
// origin.y 数字 （默认值：0.5）：页面上的位置，上边缘和下边缘。y01
// colors Array：颜色字符串数组，十六进制格式…你知道的，比如 .#bada55
// shapes 数组<字符串|Shape>：五彩纸屑的形状数组。有 、 和 的 3 个内置值。默认设置是在均匀混合中同时使用正方形和圆形。要使用单个形状，您可以在数组中只提供一个形状，例如 .您还可以通过提供一个值来更改组合，例如使用两个第三个圆和一个第三个正方形。您还可以使用 confetti.- - shapeFromPath 或 confetti.shapeFromText 帮助程序方法创建自己的形状。squarecirclestar[‘star’][‘circle’, ‘circle’, ‘square’]
// scalar Number （default ： 1）：每个五彩纸屑粒子的缩放因子。使用小数点使五彩纸屑更小。继续，试试微小的五彩纸屑，它们很可爱！
// zIndex Integer （default： 100）：毕竟，五彩纸屑应该在上面。但是如果你有一个疯狂的高页，你可以把它设置得更高。
// disableForReducedMotion 布尔值 （默认值： false）：为喜欢减少运动的用户完全禁用五彩纸屑。在这种情况下，承诺将立即解决
(0, vue_1.onUnmounted)(function () {
    if (confettiInterval) {
        clearInterval(confettiInterval);
    }
    if (myConfetti && typeof myConfetti.reset === 'function') {
        myConfetti.reset();
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_elements;
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['butt']} */ ;
/** @type {__VLS_StyleScopedClasses['butt']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)(__assign({ class: "animation-container" }));
__VLS_asFunctionalElement(__VLS_elements.img)(__assign({ src: "/images/GOAL.png", alt: "Background Image" }, { class: "background-image breathing-effect" }));
__VLS_asFunctionalElement(__VLS_elements.canvas, __VLS_elements.canvas)(__assign({ ref: "canvas" }, { class: "confetti-canvas" }));
/** @type {typeof __VLS_ctx.canvas} */ ;
// @ts-ignore
[canvas,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)(__assign({ class: "box" }));
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)(__assign({ onClick: (__VLS_ctx.goToAnimation3) }, { class: "butt" }));
// @ts-ignore
[goToAnimation3,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)(__assign({ class: "button_icon" }));
/** @type {__VLS_StyleScopedClasses['animation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['background-image']} */ ;
/** @type {__VLS_StyleScopedClasses['breathing-effect']} */ ;
/** @type {__VLS_StyleScopedClasses['confetti-canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['box']} */ ;
/** @type {__VLS_StyleScopedClasses['butt']} */ ;
/** @type {__VLS_StyleScopedClasses['button_icon']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () { return ({
        goToAnimation3: goToAnimation3,
        canvas: canvas,
    }); },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
