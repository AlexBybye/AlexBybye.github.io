<template>
  <div class="article-page">
    <div v-if="currentArticleId" class="page-shell article-detail-shell">
      <div class="article-detail-toolbar">
        <button class="back-button" type="button" @click="goBackToList"><PhArrowLeft :size="18" weight="bold" />{{ t('article.backToList') }}</button>
      </div>

      <div v-if="loading" class="article-loading"><span /><span /><span /></div>
      <div v-else-if="loadError" class="state-box"><PhWarningCircle :size="25" /><p>{{ loadError }}</p><button type="button" @click="loadArticleDetail(currentArticleId)">{{ t('common.retry') }}</button></div>
      <article v-else-if="currentArticle" class="article-detail">
        <header class="article-header">
          <div class="article-heading">
            <h1>{{ currentArticle.title }}</h1>
            <p v-if="currentArticle.description">{{ currentArticle.description }}</p>
          </div>
          <div class="article-meta">
            <span class="mono">{{ formatDate(currentArticle.date) }}</span>
            <span v-if="currentArticle.category">{{ currentArticle.category }}</span>
            <span class="mono">{{ t('article.comments', { count: commentCount }) }}</span>
            <ViewCount :label="t('nav.views')" :value="countFor(currentArticle.id)" />
          </div>
          <div v-if="currentArticle.tags?.length" class="tags">
            <Tag v-for="tag in currentArticle.tags" :key="tag">{{ tag }}</Tag>
          </div>
          <ReactionBar target-type="article" :target-id="currentArticle.id" />
        </header>

        <div class="markdown-content" v-html="currentArticle.content" />
        <CommentThread :slug="`article:${currentArticle.id}`" @count-change="commentCount = $event" />
      </article>
    </div>

    <div v-else class="page-shell article-index">
      <header class="article-index-header">
        <h1>{{ t('article.title') }}</h1>
        <p>{{ t('article.description') }}</p>
      </header>

      <div class="article-tools">
        <TagCloud :tags="categoryCloud" :label="t('article.category')" :model-value="selectedCategory || null" @tag-click="toggleCategory" />
        <div class="filters">
          <label>
            <span>{{ t('article.category') }}</span>
            <select v-model="selectedCategory"><option value="">{{ t('article.allCategories') }}</option><option v-for="category in categories" :key="category" :value="category">{{ category }}</option></select>
          </label>
          <label class="search-label">
            <span>{{ t('article.search') }}</span>
            <span class="search-input"><PhMagnifyingGlass :size="19" aria-hidden="true" /><input v-model="searchQuery" type="search" list="article-tag-search-index" :placeholder="t('article.searchPlaceholder')"><datalist id="article-tag-search-index"><option v-for="tag in searchTags" :key="tag" :value="tag" /></datalist></span>
          </label>
        </div>
      </div>

      <div v-if="loading" class="article-grid"><div v-for="n in 4" :key="n" class="article-card skeleton" /></div>
      <div v-else-if="loadError" class="state-box"><PhWarningCircle :size="25" /><p>{{ loadError }}</p><button type="button" @click="loadAllArticles">{{ t('common.retry') }}</button></div>
      <div v-else-if="!filteredArticles.length" class="state-box"><PhArticle :size="25" /><p>{{ t('article.empty') }}</p><button type="button" @click="clearFilters">{{ t('article.clearFilters') }}</button></div>
      <section v-else class="article-grid" :aria-label="t('article.listLabel')">
        <RouterLink v-for="(article, index) in filteredArticles" :key="article.id" :to="`/Animation3/article/detail/${article.id}`" class="article-card" :class="{ featured: index === 0 }" @pointermove="updatePointerGlow" @pointerleave="resetPointerGlow">
          <div class="card-meta"><span class="mono">{{ formatDate(article.date) }}</span><span v-if="article.category">{{ article.category }}</span><ViewCount :label="t('nav.views')" :value="countFor(article.id)" /></div>
          <h2>{{ article.title }}</h2>
          <p>{{ article.description || truncateText(article.content, 120) }}</p>
          <div class="card-footer"><div class="tags"><Tag v-for="tag in article.tags.slice(0, 3)" :key="tag">{{ tag }}</Tag></div><PhArrowRight :size="22" weight="bold" /></div>
        </RouterLink>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PhArrowLeft, PhArrowRight, PhArticle, PhMagnifyingGlass, PhWarningCircle } from '@/design/icons'
import { getArticleById, loadArticles } from '@/service/articleService'
import CommentThread from '@/components/social/CommentThread.vue'
import ReactionBar from '@/components/social/ReactionBar.vue'
import Tag from '@/components/ui/Tag.vue'
import TagCloud from '@/components/ui/TagCloud.vue'
import ViewCount from '@/components/ui/ViewCount.vue'
import { updatePointerGlow, resetPointerGlow } from '@/utils/pointerGlow'
import { usePageDescription } from '@/utils/pageDescription'
import { contentKey, loadContentCounts } from '@/service/visitCounts'

interface ArticleItem {
  id: string
  title: string
  date: string
  category: string
  tags: string[]
  content: string
  description?: string
}

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const articles = ref<ArticleItem[]>([])
const currentArticle = ref<ArticleItem | null>(null)
const selectedCategory = ref('')
const searchQuery = ref('')
const loading = ref(true)
const loadError = ref('')
const commentCount = ref(0)
const viewCounts = ref<Record<string, number>>({})

function countFor(id: string) { return viewCounts.value[contentKey('article', id)] ?? '—' }

const currentArticleId = computed(() => String(route.params.id || ''))
usePageDescription(computed(() => currentArticleId.value ? currentArticle.value?.description : undefined))
const categories = computed(() => Array.from(new Set(articles.value.map((article) => article.category).filter(Boolean))))
const categoryCloud = computed(() => {
  const counts = new Map<string, number>()
  articles.value.forEach((article) => {
    if (article.category) counts.set(article.category, (counts.get(article.category) || 0) + 1)
  })
  return Array.from(counts, ([name, count]) => ({ name, count }))
})
const searchTags = computed(() => Array.from(new Set(articles.value.flatMap((article) => article.tags || []))).sort((a, b) => a.localeCompare(b, locale.value)))
const filteredArticles = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return articles.value.filter((article) => {
    const categoryMatch = !selectedCategory.value || article.category === selectedCategory.value
    const queryMatch = !query || [article.title, article.description || '', article.content || '', ...(article.tags || [])].some((value) => value.toLowerCase().includes(query))
    return categoryMatch && queryMatch
  })
})

async function loadAllArticles() {
  loading.value = true
  loadError.value = ''
  try {
    articles.value = await loadArticles() as ArticleItem[]
    void loadContentCounts(articles.value.map((article) => contentKey('article', article.id)))
      .then((counts) => { for (const [key, count] of Object.entries(counts)) viewCounts.value[key] = Math.max(viewCounts.value[key] ?? 0, count) }).catch(() => {})
  }
  catch (error) { loadError.value = error instanceof Error ? error.message : t('article.loadFailed') }
  finally { loading.value = false }
}

async function loadArticleDetail(id: string) {
  if (!id) return
  loading.value = true
  loadError.value = ''
  currentArticle.value = null
  try {
    currentArticle.value = await getArticleById(id) as ArticleItem | null
    if (!currentArticle.value) loadError.value = t('article.notFound')
    else {
      const key = contentKey('article', currentArticle.value.id)
      void loadContentCounts([key], key).then((counts) => { if (counts[key] !== undefined) viewCounts.value[key] = Math.max(viewCounts.value[key] ?? 0, counts[key]) }).catch(() => {})
    }
  } catch (error) { loadError.value = error instanceof Error ? error.message : t('article.loadFailed') }
  finally { loading.value = false }
}

function toggleCategory(category: string) { selectedCategory.value = selectedCategory.value === category ? '' : category }
function clearFilters() { selectedCategory.value = ''; searchQuery.value = '' }
function goBackToList() { router.push('/Animation3/article') }
function formatDate(value: string) { return new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value)) }
function truncateText(html: string, maxLength: number) {
  const container = document.createElement('div')
  container.innerHTML = html
  const text = container.textContent || ''
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

watch(currentArticleId, (id) => id ? loadArticleDetail(id) : loadAllArticles(), { immediate: true })
onMounted(() => { if (!articles.value.length && !currentArticleId.value) loadAllArticles() })
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';
.article-page { min-height: 100dvh; background: transparent; color: @text; }
.article-index-header { max-width: 800px; padding-block: clamp(2.5rem, 7vw, 6rem) 2.5rem; }
.article-index-header h1 { margin: 0; font-size: clamp(3.2rem, 10vw, 7.4rem); letter-spacing: -.08em; line-height: .9; }
.article-index-header p { max-width: 52ch; margin: 1.3rem 0 0; color: @text-muted; font-size: 1.1rem; line-height: 1.65; }
.article-tools { display: grid; gap: 1.2rem; margin-bottom: 2rem; border-top: 1px solid @line; padding-top: 1.5rem; }
.filters { display: grid; grid-template-columns: minmax(180px, .45fr) minmax(280px, 1fr); gap: 1rem; }
.filters label { display: grid; gap: .5rem; color: @text-muted; font-size: .8rem; }
select, input { min-height: 46px; border: 1px solid @line; border-radius: 12px; background: @surface-raised; color: @text; font-size: 16px; }
select { padding: 0 .85rem; }.search-input { display: grid; grid-template-columns: auto 1fr; align-items: center; border: 1px solid @line; border-radius: 12px; padding-left: .85rem; background: @surface-raised; }.search-input input { width: 100%; border: 0; background: transparent; }.search-input input:focus { outline: 0; }
.article-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.article-card { --pointer-x: 50%; --pointer-y: 50%; position: relative; display: flex; min-height: 330px; flex-direction: column; overflow: hidden; border: 1px solid @line; border-radius: 16px; padding: clamp(1.25rem, 3vw, 2rem); background: @surface-raised; color: @text; text-decoration: none; cursor: pointer; content-visibility: auto; contain-intrinsic-size: auto 360px; transition: border-color 180ms ease, transform 180ms ease; }
.article-card::before { position: absolute; inset: 0; content: ''; pointer-events: none; opacity: 0; background: radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(227,6,19,.17), transparent 35%); transition: opacity 220ms ease; }
.article-card:hover::before { opacity: 1; }.article-card > * { position: relative; }
.article-card.featured { grid-row: span 2; min-height: 676px; contain-intrinsic-size: auto 680px; background: linear-gradient(155deg, #2b1114, @surface-raised 58%); }
.article-card:hover { border-color: @accent; transform: translateY(-2px); }
.card-meta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .7rem; color: @text-muted; font-size: .76rem; }
.article-card h2 { max-width: 17ch; margin: auto 0 1rem; font-size: clamp(1.6rem, 3.4vw, 3rem); letter-spacing: -.055em; line-height: 1; }
.article-card p { display: -webkit-box; overflow: hidden; margin: 0; color: @text-muted; line-height: 1.6; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.card-footer { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-top: 1.5rem; }.tags { display: flex; flex-wrap: wrap; gap: .5rem; }
.skeleton { min-height: 330px; cursor: default; animation: pulse 1.2s ease-in-out infinite alternate; } @keyframes pulse { to { opacity: .48; } }
.state-box { display: flex; align-items: center; gap: 1rem; border: 1px dashed @line; border-radius: 16px; padding: 2rem; color: @text-muted; }.state-box p { margin: 0; }.state-box button { min-height: 44px; margin-left: auto; border: 0; border-radius: 12px; padding: .7rem 1rem; background: @accent; color: @text; font-weight: 650; cursor: pointer; }
.article-detail-shell { max-width: 980px; }
.article-detail-toolbar { position: sticky; top: 86px; z-index: 12; margin-inline: calc(clamp(1rem, 3vw, 2rem) * -1); padding: .75rem clamp(1rem, 3vw, 2rem); background: rgba(9,9,11,.88); border-bottom: 1px solid transparent; backdrop-filter: blur(14px); }
.back-button { position: relative; display: inline-flex; min-height: 44px; align-items: center; gap: .5rem; overflow: hidden; border: 1px solid @line; border-radius: 12px; padding: .65rem .85rem; background: @surface-raised; color: @text; cursor: pointer; isolation: isolate; }
.back-button::before { position: absolute; z-index: -1; inset: 3px -24px; content: ''; background: @accent; opacity: 0; transform: translateX(-110%) skewX(-14deg); transition: transform 360ms cubic-bezier(.16,1,.3,1), opacity 180ms ease; }
.back-button:hover { border-color: @accent; }.back-button:hover::before { opacity: 1; transform: translateX(0) skewX(-14deg); }
.article-header { padding-block: clamp(2.5rem, 7vw, 6rem); border-bottom: 1px solid @line; }.article-heading h1 { max-width: 16ch; margin: 0; font-size: clamp(2.8rem, 8vw, 6.5rem); letter-spacing: -.075em; line-height: .94; }.article-heading p { max-width: 56ch; margin: 1.5rem 0 0; color: @text-muted; font-size: 1.08rem; line-height: 1.65; }.article-meta { display: flex; flex-wrap: wrap; gap: .75rem 1.5rem; margin-top: 2rem; color: @text-muted; font-size: .82rem; }.article-header > .tags { margin-block: 1.25rem; }
.markdown-content {
  max-width: 76ch;
  margin-inline: auto;
  padding-block: clamp(3rem, 7vw, 5.5rem);
  color: #d4d4d8;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 1.08rem;
  line-height: 2.05;
  letter-spacing: .012em;
  overflow-wrap: anywhere;
}
.markdown-content :deep(p) { margin: 0 0 1.35em; }
.markdown-content :deep(p:last-child) { margin-bottom: 0; }
.markdown-content :deep(h1), .markdown-content :deep(h2), .markdown-content :deep(h3) { color: @text; letter-spacing: -.035em; line-height: 1.2; }
.markdown-content :deep(h1), .markdown-content :deep(h2) { margin: 2.5em 0 .8em; }
.markdown-content :deep(h3) { margin: 2em 0 .65em; }
.markdown-content :deep(h2) { font-size: clamp(1.7rem, 4vw, 2.7rem); }
.markdown-content :deep(ul), .markdown-content :deep(ol) { margin: 0 0 1.4em; padding-inline-start: 1.6em; }
.markdown-content :deep(li + li) { margin-top: .45em; }
.markdown-content :deep(blockquote) { margin: 1.8em 0; border-left: 2px solid @accent; padding: .2em 0 .2em 1.2em; color: @text-muted; }
.markdown-content :deep(a) { color: @accent-strong; }
.markdown-content :deep(code) { border-radius: 6px; padding: .12em .35em; background: @surface-soft; font-family: 'Geist Mono Variable', monospace; }
.markdown-content :deep(pre) { overflow-x: auto; border: 1px solid @line; border-radius: 16px; padding: 1rem; background: @surface-raised; line-height: 1.65; }
.markdown-content :deep(pre code) { padding: 0; background: transparent; }
.markdown-content :deep(img) { display: block; max-width: 100%; height: auto; margin: 2rem auto; border-radius: 16px; }
.article-loading { display: grid; gap: 1rem; padding-block: 4rem; }.article-loading span { height: 28px; border-radius: 10px; background: @surface-raised; animation: pulse 1.2s ease-in-out infinite alternate; }.article-loading span:first-child { width: 80%; height: 76px; }.article-loading span:last-child { width: 62%; }
@media (max-width: 767px) {
  .filters, .article-grid { grid-template-columns: 1fr; }.article-card.featured { grid-row: auto; min-height: 380px; contain-intrinsic-size: auto 400px; }.article-card { min-height: 300px; contain-intrinsic-size: auto 340px; }
  .state-box { align-items: start; flex-direction: column; }.state-box button { width: 100%; margin-left: 0; }
  .article-heading h1 { font-size: clamp(2.8rem, 15vw, 4.8rem); }
}
@media (prefers-reduced-motion: reduce) { .article-card, .article-card::before { transition: none; } }
</style>
