/**
 * 手写 IntersectionObserver 简化版：监听 scroll/resize，用 getBoundingClientRect()
 * 算交叠比例，rAF 节流。方法签名与原生一致，可直接替换。
 */

export interface ScrollObserverEntry {
  target: Element
  isIntersecting: boolean
  intersectionRatio: number
}

type ScrollObserverCallback = (entries: ScrollObserverEntry[]) => void

interface ScrollObserverOptions {
  /** 交叠比例达到多少算“进入”，默认 0。 */
  threshold?: number
  /** 视口上下的预触发边距（px），类似 rootMargin，默认 0。 */
  rootMargin?: number
}

export class ScrollObserver {
  private callback: ScrollObserverCallback
  private threshold: number
  private rootMargin: number
  private targets = new Set<Element>()
  private states = new WeakMap<Element, boolean>()
  private rafId = 0
  private running = false

  constructor(callback: ScrollObserverCallback, options: ScrollObserverOptions = {}) {
    this.callback = callback
    this.threshold = options.threshold ?? 0
    this.rootMargin = options.rootMargin ?? 0
    this.onScroll = this.onScroll.bind(this)
    this.check = this.check.bind(this)
  }

  observe(el: Element) {
    if (this.targets.has(el)) return
    this.targets.add(el)
    if (!this.running) this.start()
    this.scheduleCheck()
  }

  unobserve(el: Element) {
    this.targets.delete(el)
    this.states.delete(el)
    if (this.targets.size === 0) this.stop()
  }

  disconnect() {
    this.targets.clear()
    this.stop()
  }

  private start() {
    this.running = true
    window.addEventListener('scroll', this.onScroll, { passive: true })
    window.addEventListener('resize', this.onScroll, { passive: true })
  }

  private stop() {
    this.running = false
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.onScroll)
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = 0 }
  }

  private onScroll() {
    this.scheduleCheck()
  }

  private scheduleCheck() {
    if (this.rafId) return
    this.rafId = requestAnimationFrame(this.check)
  }

  private check() {
    this.rafId = 0
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const changed: ScrollObserverEntry[] = []

    for (const el of this.targets) {
      const rect = el.getBoundingClientRect()
      const top = rect.top - this.rootMargin
      const bottom = rect.bottom + this.rootMargin
      const visible = Math.min(bottom, viewportHeight) - Math.max(top, 0)
      const ratio = rect.height > 0 ? Math.max(0, Math.min(visible / rect.height, 1)) : 0
      const isIntersecting = ratio > this.threshold

      if (this.states.get(el) === isIntersecting) continue
      this.states.set(el, isIntersecting)
      changed.push({ target: el, isIntersecting, intersectionRatio: ratio })
    }

    if (changed.length) this.callback(changed)
  }
}
