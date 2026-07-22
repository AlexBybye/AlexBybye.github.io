<template>
  <section class="gitfut-duel" aria-labelledby="gitfut-duel-title">
    <header class="duel-heading">
      <div>
        <span class="mono">{{ t('profile.gitfutMatchup') }}</span>
        <h2 id="gitfut-duel-title">{{ t('profile.duelTitle') }}</h2>
        <p>{{ t('profile.duelDescription') }}</p>
      </div>
      <PhTrophy :size="46" weight="duotone" aria-hidden="true" />
    </header>

    <form class="duel-console" @submit.prevent="kickOff">
      <div class="duel-board" :class="{ ready: normalizedOpponent, launching: isLaunching }">
        <article class="duel-side home-side">
          <span class="side-label mono">{{ t('profile.home') }}</span>
          <img src="/images/avatar.webp" :alt="t('profile.avatarAlt')" loading="lazy" decoding="async">
          <div><strong>@AlexBybye</strong><span>{{ t('profile.teamName') }}</span></div>
        </article>

        <div class="kickoff-zone" aria-hidden="true">
          <span class="center-line" />
          <span class="center-circle" />
          <span class="kickoff-ball"><PhSoccerBall :size="34" weight="fill" /></span>
          <strong>{{ t('profile.vs') }}</strong>
        </div>

        <article class="duel-side rival-side">
          <span class="side-label mono">{{ t('profile.away') }}</span>
          <div class="rival-avatar"><PhGithubLogo :size="42" weight="fill" aria-hidden="true" /></div>
          <div>
            <strong>{{ normalizedOpponent ? `@${normalizedOpponent}` : '@opponent' }}</strong>
            <span>{{ normalizedOpponent ? t('profile.readyToPlay') : t('profile.enterUsername') }}</span>
          </div>
        </article>
      </div>

      <div class="duel-controls">
        <label for="gitfut-opponent">{{ t('profile.username') }}</label>
        <div class="duel-input-row">
          <span aria-hidden="true">@</span>
          <input id="gitfut-opponent" v-model="opponent" type="text" inputmode="text" autocomplete="off"
            maxlength="39" :placeholder="t('profile.usernamePlaceholder')" :aria-invalid="Boolean(error)" @input="error = ''">
          <button type="submit" :disabled="!normalizedOpponent || isLaunching">
            <PhSoccerBall :size="19" weight="fill" aria-hidden="true" />
            {{ isLaunching ? t('profile.launch') : t('profile.startDuel') }}
          </button>
        </div>
        <p v-if="error" class="duel-error" role="alert">{{ error }}</p>
        <p v-else class="duel-note">{{ t('profile.duelNote') }}</p>
      </div>
    </form>

    <Teleport to="body">
      <Transition name="duel-modal">
        <div v-if="isOpen" class="duel-overlay" @click.self="closeDuel">
          <section class="duel-window" role="dialog" aria-modal="true" aria-labelledby="duel-window-title">
            <header>
              <div>
                <span class="mono">{{ t('profile.gitfutMatchup') }}</span>
                <strong id="duel-window-title">{{ t('profile.duelTitleWithOpponent', { opponent: activeOpponent }) }}</strong>
              </div>
              <div class="window-actions">
                <a :href="duelUrl" target="_blank" rel="noreferrer">
                  {{ t('profile.openNewTab') }} <PhArrowSquareOut :size="17" aria-hidden="true" />
                </a>
                <button type="button" :aria-label="t('profile.closeDuel')" @click="closeDuel">
                  <PhX :size="21" weight="bold" aria-hidden="true" />
                </button>
              </div>
            </header>
            <iframe :src="duelUrl" :title="t('profile.duelTitleWithOpponent', { opponent: activeOpponent })" loading="eager" />
          </section>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhArrowSquareOut, PhGithubLogo, PhSoccerBall, PhTrophy, PhX } from '@/design/icons'

const opponent = ref('')
const { t } = useI18n()
const activeOpponent = ref('')
const duelUrl = ref('')
const error = ref('')
const isLaunching = ref(false)
const isOpen = ref(false)
let launchTimer = 0

const normalizedOpponent = computed(() => opponent.value.trim().replace(/^@+/, ''))

function validGithubName(value: string) {
  return /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value)
}

function kickOff() {
  const rival = normalizedOpponent.value
  if (!validGithubName(rival)) {
    error.value = t('profile.invalidUsername')
    return
  }

  isLaunching.value = true
  activeOpponent.value = rival
  window.clearTimeout(launchTimer)
  launchTimer = window.setTimeout(() => {
    duelUrl.value = `https://gitfut.com/AlexBybye/vs/${encodeURIComponent(rival)}`
    isOpen.value = true
    isLaunching.value = false
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 720)
}

function closeDuel() {
  isOpen.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) closeDuel()
}

watch(isOpen, (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.clearTimeout(launchTimer)
  window.removeEventListener('keydown', handleKeydown)
  document.documentElement.style.overflow = ''
})
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.gitfut-duel { position: relative; overflow: hidden; border: 1px solid @line; border-radius: @radius-card; padding: clamp(1.25rem,4vw,2.5rem); background: linear-gradient(120deg,rgba(227,6,19,.16),transparent 34%),@surface-raised; isolation: isolate; }
.gitfut-duel::before { position: absolute; inset: 0; z-index: -1; content: ''; background: repeating-linear-gradient(90deg,transparent 0 9.8%,rgba(244,244,245,.035) 10%); mask-image: linear-gradient(to bottom,transparent,#000 22%,#000 78%,transparent); pointer-events: none; }
.duel-heading { display: flex; justify-content: space-between; gap: 2rem; align-items: flex-start; }.duel-heading > div > span { color: @accent-strong; font-size: .7rem; letter-spacing: .12em; }.duel-heading h2 { max-width: 13ch; margin: .6rem 0 0; font-size: clamp(2.2rem,5vw,4.8rem); letter-spacing: -.065em; line-height: .9; }.duel-heading p { max-width: 48ch; margin: 1rem 0 0; color: @text-muted; line-height: 1.6; }.duel-heading > :deep(svg) { flex: 0 0 auto; color: @accent-strong; filter: drop-shadow(0 10px 18px rgba(227,6,19,.3)); }
.duel-console { margin-top: 2rem; }.duel-board { position: relative; display: grid; min-height: 250px; grid-template-columns: 1fr minmax(110px,.38fr) 1fr; overflow: hidden; border: 1px solid @line; border-radius: @radius-card; background: rgba(9,9,11,.82); }.duel-board::after { position: absolute; inset: 0; content: ''; background: linear-gradient(90deg,rgba(227,6,19,.12),transparent 38% 62%,rgba(244,244,245,.06)); opacity: .6; pointer-events: none; }
.duel-side { position: relative; z-index: 2; display: grid; align-content: center; justify-items: center; gap: 1rem; padding: 1.5rem; text-align: center; }.duel-side img,.rival-avatar { width: 92px; height: 92px; border: 2px solid rgba(244,244,245,.24); border-radius: 50%; background: @surface-soft; box-shadow: 0 0 0 8px rgba(227,6,19,.1); object-fit: cover; }.rival-avatar { display: grid; place-items: center; color: @text-muted; transition: color 260ms ease,transform 360ms cubic-bezier(.16,1,.3,1),box-shadow 260ms ease; }.duel-side strong,.duel-side span { display: block; }.duel-side strong { font-size: clamp(1.1rem,2vw,1.45rem); }.duel-side div > span { margin-top: .35rem; color: @text-muted; font-size: .68rem; letter-spacing: .08em; }.side-label { position: absolute; top: 1rem; color: @accent-strong; font-size: .65rem; letter-spacing: .14em; }.home-side .side-label { left: 1rem; }.rival-side .side-label { right: 1rem; }
.kickoff-zone { position: relative; z-index: 3; display: grid; place-items: center; border-inline: 1px solid @line; }.center-line { position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: rgba(244,244,245,.2); }.center-circle { position: absolute; width: 90px; aspect-ratio: 1; border: 1px solid rgba(244,244,245,.2); border-radius: 50%; }.kickoff-zone strong { position: absolute; bottom: 1.2rem; font-size: 1.4rem; font-style: italic; }.kickoff-ball { position: relative; z-index: 2; display: grid; width: 58px; height: 58px; place-items: center; border: 1px solid @line; border-radius: 50%; background: @surface-raised; color: @text; box-shadow: 0 12px 26px rgba(0,0,0,.42); }
.duel-board.ready .rival-avatar { color: @text; box-shadow: 0 0 0 8px rgba(227,6,19,.17),0 14px 34px rgba(0,0,0,.35); transform: scale(1.05); }.duel-board.ready .kickoff-ball { animation: ball-ready 1.5s ease-in-out infinite; }.duel-board.launching::before { position: absolute; inset: 0; z-index: 5; content: ''; background: linear-gradient(110deg,transparent 30%,rgba(244,244,245,.4) 48%,rgba(227,6,19,.35) 52%,transparent 70%); transform: translateX(-120%); animation: kickoff-flash 720ms cubic-bezier(.16,1,.3,1) both; pointer-events: none; }.duel-board.launching .kickoff-ball { animation: kickoff-shot 720ms cubic-bezier(.2,.9,.2,1) both; }
.duel-controls { margin-top: 1rem; }.duel-controls > label { display: block; margin-bottom: .55rem; color: @text-muted; font-size: .78rem; }.duel-input-row { display: grid; grid-template-columns: auto minmax(0,1fr) auto; align-items: center; overflow: hidden; border: 1px solid @line; border-radius: @radius-control; background: @surface; transition: border-color 180ms ease,box-shadow 180ms ease; }.duel-input-row:focus-within { border-color: @accent; box-shadow: inset 4px 0 0 @accent; }.duel-input-row > span { padding-left: 1rem; color: @accent-strong; font-weight: 800; }.duel-input-row input { min-width: 0; min-height: 54px; border: 0; padding: 0 .7rem; outline: 0; background: transparent; color: @text; font: inherit; }.duel-input-row input::placeholder { color: #71717a; }.duel-input-row button { display: inline-flex; min-height: 46px; align-items: center; gap: .45rem; margin-right: .35rem; border: 0; border-radius: @radius-control; padding: 0 1rem; background: @accent; color: @text; font-weight: 720; white-space: nowrap; cursor: pointer; transition: transform 180ms ease,background 180ms ease; }.duel-input-row button:hover:not(:disabled) { background: @accent-strong; transform: translateY(-1px); }.duel-input-row button:active:not(:disabled) { transform: scale(.97); }.duel-input-row button:disabled { opacity: .45; cursor: not-allowed; }.duel-error,.duel-note { margin: .7rem 0 0; font-size: .72rem; }.duel-error { color: @accent-strong; }.duel-note { color: @text-muted; }

.duel-overlay { position: fixed; inset: 0; z-index: 120; display: grid; place-items: center; padding: 1rem; background: rgba(3,3,5,.86); backdrop-filter: blur(10px); }.duel-window { display: grid; width: min(1500px,96vw); height: min(920px,94dvh); grid-template-rows: auto 1fr; overflow: hidden; border: 1px solid #52525b; border-radius: @radius-card; background: @surface; box-shadow: 0 32px 100px rgba(0,0,0,.7); }.duel-window > header { display: flex; min-height: 68px; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid @line; padding: .8rem 1rem; background: @surface-raised; }.duel-window header span,.duel-window header strong { display: block; }.duel-window header span { color: @accent-strong; font-size: .62rem; letter-spacing: .12em; }.duel-window header strong { margin-top: .25rem; }.window-actions { display: flex; align-items: center; gap: .55rem; }.window-actions a,.window-actions button { display: inline-flex; min-height: 42px; align-items: center; justify-content: center; gap: .4rem; border: 1px solid @line; border-radius: @radius-control; background: @surface; color: @text; text-decoration: none; }.window-actions a { padding: 0 .8rem; font-size: .78rem; }.window-actions button { width: 42px; padding: 0; cursor: pointer; }.duel-window iframe { width: 100%; height: 100%; border: 0; background: #070712; }
.duel-modal-enter-active,.duel-modal-leave-active { transition: opacity 260ms ease; }.duel-modal-enter-active .duel-window,.duel-modal-leave-active .duel-window { transition: transform 520ms cubic-bezier(.16,1,.3,1),opacity 260ms ease; }.duel-modal-enter-from,.duel-modal-leave-to { opacity: 0; }.duel-modal-enter-from .duel-window { opacity: 0; transform: translate3d(0,36px,0) scale(.96); }.duel-modal-leave-to .duel-window { opacity: 0; transform: translate3d(0,-20px,0) scale(.98); }

@keyframes ball-ready { 50% { transform: translateY(-6px) rotate(28deg); } }
@keyframes kickoff-shot { 0% { transform: none; } 36% { transform: translate3d(-36px,-28px,0) rotate(-110deg) scale(.82); } 100% { transform: translate3d(170px,-12px,0) rotate(520deg) scale(.45); opacity: 0; } }
@keyframes kickoff-flash { to { transform: translateX(120%); } }

@media (max-width: 767px) {
  .duel-heading > :deep(svg) { display: none; }.duel-board { min-height: 330px; grid-template-columns: 1fr 70px 1fr; }.duel-side { padding: 1rem .5rem; }.duel-side img,.rival-avatar { width: 66px; height: 66px; }.kickoff-zone { border-inline: 0; }.center-circle { width: 62px; }.kickoff-ball { width: 46px; height: 46px; }.duel-side strong { overflow-wrap: anywhere; font-size: .92rem; }.duel-side div > span { font-size: .55rem; }.duel-input-row { grid-template-columns: auto minmax(0,1fr); }.duel-input-row button { grid-column: 1 / -1; width: calc(100% - .7rem); margin: 0 .35rem .35rem; justify-content: center; }.duel-window { width: 100%; height: 96dvh; }.window-actions a { display: none; }
}
@media (prefers-reduced-transparency: reduce) { .duel-overlay { background: #09090b; backdrop-filter: none; } }
@media (prefers-reduced-motion: reduce) { .duel-board.ready .kickoff-ball,.duel-board.launching .kickoff-ball,.duel-board.launching::before { animation: none; }.rival-avatar,.duel-input-row,.duel-input-row button,.duel-modal-enter-active,.duel-modal-leave-active,.duel-modal-enter-active .duel-window,.duel-modal-leave-active .duel-window { transition: none; } }
</style>
