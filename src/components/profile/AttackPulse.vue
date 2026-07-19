<template>
  <section class="attack-pulse" aria-labelledby="attack-pulse-title">
    <header class="pulse-heading">
      <div class="football-mark" aria-hidden="true"><PhSoccerBall :size="32" weight="fill" /></div>
      <div>
        <span class="mono">GitHub activity</span>
        <h2 id="attack-pulse-title">进攻心率图</h2>
        <p>最近 42 天公开账号动作，按进攻强度聚合。</p>
      </div>
      <button v-if="summary" type="button" aria-label="重播进攻心率图" @click="replayChart">
        <PhArrowsClockwise :size="19" weight="bold" aria-hidden="true" />重播进攻
      </button>
    </header>

    <div v-if="loading" class="pulse-loading" aria-label="正在读取 GitHub 公开动作"><span /><span /><span /></div>

    <div v-else-if="error" class="pulse-fallback">
      <img :src="fallbackGraph" alt="AlexBybye 在线 GitHub 活动图" loading="lazy" decoding="async">
      <div><strong>公共事件接口暂不可用</strong><p>当前显示 GitHub 活动图备用视图。</p></div>
    </div>

    <template v-else-if="summary">
      <dl class="attack-scoreboard">
        <div><dt>进攻动作</dt><dd class="mono">{{ summary.totalActions }}</dd></div>
        <div><dt>活跃比赛日</dt><dd class="mono">{{ summary.activeDays }}</dd></div>
        <div><dt>涉及仓库</dt><dd class="mono">{{ summary.repositories }}</dd></div>
        <div><dt>主要打法</dt><dd>{{ summary.topEvent }}</dd></div>
      </dl>

      <div class="pulse-chart">
        <div ref="chartCanvas" class="chart-canvas">
        <PhSoccerBall v-if="peakPoint" class="peak-ball" :class="{ lit: peakLit }" :size="28" weight="fill" aria-hidden="true"
          :style="{ left: `${peakPoint.x / 1000 * 100}%`, top: `${peakPoint.y / 270 * 100}%` }" />
        <svg :key="animationKey" viewBox="0 0 1000 270" role="img" :aria-label="chartDescription" preserveAspectRatio="none">
          <defs>
            <linearGradient id="attack-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#e30613" stop-opacity=".32" />
              <stop offset="1" stop-color="#e30613" stop-opacity="0" />
            </linearGradient>
            <clipPath id="attack-reveal" clipPathUnits="userSpaceOnUse">
              <rect class="pulse-reveal" x="0" y="0" width="1000" height="270" />
            </clipPath>
          </defs>
          <g class="pitch-grid" aria-hidden="true">
            <line v-for="line in 5" :key="`horizontal-${line}`" x1="20" :y1="line * 45" x2="980" :y2="line * 45" />
            <line v-for="line in 7" :key="`vertical-${line}`" :x1="line * 125" y1="18" :x2="line * 125" y2="245" />
            <circle cx="500" cy="132" r="58" />
          </g>
          <g clip-path="url(#attack-reveal)">
            <path class="pulse-area" :d="areaPath" />
            <path class="pulse-line" :d="linePath" />
          </g>
          <g class="attack-points">
            <circle v-for="point in activePoints" :key="point.date" :cx="point.x" :cy="point.y" r="5" tabindex="0"
              :aria-label="`${point.label}，${point.actions} 次进攻动作`">
              <title>{{ point.label }}: {{ point.actions }} 次进攻动作</title>
            </circle>
          </g>
        </svg>
        </div>
        <div class="date-axis mono"><span>{{ summary.days[0].label }}</span><span>{{ summary.days[Math.floor(summary.days.length / 2)].label }}</span><span>{{ summary.days.at(-1)?.label }}</span></div>
      </div>

      <footer class="pulse-note">
        <PhPulse :size="20" weight="bold" aria-hidden="true" />
        <span>GitHub 公开动作全局快照，每 12 小时刷新一次。</span>
        <span class="mono">{{ summary.stale ? '待更新' : '已更新' }} {{ formatLastAction(summary.fetchedAt) }}</span>
      </footer>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { PhArrowsClockwise, PhPulse, PhSoccerBall } from '@/design/icons'
import { loadAttackSummary } from '@/service/githubPublic'
import type { AttackSummary } from '@/service/githubPublic'

const props = defineProps<{ username: string }>()
const summary = ref<AttackSummary | null>(null)
const loading = ref(true)
const error = ref('')
const animationKey = ref(0)
const chartCanvas = ref<HTMLElement | null>(null)
const peakLit = ref(false)
let peakTimer = 0
// 与 .pulse-reveal 的 CSS 动画保持同源：linear 擦除，时机 = x 占比 × 总时长
const REVEAL_MS = 2500
const fallbackGraph = computed(() => {
  const query = new URLSearchParams({ username: props.username, bg_color: '18181b', color: 'f4f4f5', line: 'e30613', point: 'ff3340', area: 'true', hide_border: 'true' })
  return `https://github-readme-activity-graph.vercel.app/graph?${query}`
})

const chartPoints = computed(() => {
  if (!summary.value) return []
  const max = Math.max(1, ...summary.value.days.map((day) => day.actions))
  return summary.value.days.map((day, index) => ({
    ...day,
    x: 20 + index / Math.max(1, summary.value!.days.length - 1) * 960,
    y: 236 - day.actions / max * 198
  }))
})
const linePath = computed(() => chartPoints.value.map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' '))
const areaPath = computed(() => chartPoints.value.length ? `${linePath.value} L 980 250 L 20 250 Z` : '')
const activePoints = computed(() => chartPoints.value.filter((point) => point.actions > 0))
const peakPoint = computed(() => {
  if (!chartPoints.value.length) return null
  return chartPoints.value.reduce((peak, point) => (point.actions > peak.actions ? point : peak))
})
const chartDescription = computed(() => summary.value ? `AlexBybye 最近 42 天共有 ${summary.value.totalActions} 次加权公开动作，${summary.value.activeDays} 个活跃日。` : '')

async function firePeakConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!chartCanvas.value || !peakPoint.value) return
  const rect = chartCanvas.value.getBoundingClientRect()
  const originX = (rect.left + (peakPoint.value.x / 1000) * rect.width) / window.innerWidth
  const originY = (rect.top + (peakPoint.value.y / 270) * rect.height) / window.innerHeight
  const { default: confetti } = await import('canvas-confetti')
  confetti({ particleCount: 90, spread: 62, startVelocity: 42, origin: { x: originX, y: originY }, colors: ['#e30613', '#f4f4f5', '#71717a'] })
  peakLit.value = true
  window.setTimeout(() => { peakLit.value = false }, 620)
}

function replayChart() {
  animationKey.value += 1
  window.clearTimeout(peakTimer)
  peakLit.value = false
  if (!peakPoint.value) return
  // linear 擦除：擦除边扫到最高点 x 的时刻 = x 占比 × 总时长
  const progress = (peakPoint.value.x - 20) / 960
  peakTimer = window.setTimeout(firePeakConfetti, progress * REVEAL_MS)
}
function formatLastAction(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}
onMounted(async () => {
  try { summary.value = await loadAttackSummary(props.username) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'GitHub 数据读取失败' }
  finally { loading.value = false }
})

onBeforeUnmount(() => { window.clearTimeout(peakTimer) })
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.attack-pulse { position: relative; overflow: hidden; border: 1px solid @line; border-radius: @radius-card; padding: clamp(1.25rem,4vw,2.5rem); background: linear-gradient(145deg,rgba(227,6,19,.1),transparent 38%),@surface-raised; }
.attack-pulse::before { content: ''; position: absolute; top: -22%; right: 8%; width: 2px; height: 145%; background: @accent; opacity: .35; transform: rotate(24deg); pointer-events: none; }
.pulse-heading { position: relative; display: grid; grid-template-columns: auto 1fr auto; gap: 1rem; align-items: center; }
.football-mark { display: grid; width: 58px; height: 58px; place-items: center; border: 1px solid @line; border-radius: 50%; background: @surface; color: @text; box-shadow: inset 0 0 0 7px rgba(227,6,19,.12); }
.pulse-heading > div:nth-child(2) > span { color: @accent-strong; font-size: .7rem; letter-spacing: .12em; }.pulse-heading h2 { margin: .45rem 0 0; font-size: clamp(2.2rem,5vw,4.5rem); letter-spacing: -.065em; line-height: .9; }.pulse-heading p { margin: .8rem 0 0; color: @text-muted; }
.pulse-heading > button { display: inline-flex; min-height: 44px; align-items: center; gap: .45rem; border: 1px solid @line; border-radius: @radius-control; padding: .65rem .8rem; background: @surface; color: @text; font-weight: 650; white-space: nowrap; cursor: pointer; transition: border-color 180ms ease,transform 180ms ease; }.pulse-heading > button:hover { border-color: @accent; transform: translateY(-2px); }.pulse-heading > button:active { transform: scale(.97); }
.attack-scoreboard { position: relative; display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; margin: 2rem 0 0; overflow: hidden; border: 1px solid @line; border-radius: @radius-control; background: @line; }.attack-scoreboard div { padding: 1rem; background: rgba(9,9,11,.82); }.attack-scoreboard dt { color: @text-muted; font-size: .72rem; }.attack-scoreboard dd { margin: .55rem 0 0; font-size: clamp(1.15rem,2vw,1.55rem); font-weight: 720; }
.pulse-chart { position: relative; margin-top: 1.25rem; overflow: hidden; border: 1px solid @line; border-radius: @radius-control; padding: .75rem .8rem .55rem; background: rgba(9,9,11,.78); }
.chart-canvas { position: relative; }
.pulse-chart .peak-ball { position: absolute; z-index: 2; width: 22px; height: 22px; color: @text; transform: translate(-50%, -50%); filter: drop-shadow(0 0 6px rgba(227,6,19,.85)) drop-shadow(0 1px 3px rgba(0,0,0,.5)); pointer-events: none; transition: filter 180ms ease; }
.pulse-chart .peak-ball.lit { animation: peak-strike 620ms cubic-bezier(.16,1,.3,1); }
@keyframes peak-strike { 0% { filter: drop-shadow(0 0 6px rgba(227,6,19,.85)) drop-shadow(0 1px 3px rgba(0,0,0,.5)); transform: translate(-50%,-50%) scale(1); } 30% { filter: drop-shadow(0 0 18px rgba(255,51,64,1)) drop-shadow(0 0 34px rgba(227,6,19,.7)); transform: translate(-50%,-50%) scale(1.28); } 100% { filter: drop-shadow(0 0 6px rgba(227,6,19,.85)) drop-shadow(0 1px 3px rgba(0,0,0,.5)); transform: translate(-50%,-50%) scale(1); } }
.pulse-chart svg { display: block; width: 100%; height: clamp(230px,30vw,340px); overflow: visible; }.pitch-grid line,.pitch-grid circle { fill: none; stroke: rgba(244,244,245,.1); stroke-width: 1; vector-effect: non-scaling-stroke; }.pulse-area { fill: url(#attack-area); }.pulse-line { fill: none; stroke: @accent-strong; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }.pulse-reveal { transform-box: fill-box; transform-origin: left center; animation: reveal-attack 2.5s linear both; }.attack-points circle { fill: @text; stroke: @accent; stroke-width: 4; vector-effect: non-scaling-stroke; transform-box: fill-box; transform-origin: center; transition: transform 180ms ease,fill 180ms ease; }.attack-points circle:hover,.attack-points circle:focus { fill: @accent-strong; transform: scale(1.7); outline: none; }
.date-axis { display: flex; justify-content: space-between; color: @text-muted; font-size: .65rem; }.pulse-note { display: flex; align-items: center; gap: .55rem; margin-top: 1rem; color: @text-muted; font-size: .75rem; }.pulse-note .mono { margin-left: auto; white-space: nowrap; }
.pulse-loading { display: grid; gap: .8rem; margin-top: 2rem; }.pulse-loading span { display: block; height: 42px; border-radius: @radius-control; background: @surface-soft; animation: pulse-loading 1s ease-in-out infinite alternate; }.pulse-loading span:last-child { height: 260px; }
.pulse-fallback { display: grid; grid-template-columns: 1.3fr .7fr; gap: 1.5rem; align-items: center; margin-top: 2rem; }.pulse-fallback img { width: 100%; border-radius: @radius-control; background: @surface; }.pulse-fallback strong { font-size: 1.1rem; }.pulse-fallback p { margin: .6rem 0 0; color: @text-muted; line-height: 1.5; }
@keyframes reveal-attack { from { transform: scaleX(0); } to { transform: scaleX(1); } } @keyframes pulse-loading { to { opacity: .48; } }
@media (prefers-reduced-motion: no-preference) { .football-mark :deep(svg) { animation: football-pulse 2.4s ease-in-out infinite; } } @keyframes football-pulse { 50% { transform: rotate(28deg) scale(1.08); } }
@media (max-width: 767px) { .pulse-heading { grid-template-columns: auto 1fr; }.pulse-heading > button { grid-column: 1 / -1; justify-content: center; }.attack-scoreboard { grid-template-columns: repeat(2,1fr); }.pulse-fallback { grid-template-columns: 1fr; }.pulse-note { align-items: flex-start; flex-wrap: wrap; }.pulse-note .mono { width: 100%; margin-left: 0; } }
@media (prefers-reduced-motion: reduce) { .pulse-reveal,.football-mark :deep(svg),.pulse-loading span,.peak-ball.lit { animation: none; }.attack-points circle,.pulse-heading > button { transition: none; } }
</style>
