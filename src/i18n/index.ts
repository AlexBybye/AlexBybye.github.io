import { computed } from 'vue'
import { createI18n } from 'vue-i18n'
import enUS from './locales/en-US'
import zhCN from './locales/zh-CN'

export const LOCALES = ['zh-CN', 'en-US'] as const
export type Locale = (typeof LOCALES)[number]
const STORAGE_KEY = 'site-locale'
const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
} satisfies Record<Locale, typeof enUS | typeof zhCN>

function isLocale(value: string | null): value is Locale {
  return value === 'zh-CN' || value === 'en-US'
}

function detectLocale(): Locale {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (isLocale(stored)) return stored
    } catch {
      // Private browsing or a blocked storage area should not prevent boot.
    }
    if (window.navigator.language.toLowerCase().startsWith('zh')) return 'zh-CN'
  }
  return 'en-US'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'zh-CN',
  messages
})

export const currentLocale = computed(() => i18n.global.locale.value as Locale)

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(STORAGE_KEY, locale) } catch {
      // Locale switching still works for the current session without storage.
    }
    document.documentElement.lang = locale
  }
}

export function initializeLocale() {
  setLocale(currentLocale.value)
}
