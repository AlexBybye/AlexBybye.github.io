<template>
  <div id="app-container">
    <router-view />
  </div>
</template>

<script setup>
// App.vue 只负责承载路由视图，不需要额外的逻辑
</script>

<style>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #000;
  color: #fff;
  overflow: hidden; /* 防止页面滚动 */
}
#app-container {
  width: 100vw;
  height: 100vh;
}
</style>