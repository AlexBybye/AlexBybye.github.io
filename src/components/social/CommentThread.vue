<template>
  <section class="comment-thread" aria-labelledby="comments-title">
    <div class="comment-header">
      <div>
        <h2 id="comments-title">评论</h2>
        <p>评论由 GitHub Discussions 保存，作者身份来自 GitHub 授权。</p>
      </div>
      <AuthButton />
    </div>

    <form v-if="githubUser" class="comment-form" @submit.prevent="submitComment">
      <label for="comment-body">写下评论</label>
      <textarea id="comment-body" v-model="draft" rows="4" minlength="2" maxlength="2000" required
        placeholder="支持 Markdown，最多 2000 字。" />
      <p class="helper">以 {{ githubUser.login }} 的身份发布。</p>
      <p v-if="submitError" class="form-error">{{ submitError }}</p>
      <button class="submit-button" type="submit" :disabled="submitting || draft.trim().length < 2">
        {{ submitting ? '正在发布' : '发布评论' }}
      </button>
    </form>

    <div v-if="loading" class="comment-list" aria-label="正在加载评论">
      <div v-for="n in 2" :key="n" class="comment-skeleton"><span /><div><b /><i /></div></div>
    </div>
    <div v-else-if="loadError && comments.length === 0" class="state-box error-state">
      <PhWarningCircle :size="24" aria-hidden="true" />
      <p>{{ loadError }}</p>
      <button type="button" @click="load">重新加载</button>
    </div>
    <div v-else-if="comments.length === 0" class="state-box">
      <PhChatCircle :size="26" aria-hidden="true" />
      <p>{{ offline ? '当前没有可用的缓存评论。登录后可以创建讨论。' : '还没有评论，欢迎留下第一条。' }}</p>
    </div>
    <div v-else class="comment-list">
      <article v-for="comment in comments" :key="comment.id" class="comment-item">
        <a :href="comment.authorUrl" target="_blank" rel="noreferrer" class="comment-author">
          <img :src="comment.avatarUrl" :alt="`${comment.author} 的 GitHub 头像`" loading="lazy" decoding="async">
          <span>{{ comment.author }}</span>
        </a>
        <p class="comment-date mono">{{ formatDate(comment.createdAt) }}</p>
        <p class="comment-body">{{ comment.body }}</p>
        <div class="comment-actions">
          <ReactionBar target-type="comment" :target-id="comment.id" :subject-id="comment.id" compact />
          <button v-if="comment.viewerDidAuthor" type="button" class="delete-button" @click="remove(comment.id)">删除</button>
        </div>
      </article>
    </div>
    <p v-if="offline && comments.length" class="offline-note">正在展示本机缓存，连接恢复后可刷新最新评论。</p>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { PhChatCircle, PhWarningCircle } from '@/design/icons'
import { githubUser } from '@/service/auth/githubOAuth'
import { addComment, deleteComment, loadComments, type SocialComment } from '@/service/discussions/commentsRepo'
import AuthButton from './AuthButton.vue'
import ReactionBar from './ReactionBar.vue'

const props = defineProps<{ slug: string }>()
const emit = defineEmits<{ countChange: [count: number] }>()

const comments = ref<SocialComment[]>([])
const draft = ref('')
const loading = ref(true)
const submitting = ref(false)
const offline = ref(false)
const loadError = ref('')
const submitError = ref('')

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await loadComments(props.slug)
    comments.value = result.thread?.comments || []
    offline.value = result.offline
    emit('countChange', comments.value.length)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '评论加载失败'
  } finally { loading.value = false }
}

async function submitComment() {
  submitting.value = true
  submitError.value = ''
  try {
    await addComment(props.slug, draft.value.trim())
    draft.value = ''
    await load()
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : '评论发布失败'
  } finally { submitting.value = false }
}

async function remove(id: string) {
  if (!window.confirm('确认删除这条评论吗？')) return
  try { await deleteComment(id); await load() }
  catch (error) { loadError.value = error instanceof Error ? error.message : '评论删除失败' }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

onMounted(load)
watch(() => [props.slug, githubUser.value?.login], load)
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';
.comment-thread { margin-top: clamp(3rem, 7vw, 6rem); border-top: 1px solid @line; padding-top: 2rem; }
.comment-header { display: flex; align-items: start; justify-content: space-between; gap: 1.5rem; }
h2 { margin: 0 0 .5rem; font-size: clamp(1.75rem, 4vw, 2.5rem); letter-spacing: -.04em; }
.comment-header p, .helper, .offline-note { margin: 0; color: @text-muted; line-height: 1.55; }
.comment-form { display: grid; gap: .65rem; margin-top: 2rem; max-width: 760px; }
.comment-form label { font-weight: 650; }
textarea { resize: vertical; min-height: 120px; border: 1px solid @line; border-radius: 12px; padding: 1rem; background: @surface-raised; color: @text; font-size: 16px; line-height: 1.55; }
textarea::placeholder { color: #8b8b94; }
.helper, .form-error { font-size: .86rem; }
.form-error { margin: 0; color: #ff8a92; }
.submit-button, .state-box button { width: fit-content; min-height: 44px; border: 0; border-radius: 12px; padding: .7rem 1rem; background: @accent; color: @text; font-weight: 680; cursor: pointer; }
.submit-button:disabled { cursor: not-allowed; opacity: .5; }
.comment-list { display: grid; gap: 1rem; margin-top: 2rem; }
.comment-item { display: grid; grid-template-columns: auto 1fr; gap: .3rem .75rem; border: 1px solid @line; border-radius: 16px; padding: 1rem; background: @surface-raised; }
.comment-author { display: inline-flex; align-items: center; gap: .55rem; color: @text; font-weight: 650; text-decoration: none; }
.comment-author img { width: 34px; height: 34px; border-radius: 50%; }
.comment-date { justify-self: end; margin: .45rem 0 0; color: @text-muted; font-size: .74rem; }
.comment-body { grid-column: 1 / -1; margin: .65rem 0; color: #d4d4d8; white-space: pre-wrap; line-height: 1.65; }
.comment-actions { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.delete-button { border: 0; background: none; color: #ff8a92; cursor: pointer; }
.state-box { display: flex; align-items: center; gap: .8rem; margin-top: 2rem; border: 1px dashed @line; border-radius: 16px; padding: 1.5rem; color: @text-muted; }
.state-box p { margin: 0; }
.state-box button { margin-left: auto; }
.offline-note { margin-top: 1rem; font-size: .84rem; }
.comment-skeleton { display: flex; gap: .75rem; border: 1px solid @line; border-radius: 16px; padding: 1rem; }
.comment-skeleton > span { width: 34px; height: 34px; border-radius: 50%; background: @surface-soft; }
.comment-skeleton div { display: grid; flex: 1; gap: .6rem; }
.comment-skeleton b, .comment-skeleton i { display: block; border-radius: 8px; background: @surface-soft; animation: pulse 1.3s ease-in-out infinite alternate; }
.comment-skeleton b { width: 28%; height: 12px; } .comment-skeleton i { width: 72%; height: 42px; }
@keyframes pulse { to { opacity: .45; } }
@media (max-width: 767px) {
  .comment-header { flex-direction: column; } .comment-header > :last-child { width: 100%; }
  .comment-item { grid-template-columns: 1fr; } .comment-date { justify-self: start; }
}
</style>
