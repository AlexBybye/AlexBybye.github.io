import { onScopeDispose, watch, type Ref } from 'vue'

const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
const defaultDescription = descriptionMeta?.content || ''

export function usePageDescription(description: Readonly<Ref<string | undefined>>) {
  watch(description, (value) => {
    if (descriptionMeta) descriptionMeta.content = value?.trim() || defaultDescription
  }, { immediate: true })

  onScopeDispose(() => {
    if (descriptionMeta) descriptionMeta.content = defaultDescription
  })
}
