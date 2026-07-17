<template>
  <div class="about-page">
    <div class="page-shell">
      <section class="about-hero" aria-labelledby="about-title">
        <div class="hero-story">
          <div class="hero-copy">
            <span class="hero-hello mono">Hello, there.</span>
            <h1 id="about-title"><span>LIN_</span><span>ECLIPSE</span></h1>
          </div>
          <p>{{ profile.bio }}</p>
          <div class="push-rail" aria-hidden="true"><span /></div>
        </div>

        <div class="profile-reveal">
          <article ref="portrait" class="legacy-profile-card">
            <div class="legacy-profile-heading">
              <div class="avatar-frame">
                <img :src="profile.avatar" :alt="`${profile.name} 的头像`" fetchpriority="high" decoding="async">
              </div>
              <div>
                <span class="profile-question mono">Hey! But, who am I?</span>
                <h2>L i n _ e c l i p s e</h2>
                <p>{{ profile.title }}</p>
              </div>
            </div>

            <dl class="legacy-identity-list">
              <div>
                <dt><PhGraduationCap :size="19" aria-hidden="true" />Education</dt>
                <dd><a :href="profile.university" target="_blank" rel="noreferrer">SCUT</a><span>CS Undergraduate</span></dd>
              </div>
              <div>
                <dt><PhMapPin :size="19" aria-hidden="true" />Location</dt>
                <dd>{{ profile.location }}</dd>
              </div>
              <div>
                <dt><PhCode :size="19" aria-hidden="true" />QQ ID</dt>
                <dd class="mono">{{ profile.qqId }}</dd>
              </div>
            </dl>

            <a class="legacy-github" :href="profile.github" target="_blank" rel="noreferrer">
              <PhGithubLogo :size="21" weight="fill" aria-hidden="true" />
              <span>GitHub</span>
              <strong>{{ profile.handle }}</strong>
              <PhArrowRight :size="18" weight="bold" aria-hidden="true" />
            </a>
          </article>
        </div>
      </section>

      <Section title="A 4-3-3 built from tools" description="The formation turns the stack into roles: attacking languages, connective frameworks, and a dependable toolchain.">
        <RevealOnScroll>
          <div class="formation" aria-label="技能栈 4-3-3 阵型图">
            <button v-for="skill in skills" :key="skill.name" type="button" class="skill-player"
              :class="[`role-${skill.role}`, { selected: selectedSkill === skill.name }]"
              :style="{ '--x': `${skill.x}%`, '--y': `${skill.y}%` }"
              :aria-pressed="selectedSkill === skill.name" @click="selectSkill(skill.name)">
              <span>{{ skill.name }}</span>
              <small>{{ skill.note }}</small>
            </button>
            <div class="center-circle" aria-hidden="true" />
            <div class="center-line" aria-hidden="true" />
            <div class="penalty-box top" aria-hidden="true" />
            <div class="penalty-box bottom" aria-hidden="true" />
          </div>
        </RevealOnScroll>
      </Section>

      <Section title="Move the ball through the milestones" description="Each click advances the play and reveals one part of the journey.">
        <RevealOnScroll>
          <div class="timeline-stage">
            <div class="timeline-pitch">
              <div class="progress-track" aria-hidden="true">
                <span :style="{ '--progress': `${timelineProgress}%` }" />
                <PhSoccerBall class="progress-ball" :style="{ '--progress': `${timelineProgress}%` }" :size="34" weight="fill" />
              </div>
              <article class="milestone-card" aria-live="polite">
                <span class="milestone-year mono">{{ activeMilestone.year }}</span>
                <h3>{{ activeMilestone.title }}</h3>
                <p>{{ activeMilestone.description }}</p>
              </article>
              <div class="timeline-controls">
                <span class="mono">{{ activeMilestoneIndex + 1 }} / {{ milestones.length }}</span>
                <button type="button" @click="advanceMilestone">
                  {{ activeMilestoneIndex === milestones.length - 1 ? '重新开球' : '下一步' }}
                  <PhArrowRight :size="19" weight="bold" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </Section>

      <Section title="Outside the editor">
        <div class="interest-layout">
          <RevealOnScroll class="interest-photo">
            <img src="/resources/bayern_team_UCL.webp" alt="拜仁慕尼黑球队合影" loading="lazy" decoding="async">
          </RevealOnScroll>
          <div class="interest-list">
            <RevealOnScroll v-for="(interest, index) in interests" :key="interest.title" :delay="index * 55">
              <article :class="{ 'football-interest': interest.kind === 'football' }">
                <component :is="interestIcon(interest.kind)" :size="24" weight="bold" aria-hidden="true" />
                <div>
                  <h3>{{ interest.title }}</h3>
                  <p>{{ interest.detail }}</p>
                  <button v-if="interest.kind === 'football'" class="mia-badge" :class="{ playing: isMiaSanMiaPlaying }"
                    type="button" :aria-label="isMiaSanMiaPlaying ? '暂停 Mia San Mia' : '播放 Mia San Mia'"
                    :aria-pressed="isMiaSanMiaPlaying" @click="playSong">
                    <PhPause v-if="isMiaSanMiaPlaying" :size="17" weight="fill" aria-hidden="true" />
                    <PhMusicNote v-else :size="17" weight="bold" aria-hidden="true" />
                    <span>Mia San Mia</span>
                    <span class="badge-bars" aria-hidden="true"><i /><i /><i /></span>
                  </button>
                </div>
              </article>
            </RevealOnScroll>
          </div>
        </div>
      </Section>

      <RevealOnScroll class="pulse-section">
        <AttackPulse :username="profile.handle" />
      </RevealOnScroll>

      <RevealOnScroll class="duel-section">
        <GitFutDuel />
      </RevealOnScroll>

      <RepositoryShowcase :repositories="featuredRepos" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  PhArrowRight,
  PhCamera,
  PhCode,
  PhGithubLogo,
  PhGraduationCap,
  PhMapPin,
  PhMountains,
  PhMusicNote,
  PhPause,
  PhSoccerBall
} from '@/design/icons'
import { featuredRepos } from '@/content/repos'
import { interests, profile, skills } from '@/content/profile'
import { milestones } from '@/content/timeline'
import { useMusicStore } from '@/stores/musicStore'
import AttackPulse from '@/components/profile/AttackPulse.vue'
import GitFutDuel from '@/components/profile/GitFutDuel.vue'
import RepositoryShowcase from '@/components/profile/RepositoryShowcase.vue'
import RevealOnScroll from '@/components/ui/RevealOnScroll.vue'
import Section from '@/components/ui/Section.vue'

const musicStore = useMusicStore()
const portrait = ref<HTMLElement | null>(null)
const selectedSkill = ref('')
const activeMilestoneIndex = ref(0)
let portraitFrame = 0

const targetFileName = 'Andrew White feat Harry - FC Bayern, Forever Number One (Original German Mix).mp3'
const isMiaSanMiaPlaying = computed(() => musicStore.currentTrack?.filename === targetFileName && musicStore.isPlaying)
const activeMilestone = computed(() => milestones[activeMilestoneIndex.value])
const timelineProgress = computed(() => milestones.length === 1 ? 100 : (activeMilestoneIndex.value / (milestones.length - 1)) * 100)

function selectSkill(name: string) {
  selectedSkill.value = selectedSkill.value === name ? '' : name
}

function interestIcon(kind: string) {
  if (kind === 'football') return PhSoccerBall
  if (kind === 'camera') return PhCamera
  if (kind === 'music') return PhMusicNote
  return PhMountains
}

async function playSong() {
  if (!musicStore.tracks.length) await musicStore.loadTracks()
  const index = musicStore.tracks.findIndex((track) => track.filename === targetFileName)
  if (index < 0) return
  if (musicStore.currentTrackIndex === index) musicStore.togglePlay()
  else musicStore.playTrack(index)
}

async function advanceMilestone() {
  if (activeMilestoneIndex.value === milestones.length - 1) {
    activeMilestoneIndex.value = 0
    return
  }
  activeMilestoneIndex.value += 1
  if (activeMilestoneIndex.value === milestones.length - 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const { default: confetti } = await import('canvas-confetti')
    confetti({ particleCount: 90, spread: 62, origin: { x: 0.72, y: 0.48 }, colors: ['#e30613', '#f4f4f5', '#71717a'] })
  }
}

function handlePortraitMove(event: PointerEvent) {
  if (!portrait.value) return
  const element = portrait.value
  const rect = element.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12
  cancelAnimationFrame(portraitFrame)
  portraitFrame = requestAnimationFrame(() => {
    element.style.transform = `translate3d(${x}px, ${y}px, 0) rotateX(${-y * 0.25}deg) rotateY(${x * 0.25}deg)`
  })
}

function resetPortrait() {
  if (!portrait.value) return
  cancelAnimationFrame(portraitFrame)
  portraitFrame = requestAnimationFrame(() => { if (portrait.value) portrait.value.style.transform = '' })
}

onMounted(() => {
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    portrait.value?.addEventListener('pointermove', handlePortraitMove)
    portrait.value?.addEventListener('pointerleave', resetPortrait)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(portraitFrame)
  portrait.value?.removeEventListener('pointermove', handlePortraitMove)
  portrait.value?.removeEventListener('pointerleave', resetPortrait)
})
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.about-page { min-height: 100dvh; background: @surface; color: @text; }
.about-page > .page-shell { padding-block: 0; }
.about-hero {
  display: grid; grid-template-columns: minmax(0, 1.04fr) minmax(390px, .96fr); gap: clamp(3rem, 8vw, 7rem);
  min-height: calc(100dvh - 86px); align-items: center; padding-block: clamp(1.5rem, 3vw, 2.6rem);
}
.hero-story { position: relative; z-index: 2; }
.hero-hello { display: block; margin-bottom: 1rem; color: @accent-strong; font-size: .78rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.hero-copy h1 { display: grid; max-width: 8ch; margin: 0; font-size: clamp(4rem, 8.8vw, 8rem); font-weight: 760; letter-spacing: -.09em; line-height: .76; }
.hero-copy h1 span:last-child { color: transparent; -webkit-text-stroke: 1px rgba(244,244,245,.86); }
.hero-story > p { max-width: 46ch; margin: 2rem 0 0; color: @text-muted; font-size: clamp(1rem, 1.45vw, 1.12rem); line-height: 1.65; }
.push-rail { position: absolute; top: 48%; left: calc(100% + 1.2rem); width: clamp(54px, 7vw, 100px); height: 20px; transform: translateY(-50%); }
.push-rail span { position: absolute; top: 9px; left: 0; width: 100%; height: 2px; background: @accent; transform: scaleX(0); transform-origin: left; }
.push-rail::after { content: ''; position: absolute; top: 3px; right: -1px; width: 14px; height: 14px; border-top: 2px solid @accent; border-right: 2px solid @accent; opacity: 0; transform: rotate(45deg) translate3d(-9px,9px,0); }

.profile-reveal { position: relative; overflow: hidden; border-radius: 18px; padding: 2px; }
.profile-reveal::before { content: ''; position: absolute; z-index: 3; top: -18%; bottom: -18%; left: -30%; width: 24%; background: @accent; opacity: 0; pointer-events: none; transform: skewX(-9deg) translate3d(-120%,0,0); }
.legacy-profile-card {
  position: relative; border: 1px solid @line; border-radius: 16px; padding: clamp(1.25rem, 2.7vw, 2rem);
  background: linear-gradient(145deg, rgba(255,255,255,.045), transparent 42%), @surface-raised;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 28px 70px rgba(0,0,0,.32);
  transition: transform 260ms cubic-bezier(.16,1,.3,1); transform-style: preserve-3d;
}
.legacy-profile-heading { display: grid; grid-template-columns: 118px 1fr; gap: 1.25rem; align-items: center; }
.avatar-frame { position: relative; width: 118px; aspect-ratio: 1; overflow: hidden; border: 3px solid rgba(244,244,245,.25); border-radius: 50%; background: @surface-soft; box-shadow: 0 0 0 7px rgba(227,6,19,.12); }
.avatar-frame img { width: 100%; height: 100%; object-fit: cover; filter: saturate(.78) contrast(1.06); }
.profile-question { color: @accent-strong; font-size: .7rem; letter-spacing: .08em; }
.legacy-profile-heading h2 { margin: .65rem 0 .45rem; font-size: clamp(1.35rem, 2.8vw, 2rem); letter-spacing: -.045em; line-height: 1; }
.legacy-profile-heading p { margin: 0; color: @text-muted; font-size: .88rem; line-height: 1.45; }
.legacy-identity-list { display: grid; gap: 1px; margin: 1.6rem 0 0; overflow: hidden; border: 1px solid @line; border-radius: 12px; background: @line; }
.legacy-identity-list > div { display: grid; grid-template-columns: minmax(118px,.7fr) 1fr; gap: 1rem; align-items: center; padding: .82rem 1rem; background: @surface; }
.legacy-identity-list dt { display: flex; align-items: center; gap: .45rem; color: @text-muted; font-size: .74rem; }
.legacy-identity-list dd { display: flex; min-width: 0; align-items: center; justify-content: space-between; gap: .8rem; margin: 0; font-size: .88rem; font-weight: 650; }
.legacy-identity-list dd span { overflow: hidden; color: @text-muted; font-weight: 450; text-overflow: ellipsis; white-space: nowrap; }
.legacy-identity-list a { color: @accent-strong; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.legacy-github { display: grid; min-height: 48px; grid-template-columns: auto auto 1fr auto; gap: .65rem; align-items: center; margin-top: 1rem; border-radius: 12px; padding: .75rem 1rem; background: @accent; color: @text; text-decoration: none; }
.legacy-github span { font-size: .78rem; }.legacy-github strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.legacy-github :deep(svg:last-child) { transition: transform 180ms ease; }.legacy-github:hover :deep(svg:last-child) { transform: translateX(4px); }

@media (prefers-reduced-motion: no-preference) {
  .hero-copy { animation: hero-type-arrival 760ms 80ms cubic-bezier(.16,1,.3,1) both; }
  .hero-story > p { animation: hero-type-arrival 720ms 300ms cubic-bezier(.16,1,.3,1) both; }
  .push-rail span { animation: push-rail 680ms 560ms cubic-bezier(.16,1,.3,1) both; }
  .push-rail::after { animation: push-arrow 460ms 890ms cubic-bezier(.16,1,.3,1) both; }
  .legacy-profile-card { animation: legacy-card-push 940ms 650ms cubic-bezier(.16,1,.3,1) both; }
  .profile-reveal::before { animation: profile-slice 900ms 540ms cubic-bezier(.7,0,.2,1) both; }
}
@keyframes hero-type-arrival { from { opacity: 0; transform: translate3d(-72px,0,0); } to { opacity: 1; transform: none; } }
@keyframes push-rail { to { transform: scaleX(1); } }
@keyframes push-arrow { to { opacity: 1; transform: rotate(45deg) translate3d(0,0,0); } }
@keyframes legacy-card-push { from { opacity: 0; transform: translate3d(-45%,0,0) rotate(-2deg); } to { opacity: 1; transform: translate3d(0,0,0) rotate(0); } }
@keyframes profile-slice { 0% { opacity: 1; transform: skewX(-9deg) translate3d(-120%,0,0); } 62% { opacity: 1; } 100% { opacity: 0; transform: skewX(-9deg) translate3d(680%,0,0); } }

.formation { position: relative; height: min(72vw, 680px); overflow: hidden; border: 1px solid #45454b; border-radius: 16px; background: linear-gradient(90deg, rgba(255,255,255,.018) 50%, transparent 50%), repeating-linear-gradient(90deg, #151719 0 12.5%, #111315 12.5% 25%); }
.formation::before { content: ''; position: absolute; inset: 5%; border: 1px solid rgba(244,244,245,.34); border-radius: 3px; }
.center-line { position: absolute; top: 5%; bottom: 5%; left: 50%; border-left: 1px solid rgba(244,244,245,.34); }
.center-circle { position: absolute; top: 50%; left: 50%; width: 18%; aspect-ratio: 1; border: 1px solid rgba(244,244,245,.34); border-radius: 50%; transform: translate(-50%, -50%); }
.penalty-box { position: absolute; left: 35%; width: 30%; height: 13%; border: 1px solid rgba(244,244,245,.34); }
.penalty-box.top { top: 5%; border-top: 0; } .penalty-box.bottom { bottom: 5%; border-bottom: 0; }
.skill-player { position: absolute; z-index: 2; top: var(--y); left: var(--x); min-width: 74px; min-height: 44px; border: 1px solid #52525b; border-radius: 12px; padding: .55rem .7rem; background: #202024; color: @text; font-weight: 680; transform: translate(-50%, -50%); cursor: pointer; transition: transform 180ms ease, border-color 180ms ease, background 180ms ease; }
.skill-player small { position: absolute; bottom: calc(100% + .6rem); left: 50%; width: 190px; border: 1px solid @line; border-radius: 12px; padding: .75rem; background: @surface; color: @text-muted; font-weight: 450; line-height: 1.45; opacity: 0; pointer-events: none; transform: translate(-50%, 8px); transition: opacity 160ms ease, transform 160ms ease; }
.skill-player:hover, .skill-player.selected { border-color: @accent; background: #2b171a; transform: translate(-50%, -50%) scale(1.05); }
.skill-player:hover small, .skill-player.selected small { opacity: 1; transform: translate(-50%, 0); }
.role-forward { border-bottom-color: @accent; }

.timeline-stage { padding: clamp(1.2rem, 4vw, 2.5rem); border: 1px solid @line; border-radius: 16px; background: @surface-raised; }
.timeline-pitch { display: grid; grid-template-columns: 1.25fr .75fr; gap: 2rem; align-items: center; }
.progress-track { position: relative; grid-column: 1 / -1; height: 42px; margin-inline: 16px; }
.progress-track::before { content: ''; position: absolute; top: 50%; right: 0; left: 0; height: 2px; background: @line; }
.progress-track span { position: absolute; top: 50%; left: 0; width: var(--progress); height: 2px; background: @accent; transition: width 600ms cubic-bezier(.16,1,.3,1); }
.progress-ball { position: absolute; top: 50%; left: var(--progress); color: @text; filter: drop-shadow(0 8px 12px rgba(227,6,19,.25)); transform: translate(-50%, -50%); transition: left 600ms cubic-bezier(.16,1,.3,1), transform 300ms ease; }
.milestone-card { min-height: 190px; padding: 1.5rem; border-radius: 16px; background: @surface-soft; }
.milestone-year { color: @accent-strong; font-size: .85rem; }
.milestone-card h3 { margin: .8rem 0 .6rem; font-size: clamp(1.5rem, 3vw, 2.2rem); letter-spacing: -.04em; }
.milestone-card p { max-width: 52ch; margin: 0; color: @text-muted; line-height: 1.6; }
.timeline-controls { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.timeline-controls > span { color: @text-muted; }
.timeline-controls button { display: inline-flex; min-height: 46px; align-items: center; gap: .55rem; border: 0; border-radius: 12px; padding: .75rem 1rem; background: @accent; color: @text; font-weight: 680; white-space: nowrap; cursor: pointer; }

.interest-layout { display: grid; grid-template-columns: 1.15fr .85fr; gap: clamp(1rem, 3vw, 2.5rem); align-items: stretch; }
.interest-photo { min-height: 430px; overflow: hidden; border: 1px solid @line; border-radius: 16px; }
.interest-photo img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(.35) saturate(.76); transition: transform 800ms cubic-bezier(.16,1,.3,1); }
.interest-photo:hover img { transform: scale(1.025); }
.interest-list { display: grid; gap: 1px; overflow: hidden; border: 1px solid @line; border-radius: 16px; background: @line; }
.interest-list article { display: grid; grid-template-columns: auto 1fr; gap: 1rem; height: 100%; align-items: center; padding: 1.25rem; background: @surface-raised; }
.interest-list h3 { margin: 0; font-size: 1.05rem; } .interest-list p { margin: .3rem 0 0; color: @text-muted; line-height: 1.5; }
.football-interest { position: relative; }
.mia-badge { display: inline-flex; min-height: 38px; align-items: center; gap: .5rem; margin-top: .75rem; border: 1px solid #ff5963; border-radius: 999px; padding: .48rem .75rem; background: @accent; color: @text; font-size: .78rem; font-weight: 740; white-space: nowrap; cursor: pointer; box-shadow: inset 0 1px 0 rgba(255,255,255,.22); transition: transform 180ms ease, background 180ms ease; }
.mia-badge:hover { background: #bd0712; transform: translateY(-2px); }
.badge-bars { display: inline-flex; height: 15px; align-items: end; gap: 2px; margin-left: .15rem; }
.badge-bars i { display: block; width: 2px; height: 100%; border-radius: 2px; background: currentColor; opacity: .88; transform: scaleY(.22); transform-origin: bottom; }
.mia-badge.playing .badge-bars i { animation: badge-beat 620ms ease-in-out infinite alternate; }
.mia-badge.playing .badge-bars i:nth-child(2) { animation-delay: -320ms; }.mia-badge.playing .badge-bars i:nth-child(3) { animation-delay: -470ms; }
@keyframes badge-beat { to { transform: scaleY(1); } }
.pulse-section { padding-block: clamp(4.5rem,9vw,8rem); border-top: 1px solid @line; }
.duel-section { padding-bottom: clamp(4.5rem,9vw,8rem); }

@media (max-width: 767px) {
  .page-shell { width: min(100% - 1.25rem, 1200px); }
  .about-hero { grid-template-columns: 1fr; gap: 2.5rem; min-height: auto; padding-block: 2.5rem; }
  .hero-copy h1 { font-size: clamp(4rem, 21vw, 6rem); line-height: .79; }
  .hero-story > p { margin-top: 1.5rem; }
  .push-rail { display: none; }
  .profile-reveal { width: 100%; max-width: 560px; }
  .legacy-profile-heading { grid-template-columns: 86px 1fr; }
  .avatar-frame { width: 86px; }
  .legacy-profile-heading h2 { font-size: clamp(1.2rem, 5.5vw, 1.65rem); }
  .legacy-identity-list > div { grid-template-columns: 102px 1fr; }
  .legacy-identity-list dd span { display: none; }
  @media (prefers-reduced-motion: no-preference) { .legacy-profile-card { animation-name: legacy-card-rise; } }
  .formation { height: auto; min-height: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: .75rem; padding: 1rem; background: @surface-raised; }
  .formation::before, .center-line, .center-circle, .penalty-box { display: none; }
  .skill-player { position: relative; top: auto; left: auto; width: 100%; transform: none; }
  .skill-player:hover, .skill-player.selected { transform: none; }
  .skill-player small { position: static; display: none; width: auto; margin-top: .4rem; border: 0; padding: 0; background: transparent; opacity: 1; transform: none; }
  .skill-player.selected small { display: block; transform: none; }
  .timeline-pitch { grid-template-columns: 42px 1fr; align-items: stretch; }
  .progress-track { grid-row: 1 / span 2; grid-column: 1; width: 42px; height: 100%; margin: 0; }
  .progress-track::before { top: 0; bottom: 0; left: 50%; width: 2px; height: auto; }
  .progress-track span { top: 0; left: 50%; width: 2px; height: var(--progress); transition: height 600ms cubic-bezier(.16,1,.3,1); }
  .progress-ball { top: var(--progress); left: 50%; transition: top 600ms cubic-bezier(.16,1,.3,1); }
  .milestone-card { grid-column: 2; min-height: 230px; }
  .timeline-controls { grid-column: 2; flex-direction: column; align-items: stretch; }
  .timeline-controls button { justify-content: center; }
  .interest-layout { grid-template-columns: 1fr; }
  .interest-photo { min-height: 260px; }
}

@keyframes legacy-card-rise { from { opacity: 0; transform: translate3d(0,28px,0); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .legacy-profile-card, .legacy-github :deep(svg:last-child), .mia-badge, .interest-photo img, .progress-track span, .progress-ball { transition: none; }
  .hero-copy, .hero-story > p, .legacy-profile-card, .profile-reveal::before, .push-rail span, .push-rail::after { animation: none; opacity: 1; transform: none; }
  .mia-badge.playing .badge-bars i { animation: none; transform: scaleY(.72); }
}
</style>
