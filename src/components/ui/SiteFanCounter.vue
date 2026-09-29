<template>
  <div class="fan-counter" :aria-label="t('nav.siteFans')">
    <PhUsers :size="17" weight="fill" aria-hidden="true" />
    <span>{{ t('nav.siteFans') }}</span>
    <strong class="mono" aria-live="polite">{{ countLabel }}</strong>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhUsers } from '@/design/icons'
import { loadSiteFans } from '@/service/visitCounts'

const { t, locale } = useI18n()
const count = ref<number | null>(null)
const countLabel = computed(() => count.value === null ? '—' : new Intl.NumberFormat(locale.value).format(count.value))

onMounted(async () => {
  try { count.value = (await loadSiteFans()).total }
  catch { /* The Worker may not have been deployed yet. */ }
})
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.fan-counter {
  display: flex; width: min(100% - 2rem, 1200px); min-height: 38px; align-items: center; gap: .55rem; margin-inline: auto;
  color: @text-muted; font-size: .75rem;
}
.fan-counter :deep(svg) { color: @accent; }
.fan-counter strong { color: @text; font-size: .85rem; }
@media (max-width: 767px) { .fan-counter { width: min(100% - 1.25rem, 1200px); } }
</style>
