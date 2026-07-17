<template>
  <button class="icon-button" type="button" :aria-label="label" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label: string; disabled?: boolean }>(), { disabled: false })
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.icon-button {
  display: inline-grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid @line;
  border-radius: 12px;
  background: @surface-raised;
  color: @text;
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;

  &:hover:not(:disabled) {
    border-color: @accent;
    background: @surface-soft;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}
</style>
