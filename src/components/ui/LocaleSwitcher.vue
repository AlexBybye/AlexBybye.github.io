<template>
  <div class="locale-switcher" :class="`theme-${theme}`">
    <span class="sr-only">{{ t('locale.label') }}</span>
    <button
      type="button"
      :aria-label="t('locale.switchTo', { locale: nextLabel })"
      @click="toggleLocale"
    >
      <span aria-hidden="true">{{ currentLocale === 'zh-CN' ? 'EN' : '中' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { currentLocale, setLocale } from '@/i18n'

withDefaults(defineProps<{ theme?: 'landing' | 'showcase' | 'blog' }>(), { theme: 'landing' })
const { t } = useI18n()
const nextLabel = computed(() => currentLocale.value === 'zh-CN' ? t('locale.english') : t('locale.chinese'))

function toggleLocale() {
  setLocale(currentLocale.value === 'zh-CN' ? 'en-US' : 'zh-CN')
}
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.locale-switcher {
  position: fixed;
  z-index: 60;
  top: 1rem;
  left: 1rem;
}

.locale-switcher button {
  display: grid;
  min-width: 44px;
  min-height: 44px;
  place-items: center;
  border: 1px solid @line;
  border-radius: 12px;
  background: @surface-raised;
  color: @text;
  font-family: 'Geist Mono Variable', monospace;
  font-size: .72rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 180ms ease, transform 180ms ease;
}

.theme-showcase button { border-color: rgba(244, 244, 245, .34); background: rgba(9, 9, 11, .78); color: #f4f4f5; }
.theme-showcase button:hover { border-color: #e30613; background: rgba(227, 6, 19, .2); }
.theme-blog { position: static; flex: 0 0 auto; }
.theme-blog button { border-color: #e30613; background: #e30613; color: #fff; box-shadow: 0 10px 28px rgba(227, 6, 19, .3); }
.theme-blog button:hover { border-color: #ff5963; background: #bd0712; }
.theme-landing button { border-color: rgba(244, 244, 245, .4); background: rgba(9, 9, 11, .72); color: #f4f4f5; }
.theme-landing button:hover { border-color: #e30613; background: rgba(227, 6, 19, .24); }
.locale-switcher button:focus-visible { outline: 2px solid @accent-strong; outline-offset: 3px; }
</style>
