<template>
  <section class="section-block" :aria-labelledby="headingId">
    <div v-if="title || description" class="section-heading">
      <h2 v-if="title" :id="headingId">{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  id?: string
}>(), {
  title: '',
  description: '',
  id: ''
})

const headingId = computed(() => props.id || (props.title ? `section-${props.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined))
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.section-block {
  padding-block: clamp(3.5rem, 8vw, 7rem);
}

.section-heading {
  display: grid;
  gap: 1rem;
  max-width: 760px;
  margin-bottom: clamp(2rem, 4vw, 3.5rem);

  h2 {
    margin: 0;
    color: @text;
    font-size: clamp(2rem, 5vw, 4.5rem);
    font-weight: 660;
    letter-spacing: -0.055em;
    line-height: 0.98;
  }

  p {
    margin: 0;
    max-width: 60ch;
    color: @text-muted;
    font-size: 1.05rem;
    line-height: 1.65;
  }
}
</style>
