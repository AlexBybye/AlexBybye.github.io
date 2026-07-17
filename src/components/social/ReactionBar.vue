<template>
  <div class="reaction-bar" :class="{ compact }">
    <button type="button" :disabled="loading || !githubUser" :aria-pressed="state.viewerHasReacted" @click="toggle">
      <PhHeart :size="20" :weight="state.viewerHasReacted ? 'fill' : 'regular'" aria-hidden="true" />
      <span>{{ state.count }}</span>
      <span class="label">{{ state.viewerHasReacted ? '已点赞' : '点赞' }}</span>
    </button>
    <span v-if="state.offline" class="offline">{{ githubUser ? '离线缓存' : '登录后可点赞' }}</span>
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { PhHeart } from '@/design/icons'
import { githubUser } from '@/service/auth/githubOAuth'
import { getReactionState, toggleReaction, type ReactionState } from '@/service/discussions/reactionsRepo'

const props = withDefaults(defineProps<{
  targetType: 'article' | 'song' | 'comment'
  targetId: string
  subjectId?: string
  compact?: boolean
}>(), { subjectId: '', compact: false })

const state = reactive<ReactionState>({ count: 0, viewerHasReacted: false, offline: true })
const loading = ref(false)
const error = ref('')

async function load() {
  if (!props.targetId) return
  loading.value = true
  error.value = ''
  try { Object.assign(state, await getReactionState(`${props.targetType}:${props.targetId}`, props.subjectId || undefined)) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '点赞状态加载失败' }
  finally { loading.value = false }
}

async function toggle() {
  loading.value = true
  error.value = ''
  const previous = { ...state }
  Object.assign(state, {
    count: Math.max(0, state.count + (state.viewerHasReacted ? -1 : 1)),
    viewerHasReacted: !state.viewerHasReacted
  })
  try {
    Object.assign(state, await toggleReaction(`${props.targetType}:${props.targetId}`, previous, props.subjectId || undefined))
  } catch (cause) {
    Object.assign(state, previous)
    error.value = cause instanceof Error ? cause.message : '点赞失败'
  } finally { loading.value = false }
}

onMounted(load)
watch(() => [props.targetId, githubUser.value?.login], load)
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';
.reaction-bar { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; }
button {
  display: inline-flex; min-height: 44px; align-items: center; gap: .5rem;
  border: 1px solid @line; border-radius: 12px; padding: .65rem .85rem;
  background: @surface-raised; color: @text; cursor: pointer;
  &[aria-pressed='true'] { border-color: @accent; color: @accent-strong; }
  &:disabled { cursor: not-allowed; opacity: .55; }
}
.compact .label { display: none; }
.offline { color: @text-muted; font-size: .8rem; }
.error { color: #ff8a92; font-size: .8rem; }
@media (max-width: 767px) { .reaction-bar:not(.compact) { align-items: stretch; flex-direction: column; } }
</style>
