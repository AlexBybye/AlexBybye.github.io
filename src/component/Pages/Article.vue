<template>
  <div class="article-page">
    <div v-if="currentArticleId" class="page-shell article-detail-shell">
      <button class="back-button" type="button" @click="goBackToList"><PhArrowLeft :size="18" weight="bold" />返回文章列表</button>

      <div v-if="loading" class="article-loading"><span /><span /><span /></div>
      <div v-else-if="loadError" class="state-box"><PhWarningCircle :size="25" /><p>{{ loadError }}</p><button type="button" @click="loadArticleDetail(currentArticleId)">重新加载</button></div>
      <article v-else-if="currentArticle" class="article-detail">
        <header class="article-header">
          <div class="article-heading">
            <h1>{{ currentArticle.title }}</h1>
            <p v-if="currentArticle.description">{{ currentArticle.description }}</p>
          </div>
          <div class="article-meta">
            <span class="mono">{{ formatDate(currentArticle.date) }}</span>
            <span v-if="currentArticle.category">{{ currentArticle.category }}</span>
            <span class="mono">{{ commentCount }} comments</span>
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
        <h1>Articles</h1>
        <p>Notes on engineering, language learning, and the process behind this site.</p>
      </header>

      <div class="article-tools">
        <TagCloud :tags="allTags" :model-value="selectedTag" @tag-click="toggleTag" />
        <div class="filters">
          <label>
            <span>分类</span>
            <select v-model="selectedCategory"><option value="">所有分类</option><option v-for="category in categories" :key="category" :value="category">{{ category }}</option></select>
          </label>
          <label class="search-label">
            <span>搜索</span>
            <span class="search-input"><PhMagnifyingGlass :size="19" aria-hidden="true" /><input v-model="searchQuery" type="search" placeholder="输入标题、内容或标签"></span>
          </label>
        </div>
      </div>

      <div v-if="loading" class="article-grid"><div v-for="n in 4" :key="n" class="article-card skeleton" /></div>
      <div v-else-if="loadError" class="state-box"><PhWarningCircle :size="25" /><p>{{ loadError }}</p><button type="button" @click="loadAllArticles">重新加载</button></div>
      <div v-else-if="!filteredArticles.length" class="state-box"><PhArticle :size="25" /><p>没有找到匹配的文章，试试清除筛选条件。</p><button type="button" @click="clearFilters">清除筛选</button></div>
      <section v-else class="article-grid" aria-label="文章列表">
        <RouterLink v-for="(article, index) in filteredArticles" :key="article.id" :to="`/Animation3/article/detail/${article.id}`" class="article-card" :class="{ featured: index === 0 }">
          <div class="card-meta"><span class="mono">{{ formatDate(article.date) }}</span><span v-if="article.category">{{ article.category }}</span></div>
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
import { PhArrowLeft, PhArrowRight, PhArticle, PhMagnifyingGlass, PhWarningCircle } from '@/design/icons'
import { getArticleById, loadArticles } from '@/service/articleService'
import CommentThread from '@/components/social/CommentThread.vue'
import ReactionBar from '@/components/social/ReactionBar.vue'
import Tag from '@/components/ui/Tag.vue'
import TagCloud from './TagCloud.vue'

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
const articles = ref<ArticleItem[]>([])
const currentArticle = ref<ArticleItem | null>(null)
const selectedCategory = ref('')
const selectedTag = ref<string | null>(null)
const searchQuery = ref('')
const loading = ref(true)
const loadError = ref('')
const commentCount = ref(0)

const currentArticleId = computed(() => String(route.params.id || ''))
const categories = computed(() => Array.from(new Set(articles.value.map((article) => article.category).filter(Boolean))))
const allTags = computed(() => {
  const counts = new Map<string, number>()
  articles.value.forEach((article) => article.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)))
  return Array.from(counts, ([name, count]) => ({ name, count }))
})
const filteredArticles = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return articles.value.filter((article) => {
    const categoryMatch = !selectedCategory.value || article.category === selectedCategory.value
    const tagMatch = !selectedTag.value || article.tags.includes(selectedTag.value)
    const queryMatch = !query || [article.title, article.description || '', article.content || '', ...article.tags].some((value) => value.toLowerCase().includes(query))
    return categoryMatch && tagMatch && queryMatch
  })
})

async function loadAllArticles() {
  loading.value = true
  loadError.value = ''
  try { articles.value = await loadArticles() as ArticleItem[] }
  catch (error) { loadError.value = error instanceof Error ? error.message : '文章加载失败' }
  finally { loading.value = false }
}

async function loadArticleDetail(id: string) {
  if (!id) return
  loading.value = true
  loadError.value = ''
  currentArticle.value = null
  try {
    currentArticle.value = await getArticleById(id) as ArticleItem | null
    if (!currentArticle.value) loadError.value = '没有找到这篇文章。'
  } catch (error) { loadError.value = error instanceof Error ? error.message : '文章加载失败' }
  finally { loading.value = false }
}

function toggleTag(tag: string) { selectedTag.value = selectedTag.value === tag ? null : tag }
function clearFilters() { selectedTag.value = null; selectedCategory.value = ''; searchQuery.value = '' }
function goBackToList() { router.push('/Animation3/article') }
function formatDate(value: string) { return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value)) }
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
.article-card { display: flex; min-height: 330px; flex-direction: column; border: 1px solid @line; border-radius: 16px; padding: clamp(1.25rem, 3vw, 2rem); background: @surface-raised; color: @text; text-decoration: none; cursor: pointer; transition: border-color 180ms ease, transform 180ms ease; }
.article-card.featured { grid-row: span 2; min-height: 676px; background: linear-gradient(155deg, #2b1114, @surface-raised 58%); }
.article-card:hover { border-color: @accent; transform: translateY(-2px); }
.card-meta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .7rem; color: @text-muted; font-size: .76rem; }
.article-card h2 { max-width: 17ch; margin: auto 0 1rem; font-size: clamp(1.6rem, 3.4vw, 3rem); letter-spacing: -.055em; line-height: 1; }
.article-card p { display: -webkit-box; overflow: hidden; margin: 0; color: @text-muted; line-height: 1.6; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.card-footer { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-top: 1.5rem; }.tags { display: flex; flex-wrap: wrap; gap: .5rem; }
.skeleton { min-height: 330px; cursor: default; animation: pulse 1.2s ease-in-out infinite alternate; } @keyframes pulse { to { opacity: .48; } }
.state-box { display: flex; align-items: center; gap: 1rem; border: 1px dashed @line; border-radius: 16px; padding: 2rem; color: @text-muted; }.state-box p { margin: 0; }.state-box button { min-height: 44px; margin-left: auto; border: 0; border-radius: 12px; padding: .7rem 1rem; background: @accent; color: @text; font-weight: 650; cursor: pointer; }
.article-detail-shell { max-width: 980px; }.back-button { display: inline-flex; min-height: 44px; align-items: center; gap: .5rem; border: 1px solid @line; border-radius: 12px; padding: .65rem .85rem; background: @surface-raised; color: @text; cursor: pointer; }
.article-header { padding-block: clamp(2.5rem, 7vw, 6rem); border-bottom: 1px solid @line; }.article-heading h1 { max-width: 16ch; margin: 0; font-size: clamp(2.8rem, 8vw, 6.5rem); letter-spacing: -.075em; line-height: .94; }.article-heading p { max-width: 56ch; margin: 1.5rem 0 0; color: @text-muted; font-size: 1.08rem; line-height: 1.65; }.article-meta { display: flex; flex-wrap: wrap; gap: .75rem 1.5rem; margin-top: 2rem; color: @text-muted; font-size: .82rem; }.article-header > .tags { margin-block: 1.25rem; }
.markdown-content { padding-block: clamp(3rem, 7vw, 5.5rem); color: #d4d4d8; font-size: 1.04rem; line-height: 1.82; }
.markdown-content :deep(h1), .markdown-content :deep(h2), .markdown-content :deep(h3) { color: @text; letter-spacing: -.035em; line-height: 1.12; }.markdown-content :deep(h2) { margin-top: 2.5em; font-size: clamp(1.7rem, 4vw, 2.7rem); }.markdown-content :deep(a) { color: @accent-strong; }.markdown-content :deep(code) { border-radius: 6px; padding: .12em .35em; background: @surface-soft; font-family: 'Geist Mono Variable', monospace; }.markdown-content :deep(pre) { overflow-x: auto; border: 1px solid @line; border-radius: 16px; padding: 1rem; background: @surface-raised; }.markdown-content :deep(pre code) { padding: 0; background: transparent; }.markdown-content :deep(img) { height: auto; border-radius: 16px; }
.article-loading { display: grid; gap: 1rem; padding-block: 4rem; }.article-loading span { height: 28px; border-radius: 10px; background: @surface-raised; animation: pulse 1.2s ease-in-out infinite alternate; }.article-loading span:first-child { width: 80%; height: 76px; }.article-loading span:last-child { width: 62%; }
@media (max-width: 767px) {
  .filters, .article-grid { grid-template-columns: 1fr; }.article-card.featured { grid-row: auto; min-height: 380px; }.article-card { min-height: 300px; }
  .state-box { align-items: start; flex-direction: column; }.state-box button { width: 100%; margin-left: 0; }
  .article-heading h1 { font-size: clamp(2.8rem, 15vw, 4.8rem); }
}
@media (prefers-reduced-motion: reduce) { .article-card { transition: none; } }
</style>
