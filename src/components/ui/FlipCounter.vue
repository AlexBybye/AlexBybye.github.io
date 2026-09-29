<template>
  <span class="flip-counter" :class="{ compact }" role="img" :aria-label="formatted">
    <FlipDigit
      v-for="(character, index) in characters"
      :key="index"
      :value="character"
      aria-hidden="true"
    />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FlipDigit from '@/components/ui/FlipDigit.vue'

const props = withDefaults(defineProps<{
  value: number | string | null | undefined
  compact?: boolean
}>(), { compact: false })

const { locale } = useI18n()
const formatted = computed(() => typeof props.value === 'number'
  ? new Intl.NumberFormat(locale.value, { useGrouping: false }).format(props.value)
  : props.value == null ? '—' : String(props.value))
const characters = computed(() => Array.from(formatted.value))
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.flip-counter { display: inline-flex; align-items: center; gap: 3px; vertical-align: middle; color: #fff; font-family: 'Geist Mono Variable', monospace; font-size: 1.45rem; font-weight: 760; font-variant-numeric: tabular-nums; line-height: 1; }
.compact { gap: 2px; font-size: .72rem; font-weight: 720; }
.compact { --digit-height: 1.42em; }
</style>
