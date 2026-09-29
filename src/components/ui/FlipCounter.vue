<template>
  <span class="flip-counter" :class="{ compact }" role="img" :aria-label="formatted">
    <span
      v-for="(character, index) in characters"
      :key="index"
      class="flip-counter-cell"
      :class="{ separator: !/[0-9]/.test(character) }"
      aria-hidden="true"
    >
      <Transition name="digit-flip" mode="out-in">
        <span :key="`${index}-${character}`" class="flip-counter-digit">{{ character }}</span>
      </Transition>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  value: number | string | null | undefined
  compact?: boolean
}>(), { compact: false })

const { locale } = useI18n()
const formatted = computed(() => typeof props.value === 'number'
  ? new Intl.NumberFormat(locale.value).format(props.value)
  : props.value == null ? '—' : String(props.value))
const characters = computed(() => Array.from(formatted.value))
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.flip-counter { display: inline-flex; align-items: center; gap: 3px; vertical-align: middle; color: #fff; font-family: 'Geist Mono Variable', monospace; font-size: 1.45rem; font-weight: 760; font-variant-numeric: tabular-nums; line-height: 1; }
.flip-counter-cell { position: relative; display: inline-grid; min-width: .82em; height: 1.28em; place-items: center; overflow: hidden; border: 1px solid rgba(255,255,255,.12); border-radius: 4px; background: @accent; box-shadow: inset 0 1px 0 rgba(255,255,255,.16), 0 2px 5px rgba(0,0,0,.24); perspective: 120px; }
.flip-counter-digit { display: block; padding-inline: .08em; backface-visibility: hidden; }
.flip-counter-cell.separator { min-width: auto; border: 0; padding-inline: 1px; background: transparent; box-shadow: none; }
.compact { gap: 2px; font-size: .72rem; font-weight: 720; }
.compact .flip-counter-cell { min-width: .86em; height: 1.42em; border-radius: 3px; }
.digit-flip-enter-active,.digit-flip-leave-active { transition: transform 220ms cubic-bezier(.2,.75,.25,1), opacity 160ms ease; }
.digit-flip-enter-from { opacity: 0; transform: rotateX(-88deg) translateY(-.12em); }
.digit-flip-leave-to { opacity: 0; transform: rotateX(88deg) translateY(.12em); }
@media (prefers-reduced-motion: reduce) { .digit-flip-enter-active,.digit-flip-leave-active { transition: none; } }
</style>
