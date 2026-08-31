export function updatePointerGlow(event: PointerEvent) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const element = event.currentTarget as HTMLElement
  const rect = element.getBoundingClientRect()
  element.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width) * 100}%`)
  element.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height) * 100}%`)
}

export function resetPointerGlow(event: PointerEvent) {
  const element = event.currentTarget as HTMLElement
  element.style.setProperty('--pointer-x', '50%')
  element.style.setProperty('--pointer-y', '50%')
}
