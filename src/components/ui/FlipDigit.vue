<template>
  <span class="flip-digit">
    <span class="half top"><span>{{ value }}</span></span>
    <span class="half bottom"><span>{{ flipping ? previous : value }}</span></span>
    <template v-if="flipping">
      <span :key="`${sequence}-top`" class="half top fold"><span>{{ previous }}</span></span>
      <span :key="`${sequence}-bottom`" class="half bottom unfold"><span>{{ value }}</span></span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ value: string }>()
const previous = ref(props.value)
const flipping = ref(false)
const sequence = ref(0)
let timer: ReturnType<typeof setTimeout> | undefined

watch(() => props.value, (next, old) => {
  clearTimeout(timer)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    flipping.value = false
    previous.value = next
    return
  }
  previous.value = old
  sequence.value += 1
  flipping.value = true
  timer = setTimeout(() => { flipping.value = false }, 640)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.flip-digit { position: relative; display: inline-block; width: .86em; height: var(--digit-height, 1.28em); flex: 0 0 auto; color: #fff; perspective: 240px; border-radius: 4px; box-shadow: 0 3px 7px #0005; }
.half { position: absolute; left: 0; width: 100%; height: 50%; overflow: hidden; background: #e30613; backface-visibility: hidden; }
.half > span { position: absolute; left: 0; display: grid; place-items: center; width: 100%; height: var(--digit-height, 1.28em); }
.top { top: 0; border-radius: 4px 4px 0 0; background: #ce0713; transform-origin: bottom center; }
.top > span { top: 0; }
.bottom { bottom: 0; border-radius: 0 0 4px 4px; transform-origin: top center; }
.bottom > span { bottom: 0; }
.flip-digit::after { content: ''; position: absolute; z-index: 4; top: 50%; right: 0; left: 0; height: 1px; background: #50030a66; pointer-events: none; }
.fold { z-index: 3; animation: fold 280ms ease-in forwards; }
.unfold { z-index: 2; animation: unfold 360ms 280ms ease-out both; }
@keyframes fold { to { transform: rotateX(-90deg); filter: brightness(.65); } }
@keyframes unfold { from { transform: rotateX(90deg); filter: brightness(.65); } to { transform: rotateX(0); filter: brightness(1); } }
@media (prefers-reduced-motion: reduce) { .fold,.unfold { animation: none; } }
</style>
