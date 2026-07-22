<template>
  <div id="app-container">
    <LocaleSwitcher v-if="!isBlogRoute" :theme="route.path === '/Animation2' ? 'showcase' : 'landing'" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LocaleSwitcher from '@/components/ui/LocaleSwitcher.vue'

const route = useRoute()
const isBlogRoute = computed(() => route.path.startsWith('/Animation3'))
</script>
