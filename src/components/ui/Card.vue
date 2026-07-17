<template>
  <component :is="as" class="ui-card">
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ as?: string }>(), { as: 'div' })
</script>

<style scoped lang="less">
@import '../../styles/mixins.less';

.ui-card {
  .card-surface();
  padding: clamp(1.25rem, 3vw, 2rem);
}
</style>
