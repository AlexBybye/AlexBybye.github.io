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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var bannerContainer = (0, vue_1.ref)(null);
var bannerWrapper = (0, vue_1.ref)(null);
var animationFrameId = null;
var isPaused = false;
var imgWidth = 0; // 存储图片宽度
// 鼠标悬停暂停
var pauseAnimation = function () { isPaused = true; };
var resumeAnimation = function () { isPaused = false; };
// 填充图片到足够长度，实现无缝滚动
var fillBannerImages = function () {
    if (!bannerContainer.value || !bannerWrapper.value)
        return;
    var container = bannerContainer.value;
    var wrapper = bannerWrapper.value;
    var img = wrapper.querySelector('.original-img');
    // 确保图片加载完成
    var loadImage = function () {
        imgWidth = img.offsetWidth;
        var containerWidth = container.offsetWidth;
        // 计算需要的图片数量，确保至少是容器宽度的2倍
        var needCount = Math.ceil((containerWidth * 2) / imgWidth) + 1;
        // 先清空已有的克隆元素（保留原始元素）
        var existingClones = wrapper.querySelectorAll('.clone-img');
        existingClones.forEach(function (clone) { return clone.remove(); });
        // 添加足够的克隆元素
        for (var i = 0; i < needCount; i++) {
            var clone = img.cloneNode(true);
            clone.classList.remove('original-img');
            clone.classList.add('clone-img');
            wrapper.appendChild(clone);
        }
        // 确保DOM更新后再开始动画
        (0, vue_1.nextTick)(function () {
            startBannerAnimation();
        });
    };
    if (!img.complete) {
        img.onload = loadImage;
    }
    else {
        loadImage();
    }
};
// 启动滚动动画
var startBannerAnimation = function () {
    if (!bannerWrapper.value || imgWidth === 0)
        return;
    var wrapper = bannerWrapper.value;
    var translateX = 0;
    // 清除可能存在的旧动画
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    var animate = function () {
        if (!isPaused) {
            translateX -= 0.25; // 滚动速度
            // 当滚动距离达到一张图片宽度时，重置位置，实现无缝滚动
            if (Math.abs(translateX) >= imgWidth) {
                translateX += imgWidth; // 不是重置为0，而是向前移动一张图片的宽度
            }
            wrapper.style.transform = "translateX(".concat(translateX, "px)");
        }
        animationFrameId = requestAnimationFrame(animate);
    };
    animate();
};
// 窗口大小改变时重新计算
var handleResize = function () {
    // 暂停当前动画
    var wasPaused = isPaused;
    isPaused = true;
    // 重新填充图片并重启动画
    (0, vue_1.nextTick)(function () {
        fillBannerImages();
        isPaused = wasPaused;
    });
};
(0, vue_1.onMounted)(function () {
    var _a, _b;
    fillBannerImages();
    // 添加事件监听
    (_a = bannerContainer.value) === null || _a === void 0 ? void 0 : _a.addEventListener('mouseenter', pauseAnimation);
    (_b = bannerContainer.value) === null || _b === void 0 ? void 0 : _b.addEventListener('mouseleave', resumeAnimation);
    window.addEventListener('resize', handleResize);
});
(0, vue_1.onBeforeUnmount)(function () {
    var _a, _b;
    cancelAnimationFrame(animationFrameId);
    (_a = bannerContainer.value) === null || _a === void 0 ? void 0 : _a.removeEventListener('mouseenter', pauseAnimation);
    (_b = bannerContainer.value) === null || _b === void 0 ? void 0 : _b.removeEventListener('mouseleave', resumeAnimation);
    window.removeEventListener('resize', handleResize);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_elements;
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-banner-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-bar']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)(__assign({ class: "animation3-container" }));
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)(__assign({ class: "header-section" }));
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)(__assign({ class: "scroll-banner-container" }, { ref: "bannerContainer" }));
/** @type {typeof __VLS_ctx.bannerContainer} */ ;
// @ts-ignore
[bannerContainer,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)(__assign({ class: "scroll-banner-wrapper" }, { ref: "bannerWrapper" }));
/** @type {typeof __VLS_ctx.bannerWrapper} */ ;
// @ts-ignore
[bannerWrapper,];
__VLS_asFunctionalElement(__VLS_elements.img)(__assign({ src: "/images/rolling.png", alt: "banner" }, { class: "original-img" }));
__VLS_asFunctionalElement(__VLS_elements.nav, __VLS_elements.nav)(__assign({ class: "nav-bar" }));
__VLS_asFunctionalElement(__VLS_elements.ul, __VLS_elements.ul)({});
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$router.push('/about');
        // @ts-ignore
        [$router,];
    } }));
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$router.push('/knowledge');
        // @ts-ignore
        [$router,];
    } }));
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$router.push('/music');
        // @ts-ignore
        [$router,];
    } }));
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$router.push('/album');
        // @ts-ignore
        [$router,];
    } }));
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)(__assign({ class: "header-bg" }));
__VLS_asFunctionalElement(__VLS_elements.img)({
    src: "/images/background_2.jpg",
    alt: "Background",
});
__VLS_asFunctionalElement(__VLS_elements.main, __VLS_elements.main)(__assign({ class: "content-section" }));
var __VLS_0 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
RouterView;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['animation3-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header-section']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-banner-container']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-banner-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['original-img']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['header-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['content-section']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () { return ({
        bannerContainer: bannerContainer,
        bannerWrapper: bannerWrapper,
    }); },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
