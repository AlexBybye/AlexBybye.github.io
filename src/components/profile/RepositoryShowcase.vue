<template>
  <div class="repository-showcase" :data-style="cardStyle">
    <header class="showcase-heading">
      <div>
        <h2>{{ t('profile.selectedRepositories') }}</h2>
        <p>{{ t('profile.repositoryDescription') }}</p>
      </div>
      <div class="style-switcher" role="group" :aria-label="t('profile.repositoryStyle')">
        <button v-for="style in cardStyles" :key="style.value" type="button"
          :aria-pressed="cardStyle === style.value" @click="cardStyle = style.value">
          <component :is="style.icon" :size="17" aria-hidden="true" />
          {{ style.label }}
        </button>
      </div>
    </header>

    <div v-if="loading" class="repository-grid" :aria-label="t('profile.loadingRepositories')">
      <div v-for="index in repositories.length" :key="index" class="repository-card skeleton" />
    </div>

    <Transition v-else name="formation-switch" mode="out-in">
      <div :key="cardStyle" class="repository-grid">
        <article v-for="(item, index) in repositoryStates" :key="item.repo.href" class="repository-card"
          :style="{ '--card-index': index }" @pointermove="tiltCard" @pointerleave="resetCard">
          <template v-if="item.status === 'error'">
            <img class="legacy-repository-card" :src="legacyCardUrl(item.repo.owner, item.repo.name)"
              :alt="t('profile.fallbackRepositoryAlt', { name: `${item.repo.owner}/${item.repo.name}` })" loading="lazy" decoding="async">
            <div class="fallback-copy">
              <span class="mono">{{ t('profile.fallbackCard') }}</span>
              <p>{{ t('profile.repositoryUnavailable') }}</p>
              <img class="fallback-visitor-badge" :src="resolveVisitorBadgeUrl(item.repo)"
                :alt="visitorBadgeAlt(item.repo)" loading="lazy" decoding="async">
              <a :href="item.repo.href" target="_blank" rel="noreferrer">
                {{ t('profile.openRepository') }} <PhArrowSquareOut :size="17" aria-hidden="true" />
              </a>
            </div>
          </template>

          <template v-else-if="item.metrics">
            <div class="card-topline">
              <span class="repository-origin" :title="t('profile.publicData')">
                <PhGithubLogo :size="23" weight="fill" aria-hidden="true" />{{ t('profile.githubData') }}
              </span>
              <span class="language mono">{{ item.metrics.language }}</span>
            </div>

            <div class="repository-copy">
              <span class="owner mono">{{ item.repo.owner }}</span>
              <h3>{{ item.metrics.name }}</h3>
              <p>{{ repositoryDescription(item) }}</p>
            </div>

            <dl class="repository-scoreboard">
              <div><dt><PhStar :size="18" weight="fill" aria-hidden="true" />{{ t('profile.stars') }}</dt><dd class="mono">{{ item.metrics.stars }}</dd></div>
              <div><dt><PhGitFork :size="18" aria-hidden="true" />{{ t('profile.forks') }}</dt><dd class="mono">{{ item.metrics.forks }}</dd></div>
              <div><dt>{{ t('profile.issues') }}</dt><dd class="mono">{{ item.metrics.openIssues }}</dd></div>
              <div><dt>{{ t('profile.visits') }}</dt><dd class="visit-count"><img :src="resolveVisitorBadgeUrl(item.repo)"
                :alt="visitorBadgeAlt(item.repo)" loading="lazy" decoding="async"></dd></div>
            </dl>

            <div v-if="item.metrics.topics.length" class="repository-topics" :aria-label="t('profile.repositoryTopics')">
              <span v-for="topic in item.metrics.topics" :key="topic">{{ topic }}</span>
            </div>

            <footer>
              <span><PhCalendarBlank :size="17" aria-hidden="true" />{{ formatUpdatedAt(item.metrics.updatedAt) }}</span>
              <span class="license mono">{{ item.metrics.license }}</span>
              <a :href="item.metrics.href" target="_blank" rel="noreferrer" :aria-label="t('profile.openRepository') + ' ' + item.metrics.fullName">
                <PhArrowSquareOut :size="20" weight="bold" aria-hidden="true" />
              </a>
            </footer>
          </template>
        </article>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  PhArrowSquareOut,
  PhCalendarBlank,
  PhChartLineUp,
  PhGitFork,
  PhGithubLogo,
  PhStar,
  PhStrategy
} from '@/design/icons'
import type { FeaturedRepo } from '@/content/repos'
import { loadPublicRepository } from '@/service/githubPublic'
import type { PublicRepoMetrics } from '@/service/githubPublic'

const props = defineProps<{ repositories: FeaturedRepo[] }>()
const { t, locale } = useI18n()

type CardStyle = 'matchday' | 'tactics'
interface RepositoryState {
  repo: FeaturedRepo
  status: 'loaded' | 'error'
  metrics: PublicRepoMetrics | null
  error: string
}

const cardStyle = ref<CardStyle>('matchday')
const loading = ref(true)
const repositoryStates = ref<RepositoryState[]>([])
const cardStyles = computed(() => [
  { value: 'matchday' as const, label: t('profile.matchday'), icon: markRaw(PhChartLineUp) },
  { value: 'tactics' as const, label: t('profile.tactics'), icon: markRaw(PhStrategy) }
])
let tiltFrame = 0

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))
}

function legacyCardUrl(owner: string, name: string) {
  const query = new URLSearchParams({ username: owner, repo: name, theme: 'tokyonight', hide_border: 'true' })
  return `https://github-readme-stats-fast.vercel.app/api/pin/?${query}`
}

function generatedVisitorBadgeUrl(pageId: string) {
  const query = new URLSearchParams({
    page_id: pageId,
    left_text: 'views',
    left_color: '#111113',
    right_color: '#e30613'
  })
  return `https://visitor-badge.laobi.icu/badge?${query}`
}

function resolveVisitorBadgeUrl(repo: FeaturedRepo) {
  return repo.visitorBadgeUrl || generatedVisitorBadgeUrl(repo.visitorPageId)
}

function visitorBadgeAlt(repo: FeaturedRepo) {
  return t('profile.repositoryVisits', { name: `${repo.owner}/${repo.name}` })
}

function repositoryDescription(item: RepositoryState) {
  const key = `profile.repositoryCopy.${item.repo.name}`
  const translated = t(key)
  return translated === key ? item.metrics?.description || item.repo.description : translated
}

function tiltCard(event: PointerEvent) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const card = event.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - .5
  const y = (event.clientY - rect.top) / rect.height - .5
  cancelAnimationFrame(tiltFrame)
  tiltFrame = requestAnimationFrame(() => {
    card.style.setProperty('--pointer-x', `${(x + .5) * 100}%`)
    card.style.setProperty('--pointer-y', `${(y + .5) * 100}%`)
    card.style.transform = `perspective(900px) rotateX(${-y * 3.5}deg) rotateY(${x * 4.5}deg) translate3d(0,-4px,0)`
  })
}

function resetCard(event: PointerEvent) {
  const card = event.currentTarget as HTMLElement
  cancelAnimationFrame(tiltFrame)
  tiltFrame = requestAnimationFrame(() => { card.style.transform = '' })
}

onMounted(async () => {
  const results = await Promise.all(props.repositories.map(async (repo): Promise<RepositoryState> => {
    try {
      return { repo, status: 'loaded', metrics: await loadPublicRepository(repo.owner, repo.name), error: '' }
    } catch (cause) {
      return { repo, status: 'error', metrics: null, error: cause instanceof Error ? cause.message : t('errors.githubDataUnavailable') }
    }
  }))
  repositoryStates.value = results
  loading.value = false
})

onBeforeUnmount(() => cancelAnimationFrame(tiltFrame))
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.repository-showcase { padding-block: clamp(4.5rem,9vw,8rem); border-top: 1px solid @line; }
.showcase-heading { display: grid; grid-template-columns: 1fr auto; gap: 2rem; align-items: end; margin-bottom: 2rem; }
.showcase-heading h2 { max-width: 11ch; margin: 0; font-size: clamp(2.6rem,6vw,5.4rem); letter-spacing: -.07em; line-height: .9; }
.showcase-heading p { margin: 1rem 0 0; color: @text-muted; }
.style-switcher { display: flex; gap: .4rem; border: 1px solid @line; border-radius: @radius-card; padding: .35rem; background: @surface-raised; }
.style-switcher button { display: inline-flex; min-height: 42px; align-items: center; gap: .4rem; border: 0; border-radius: @radius-control; padding: .6rem .75rem; background: transparent; color: @text-muted; font-size: .8rem; font-weight: 650; white-space: nowrap; cursor: pointer; transition: background 180ms ease,color 180ms ease,transform 180ms ease; }
.style-switcher button[aria-pressed='true'] { background: @accent; color: @text; }.style-switcher button:active { transform: scale(.97); }

.repository-grid { display: grid; grid-template-columns: minmax(0,1.18fr) minmax(0,.82fr); gap: 1rem; }
.repository-card { --pointer-x: 50%; --pointer-y: 50%; position: relative; display: flex; min-height: 500px; flex-direction: column; overflow: hidden; border: 1px solid @line; border-radius: @radius-card; padding: clamp(1.25rem,3vw,2rem); background: @surface-raised; transform-style: preserve-3d; transition: border-color 220ms ease,transform 320ms cubic-bezier(.16,1,.3,1),background 320ms ease; animation: repository-enter 720ms calc(var(--card-index) * 100ms) cubic-bezier(.16,1,.3,1) both; }
.repository-card::before { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0; background: radial-gradient(circle at var(--pointer-x) var(--pointer-y),rgba(227,6,19,.18),transparent 34%); transition: opacity 220ms ease; }.repository-card:hover::before { opacity: 1; }.repository-card:hover { border-color: #62626b; }
.card-topline,.repository-card footer,.repository-origin,.repository-card footer > span { display: flex; align-items: center; }
.card-topline { position: relative; justify-content: space-between; gap: 1rem; }.repository-origin { gap: .55rem; color: @text-muted; font-size: .78rem; }.language { color: @accent-strong; font-size: .72rem; }
.repository-copy { position: relative; margin-top: clamp(3rem,6vw,5rem); }.owner { color: @text-muted; font-size: .72rem; }.repository-copy h3 { max-width: 100%; overflow-wrap: anywhere; margin: .7rem 0 .8rem; font-size: clamp(1.7rem,3.2vw,2.8rem); letter-spacing: -.055em; line-height: .94; }.repository-copy p { max-width: 54ch; margin: 0; color: @text-muted; line-height: 1.6; }
.repository-scoreboard { position: relative; display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; margin: 2rem 0 0; overflow: hidden; border: 1px solid @line; border-radius: @radius-control; background: @line; }.repository-scoreboard div { min-width: 0; padding: .85rem; background: @surface; }.repository-scoreboard dt { display: flex; min-height: 22px; align-items: center; gap: .35rem; color: @text-muted; font-size: .7rem; }.repository-scoreboard dd { margin: .55rem 0 0; font-size: 1.2rem; font-weight: 720; }.repository-scoreboard .visit-count { display: flex; min-height: 24px; align-items: center; }.visit-count img { display: block; width: auto; max-width: 100%; height: 20px; }
.repository-topics { position: relative; display: flex; flex-wrap: wrap; gap: .45rem; margin-top: 1rem; }.repository-topics span { border: 1px solid @line; border-radius: @radius-pill; padding: .35rem .55rem; color: @text-muted; font-size: .68rem; }
.repository-card footer { position: relative; justify-content: space-between; gap: .8rem; margin-top: auto; padding-top: 1.2rem; color: @text-muted; font-size: .72rem; }.repository-card footer > span { gap: .4rem; }.repository-card footer a { display: grid; width: 42px; height: 42px; place-items: center; border-radius: @radius-control; background: @accent; color: @text; transition: transform 180ms ease; }.repository-card footer a:hover { transform: rotate(-7deg) scale(1.05); }.license { margin-left: auto; }

[data-style='tactics'] .repository-card { background: repeating-linear-gradient(90deg,rgba(255,255,255,.018) 0 12.5%,transparent 12.5% 25%),#111315; }
[data-style='tactics'] .repository-card::after { content: ''; position: absolute; inset: 5%; border: 1px solid rgba(244,244,245,.15); border-radius: @radius-control; pointer-events: none; }
[data-style='tactics'] .repository-copy { margin-top: 4rem; }.repository-showcase[data-style='tactics'] .repository-scoreboard { max-width: 580px; }
.legacy-repository-card { position: relative; display: block; width: 100%; border-radius: @radius-control; background: @surface; }.fallback-copy { position: relative; margin-top: 1.5rem; }.fallback-copy > span { color: @accent-strong; font-size: .7rem; letter-spacing: .12em; }.fallback-copy p { margin: .65rem 0 0; color: @text-muted; }.fallback-visitor-badge { display: block; width: auto; height: 20px; margin-top: 1rem; }.fallback-copy a { display: inline-flex; align-items: center; gap: .45rem; margin-top: 1rem; color: @text; font-weight: 650; text-decoration: none; }
.skeleton { background: linear-gradient(90deg,@surface-raised 25%,@surface-soft 46%,@surface-raised 66%); background-size: 220% 100%; animation: skeleton-sweep 1.2s ease-in-out infinite; }
.formation-switch-enter-active,.formation-switch-leave-active { transition: opacity 220ms ease,transform 360ms cubic-bezier(.16,1,.3,1); }.formation-switch-enter-from { opacity: 0; transform: translate3d(0,20px,0); }.formation-switch-leave-to { opacity: 0; transform: translate3d(0,-12px,0); }
@keyframes repository-enter { from { opacity: 0; transform: translate3d(0,34px,0) rotate(.5deg); } to { opacity: 1; transform: none; } }
@keyframes skeleton-sweep { to { background-position: -120% 0; } }

@media (max-width: 767px) {
  .showcase-heading { grid-template-columns: 1fr; align-items: start; }.style-switcher { width: 100%; overflow-x: auto; }.style-switcher button { flex: 1; justify-content: center; }
  .repository-grid { grid-template-columns: 1fr; }.repository-card { min-height: 500px; }.repository-scoreboard { grid-template-columns: repeat(2,1fr); }.license { display: none; }
}
@media (prefers-reduced-transparency: reduce) { .repository-card { background: @surface-raised; } }
@media (prefers-reduced-motion: reduce) { .repository-card,.repository-card::before,.repository-card footer a,.style-switcher button,.formation-switch-enter-active,.formation-switch-leave-active { animation: none; transition: none; transform: none; }.skeleton { animation: none; } }
</style>
