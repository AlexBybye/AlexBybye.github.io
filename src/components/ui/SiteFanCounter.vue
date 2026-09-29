<template>
  <div class="fan-counter">
    <span class="fan-counter-mark"><PhUsers :size="19" weight="fill" aria-hidden="true" /></span>
    <div class="fan-counter-content">
      <span class="fan-counter-label">{{ t('nav.attendance') }}</span>
      <strong class="fan-counter-total" aria-live="polite"><FlipCounter :value="count" /></strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhUsers } from '@/design/icons'
import FlipCounter from '@/components/ui/FlipCounter.vue'
import { loadSiteFans } from '@/service/visitCounts'

const { t } = useI18n()
const count = ref<number | null>(null)

onMounted(async () => {
  try { count.value = (await loadSiteFans()).total }
  catch { /* The Worker may not have been deployed yet. */ }
})
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.fan-counter {
    display: flex; width: min(100% - 2rem, 1200px); min-height: 72px; align-items: center; gap: .8rem; margin: .6rem auto 1.1rem; border: 1px solid rgba(227,6,19,.32); border-left: 3px solid @accent; border-radius: 7px; padding: .55rem .9rem;
  background: linear-gradient(100deg, rgba(227,6,19,.13), rgba(227,6,19,.035) 56%, rgba(24,24,27,.52)); color: @text; font-size: .88rem;
}
.fan-counter-mark { display: grid; width: 38px; height: 38px; flex: 0 0 auto; place-items: center; border: 1px solid rgba(227,6,19,.4); border-radius: 50%; background: rgba(227,6,19,.12); color: @accent-strong; }
.fan-counter-content { display: grid; gap: .38rem; }
.fan-counter-label { color: #f4f4f5; font-size: .72rem; font-weight: 680; letter-spacing: .04em; line-height: 1; }
.fan-counter-total { display: inline-flex; }
@media (max-width: 767px) { .fan-counter { width: min(100% - 1.25rem, 1200px); } }
@media (max-width: 420px) { .fan-counter { min-height: 68px; padding-inline: .7rem; }.fan-counter :deep(.flip-counter) { gap: 2px; font-size: 1.16rem; } }
</style>
