<template>
  <span class="view-count">
    <span class="view-count-label">{{ label }}</span>
    <FlipCounter :value="value" compact />
  </span>
</template>

<script setup lang="ts">
import FlipCounter from '@/components/ui/FlipCounter.vue'

defineProps<{
  label: string
  value: number | string | null | undefined
}>()
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.view-count { display: inline-flex; width: fit-content; align-items: center; gap: .4rem; color: @text-muted; white-space: nowrap; vertical-align: middle; }
.view-count-label { font-size: .72rem; }
</style>
