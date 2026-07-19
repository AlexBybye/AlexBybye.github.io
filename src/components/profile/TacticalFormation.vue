<template>
  <div class="tactical-board" :class="{ reacting: isReacting }">
    <header class="tactical-toolbar">
      <p id="tactical-instructions">
        拖拽技术卡完成换位。触摸屏或键盘用户可依次选择两张卡片的“调整”按钮。
      </p>
      <button type="button" :disabled="isInitialLineup" @click="resetLineup">
        <PhArrowsClockwise :size="17" weight="bold" aria-hidden="true" />
        恢复首发
      </button>
    </header>

    <div class="tactical-layout">
      <div
        class="formation"
        role="group"
        aria-label="技能栈 4-3-3 首发阵型"
        aria-describedby="tactical-instructions"
      >
        <article
          v-for="card in starterCards"
          :key="card.slot.id"
          class="tactical-card"
          :class="cardClasses(card.slot.id)"
          :style="{ '--x': `${card.slot.x}%`, '--y': `${card.slot.y}%` }"
          draggable="true"
          @dragstart="startDrag($event, card.slot.id)"
          @dragend="finishDrag"
          @dragenter.prevent="markDropTarget(card.slot.id)"
          @dragover.prevent
          @dragleave="leaveDropTarget($event, card.slot.id)"
          @drop.prevent="dropOn($event, card.slot.id)"
        >
          <span class="drag-grip mono" aria-hidden="true">Drag</span>
          <button
            type="button"
            class="skill-profile-trigger"
            :aria-label="`打开 ${card.skill.name} 的球星卡`"
            aria-haspopup="dialog"
            @click="openCard(card.skill, $event)"
          >
            <span>{{ card.skill.name }}</span>
            <small>{{ card.slot.label }}</small>
          </button>
          <button
            type="button"
            class="swap-trigger"
            :aria-label="swapButtonLabel(card)"
            :aria-pressed="armedSlotId === card.slot.id"
            @click="armSwap(card.slot.id)"
          >
            {{ armedSlotId === card.slot.id ? '已选' : '调整' }}
          </button>
          <span class="skill-note" aria-hidden="true">{{ card.skill.note }}</span>
        </article>

        <div class="center-circle" aria-hidden="true" />
        <div class="center-line" aria-hidden="true" />
        <div class="penalty-box top" aria-hidden="true" />
        <div class="penalty-box bottom" aria-hidden="true" />
      </div>

      <aside class="substitutes" aria-labelledby="substitutes-title">
        <div class="substitutes-heading">
          <div>
            <span class="mono">Tactical swap</span>
            <h3 id="substitutes-title">替补席</h3>
          </div>
          <strong class="mono">{{ benchCards.length }}</strong>
        </div>

        <div class="substitute-list">
          <article
            v-for="card in benchCards"
            :key="card.slot.id"
            class="tactical-card substitute-card"
            :class="cardClasses(card.slot.id)"
            draggable="true"
            @dragstart="startDrag($event, card.slot.id)"
            @dragend="finishDrag"
            @dragenter.prevent="markDropTarget(card.slot.id)"
            @dragover.prevent
            @dragleave="leaveDropTarget($event, card.slot.id)"
            @drop.prevent="dropOn($event, card.slot.id)"
          >
            <span class="drag-grip mono" aria-hidden="true">Drag</span>
            <button
              type="button"
              class="skill-profile-trigger"
              :aria-label="`打开 ${card.skill.name} 的球星卡`"
              aria-haspopup="dialog"
              @click="openCard(card.skill, $event)"
            >
              <span>{{ card.skill.name }}</span>
              <small>{{ card.skill.note }}</small>
            </button>
            <button
              type="button"
              class="swap-trigger"
              :aria-label="swapButtonLabel(card)"
              :aria-pressed="armedSlotId === card.slot.id"
              @click="armSwap(card.slot.id)"
            >
              {{ armedSlotId === card.slot.id ? '已选' : '调整' }}
            </button>
          </article>
        </div>
      </aside>
    </div>

    <p class="tactical-feedback" aria-live="polite" aria-atomic="true">{{ feedback }}</p>

    <Teleport to="body">
      <Transition name="skill-dialog">
        <div
          v-if="activeSkill"
          class="skill-dialog-backdrop"
          @click.self="closeCard"
          @keydown="handleDialogKeydown"
        >
          <section
            ref="dialogRef"
            class="skill-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="skill-dialog-title"
            aria-describedby="skill-dialog-description"
            tabindex="-1"
          >
            <header>
              <div>
                <span class="mono">Player card</span>
                <h3 id="skill-dialog-title">{{ activeSkill.name }} 球星卡</h3>
              </div>
              <button ref="closeButtonRef" type="button" aria-label="关闭球星卡" @click="closeCard">
                <PhX :size="20" weight="bold" aria-hidden="true" />
              </button>
            </header>
            <p id="skill-dialog-description" class="dialog-description">
              {{ activeSkill.note }}.
            </p>

            <div class="fifa-card-stage">
              <div class="fifa-card" :class="{ flipped: isCardFlipped }">
                <div class="fifa-card-face fifa-card-front" :aria-hidden="isCardFlipped">
                  <span class="card-position mono">{{ roleLabel(activeSkill.preferredRole) }}</span>
                  <strong>{{ activeSkill.name }}</strong>
                  <p>{{ activeSkill.note }}</p>
                  <span class="front-hint">卡片将自动翻面，展示技术属性。</span>
                </div>

                <div class="fifa-card-face fifa-card-back" :aria-hidden="!isCardFlipped">
                  <div class="card-back-heading">
                    <span class="mono">Skill ratings</span>
                    <strong>{{ activeSkill.name }}</strong>
                  </div>
                  <dl class="skill-stats">
                    <div>
                      <dt>PAC <span>熟练度</span></dt>
                      <dd class="mono">{{ activeSkill.stats.pac }}</dd>
                    </div>
                    <div>
                      <dt>PAS <span>工程架构</span></dt>
                      <dd class="mono">{{ activeSkill.stats.pas }}</dd>
                    </div>
                    <div>
                      <dt>DRI <span>实战填坑</span></dt>
                      <dd class="mono">{{ activeSkill.stats.dri }}</dd>
                    </div>
                  </dl>
                  <blockquote>
                    <span>教练评语</span>
                    <p>“{{ activeSkill.coachNote }}”</p>
                  </blockquote>
                </div>
              </div>
            </div>

            <footer>
              <button type="button" class="flip-again" @click="isCardFlipped = !isCardFlipped">
                {{ isCardFlipped ? '查看正面' : '查看属性' }}
              </button>
              <button type="button" class="dialog-close" @click="closeCard">关闭</button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { PhArrowsClockwise, PhX } from '@/design/icons'
import {
  initialTacticalAssignments,
  tacticalSkills,
  tacticalSlots,
  tacticalSwapCopy,
} from '@/content/tactics'
import type { TacticalAssignment, TacticalSkill, TacticalSlot } from '@/content/tactics'

interface SlotCard {
  slot: TacticalSlot
  skill: TacticalSkill
}

const assignments = ref<TacticalAssignment[]>(
  initialTacticalAssignments.map((assignment) => ({ ...assignment })),
)
const armedSlotId = ref('')
const draggingSlotId = ref('')
const dropTargetSlotId = ref('')
const feedback = ref<string>(tacticalSwapCopy.ready)
const isReacting = ref(false)
const activeSkill = ref<TacticalSkill | null>(null)
const isCardFlipped = ref(false)
const dialogRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)

const skillById = new Map(tacticalSkills.map((skill) => [skill.id, skill]))
const slotById = new Map(tacticalSlots.map((slot) => [slot.id, slot]))
const starterSlots = tacticalSlots.filter((slot) => slot.squad === 'starting')
const benchSlots = tacticalSlots.filter((slot) => slot.squad === 'bench')

const starterCards = computed(() => starterSlots.map(cardForSlot))
const benchCards = computed(() => benchSlots.map(cardForSlot))
const isInitialLineup = computed(() =>
  initialTacticalAssignments.every((initial) => {
    return (
      assignments.value.find((assignment) => assignment.slotId === initial.slotId)?.skillId ===
      initial.skillId
    )
  }),
)

let reactionTimer: ReturnType<typeof setTimeout> | undefined
let flipFrame = 0
let lastFocusedElement: HTMLElement | null = null
let previousBodyOverflow = ''

function cardForSlot(slot: TacticalSlot): SlotCard {
  const assignment = assignments.value.find((item) => item.slotId === slot.id)
  const skill = assignment ? skillById.get(assignment.skillId) : undefined
  if (!skill) throw new Error(`Missing tactical assignment for ${slot.id}`)
  return { slot, skill }
}

function cardClasses(slotId: string) {
  return {
    'is-armed': armedSlotId.value === slotId,
    'is-dragging': draggingSlotId.value === slotId,
    'is-drop-target': dropTargetSlotId.value === slotId && draggingSlotId.value !== slotId,
  }
}

function swapButtonLabel(card: SlotCard) {
  if (armedSlotId.value === card.slot.id) return `取消选择 ${card.skill.name}`
  if (armedSlotId.value) return `将 ${card.skill.name} 与已选择的技术交换`
  return `选择 ${card.skill.name} 进行战术调整`
}

function armSwap(slotId: string) {
  if (!armedSlotId.value) {
    armedSlotId.value = slotId
    const skill = cardForSlot(slotById.get(slotId) as TacticalSlot).skill
    feedback.value = `${skill.name} 已进入调整状态。请选择另一张技术卡完成换位。`
    return
  }

  if (armedSlotId.value === slotId) {
    armedSlotId.value = ''
    feedback.value = tacticalSwapCopy.ready
    return
  }

  swapAssignments(armedSlotId.value, slotId)
}

function startDrag(event: DragEvent, slotId: string) {
  draggingSlotId.value = slotId
  armedSlotId.value = ''
  event.dataTransfer?.setData('text/plain', slotId)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function markDropTarget(slotId: string) {
  if (draggingSlotId.value && draggingSlotId.value !== slotId) dropTargetSlotId.value = slotId
}

function leaveDropTarget(event: DragEvent, slotId: string) {
  const current = event.currentTarget as HTMLElement
  const next = event.relatedTarget as Node | null
  if (next && current.contains(next)) return
  if (dropTargetSlotId.value === slotId) dropTargetSlotId.value = ''
}

function dropOn(event: DragEvent, targetSlotId: string) {
  const sourceSlotId = draggingSlotId.value || event.dataTransfer?.getData('text/plain') || ''
  if (sourceSlotId && sourceSlotId !== targetSlotId) swapAssignments(sourceSlotId, targetSlotId)
  finishDrag()
}

function finishDrag() {
  draggingSlotId.value = ''
  dropTargetSlotId.value = ''
}

function swapAssignments(firstSlotId: string, secondSlotId: string) {
  const firstIndex = assignments.value.findIndex((assignment) => assignment.slotId === firstSlotId)
  const secondIndex = assignments.value.findIndex(
    (assignment) => assignment.slotId === secondSlotId,
  )
  if (firstIndex < 0 || secondIndex < 0) return

  const firstSkill = skillById.get(assignments.value[firstIndex].skillId)
  const secondSkill = skillById.get(assignments.value[secondIndex].skillId)
  const firstSlot = slotById.get(firstSlotId)
  const secondSlot = slotById.get(secondSlotId)
  if (!firstSkill || !secondSkill || !firstSlot || !secondSlot) return

  assignments.value[firstIndex].skillId = secondSkill.id
  assignments.value[secondIndex].skillId = firstSkill.id

  const pair = new Set([firstSkill.id, secondSkill.id])
  if (pair.has('vue') && pair.has('react')) {
    feedback.value = tacticalSwapCopy.vueReact
  } else if (firstSlot.squad !== secondSlot.squad) {
    const incoming = firstSlot.squad === 'bench' ? firstSkill : secondSkill
    const outgoing = firstSlot.squad === 'starting' ? firstSkill : secondSkill
    feedback.value = tacticalSwapCopy.benchPromotion(incoming.name, outgoing.name)
  } else {
    feedback.value = tacticalSwapCopy.standard(firstSkill.name, secondSkill.name)
  }

  armedSlotId.value = ''
  triggerReaction()
}

function triggerReaction() {
  if (reactionTimer) clearTimeout(reactionTimer)
  isReacting.value = false
  void nextTick(() => {
    isReacting.value = true
    reactionTimer = setTimeout(() => {
      isReacting.value = false
    }, 520)
  })
}

function resetLineup() {
  assignments.value = initialTacticalAssignments.map((assignment) => ({ ...assignment }))
  armedSlotId.value = ''
  feedback.value = tacticalSwapCopy.reset
  triggerReaction()
}

function roleLabel(role: TacticalSkill['preferredRole']) {
  if (role === 'forward') return 'FWD'
  if (role === 'midfielder') return 'MID'
  if (role === 'defender') return 'DEF'
  return 'GK'
}

async function openCard(skill: TacticalSkill, event: MouseEvent) {
  lastFocusedElement = event.currentTarget as HTMLElement
  activeSkill.value = skill
  isCardFlipped.value = false
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  await nextTick()
  closeButtonRef.value?.focus()

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isCardFlipped.value = true
    return
  }

  cancelAnimationFrame(flipFrame)
  flipFrame = requestAnimationFrame(() => {
    flipFrame = requestAnimationFrame(() => {
      isCardFlipped.value = true
    })
  })
}

function closeCard() {
  cancelAnimationFrame(flipFrame)
  activeSkill.value = null
  isCardFlipped.value = false
  document.body.style.overflow = previousBodyOverflow
  void nextTick(() => lastFocusedElement?.focus())
}

function handleDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeCard()
    return
  }
  if (event.key !== 'Tab' || !dialogRef.value) return

  const focusable = Array.from(
    dialogRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    ),
  )
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onBeforeUnmount(() => {
  if (reactionTimer) clearTimeout(reactionTimer)
  cancelAnimationFrame(flipFrame)
  if (activeSkill.value) document.body.style.overflow = previousBodyOverflow
})
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.tactical-board {
  display: grid;
  gap: 1rem;
}
.tactical-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.tactical-toolbar p {
  max-width: 68ch;
  margin: 0;
  color: @text-muted;
  font-size: 0.82rem;
  line-height: 1.55;
}
.tactical-toolbar > button,
.skill-dialog footer button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 1px solid @line;
  border-radius: @radius-control;
  padding: 0.6rem 0.8rem;
  background: @surface-raised;
  color: @text;
  font-weight: 680;
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}
.tactical-toolbar > button:hover:not(:disabled),
.skill-dialog footer button:hover {
  border-color: #71717a;
  background: @surface-soft;
}
.tactical-toolbar > button:active:not(:disabled),
.skill-dialog footer button:active {
  transform: scale(0.98);
}
.tactical-toolbar > button:disabled {
  color: #71717a;
  cursor: not-allowed;
  opacity: 0.7;
}

.tactical-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(230px, 0.3fr);
  gap: 1rem;
  align-items: stretch;
}
.formation {
  position: relative;
  height: min(65vw, 650px);
  min-height: 560px;
  overflow: hidden;
  border: 1px solid #45454b;
  border-radius: @radius-card;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.018) 50%, transparent 50%),
    repeating-linear-gradient(90deg, #151719 0 12.5%, #111315 12.5% 25%);
}
.formation::before {
  content: '';
  position: absolute;
  inset: 5%;
  border: 1px solid rgba(244, 244, 245, 0.34);
  border-radius: 3px;
}
.center-line {
  position: absolute;
  top: 5%;
  bottom: 5%;
  left: 50%;
  border-left: 1px solid rgba(244, 244, 245, 0.34);
}
.center-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18%;
  aspect-ratio: 1;
  border: 1px solid rgba(244, 244, 245, 0.34);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
.penalty-box {
  position: absolute;
  left: 35%;
  width: 30%;
  height: 13%;
  border: 1px solid rgba(244, 244, 245, 0.34);
}
.penalty-box.top {
  top: 5%;
  border-top: 0;
}
.penalty-box.bottom {
  bottom: 5%;
  border-bottom: 0;
}

.tactical-card {
  position: absolute;
  z-index: 2;
  top: var(--y);
  left: var(--x);
  display: grid;
  width: clamp(128px, 10vw, 142px);
  min-height: 74px;
  grid-template-columns: 1fr auto;
  gap: 0.35rem;
  border: 1px solid #52525b;
  border-bottom-color: @accent;
  border-radius: @radius-control;
  padding: 0.45rem;
  background: #202024;
  color: @text;
  transform: translate(-50%, -50%);
  cursor: grab;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  transition:
    border-color 180ms ease,
    background 180ms ease,
    opacity 180ms ease,
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}
.tactical-card:active {
  cursor: grabbing;
}
.tactical-card.is-armed {
  border-color: @accent-strong;
  background: #35171b;
  transform: translate(-50%, -50%) scale(1.055);
}
.tactical-card.is-dragging {
  opacity: 0.45;
}
.tactical-card.is-drop-target {
  border-color: @text;
  background: #35171b;
  transform: translate(-50%, -50%) scale(1.08);
}
.drag-grip {
  grid-column: 1 / -1;
  color: #8d8d96;
  font-size: 0.48rem;
  letter-spacing: 0.14em;
}
.skill-profile-trigger {
  min-width: 0;
  border: 0;
  padding: 0;
  background: transparent;
  color: @text;
  text-align: left;
  cursor: pointer;
}
.skill-profile-trigger span,
.skill-profile-trigger small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.skill-profile-trigger span {
  font-size: 0.82rem;
  font-weight: 740;
}
.skill-profile-trigger small {
  margin-top: 0.25rem;
  color: @text-muted;
  font-size: 0.57rem;
}
.swap-trigger {
  align-self: end;
  border: 1px solid #52525b;
  border-radius: 7px;
  padding: 0.24rem 0.3rem;
  background: #111113;
  color: @text-muted;
  font-size: 0.55rem;
  font-weight: 700;
  cursor: pointer;
}
.swap-trigger[aria-pressed='true'] {
  border-color: @accent-strong;
  background: @accent;
  color: @text;
}
.skill-note {
  position: absolute;
  bottom: calc(100% + 0.55rem);
  left: 50%;
  z-index: 4;
  width: 190px;
  border: 1px solid @line;
  border-radius: @radius-control;
  padding: 0.7rem;
  background: @surface;
  color: @text-muted;
  font-size: 0.72rem;
  font-weight: 450;
  line-height: 1.45;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 8px);
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.tactical-card:hover .skill-note,
.tactical-card:focus-within .skill-note {
  opacity: 1;
  transform: translate(-50%, 0);
}

.substitutes {
  display: flex;
  min-width: 0;
  flex-direction: column;
  border: 1px solid @line;
  border-radius: @radius-card;
  padding: 1rem;
  background: linear-gradient(145deg, rgba(227, 6, 19, 0.08), transparent 38%), @surface-raised;
}
.substitutes-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid @line;
  padding-bottom: 1rem;
}
.substitutes-heading span {
  color: @accent-strong;
  font-size: 0.58rem;
  letter-spacing: 0.11em;
}
.substitutes-heading h3 {
  margin: 0.4rem 0 0;
  font-size: 1.25rem;
}
.substitutes-heading strong {
  display: grid;
  width: 32px;
  aspect-ratio: 1;
  place-items: center;
  border-radius: @radius-control;
  background: @accent;
  font-size: 0.8rem;
}
.substitute-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}
.substitute-card {
  position: relative;
  top: auto;
  left: auto;
  width: 100%;
  min-height: 98px;
  transform: none;
}
.substitute-card.is-armed,
.substitute-card.is-drop-target {
  transform: scale(1.025);
}
.substitute-card .skill-profile-trigger small {
  white-space: normal;
  line-height: 1.35;
}
.substitute-card .skill-note {
  display: none;
}
.tactical-feedback {
  min-height: 24px;
  margin: 0;
  border-left: 3px solid @accent;
  padding: 0.35rem 0 0.35rem 0.8rem;
  color: @text-muted;
  font-size: 0.82rem;
  line-height: 1.5;
}

@media (prefers-reduced-motion: no-preference) {
  .tactical-board.reacting .formation,
  .tactical-board.reacting .substitutes {
    animation: tactical-reaction 480ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}
@keyframes tactical-reaction {
  48% {
    transform: scale(0.992);
  }
}

.skill-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  overflow-y: auto;
  place-items: center;
  padding: 1rem;
  background: rgba(3, 3, 5, 0.88);
  backdrop-filter: blur(10px);
}
.skill-dialog {
  width: min(760px, 100%);
  border: 1px solid #52525b;
  border-radius: @radius-card;
  padding: clamp(1rem, 3vw, 1.5rem);
  background: @surface;
  color: @text;
  box-shadow: 0 32px 100px rgba(0, 0, 0, 0.7);
}
.skill-dialog > header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}
.skill-dialog > header span {
  color: @accent-strong;
  font-size: 0.62rem;
  letter-spacing: 0.11em;
}
.skill-dialog > header h3 {
  margin: 0.4rem 0 0;
  font-size: clamp(1.45rem, 4vw, 2rem);
}
.skill-dialog > header button {
  display: grid;
  width: 42px;
  min-width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid @line;
  border-radius: @radius-control;
  background: @surface-raised;
  color: @text;
  cursor: pointer;
}
.dialog-description {
  max-width: 60ch;
  margin: 0.75rem 0 0;
  color: @text-muted;
  font-size: 0.75rem;
  line-height: 1.5;
}
.fifa-card-stage {
  width: min(360px, 100%);
  min-height: 450px;
  margin: 1.25rem auto;
  perspective: 1200px;
}
.fifa-card {
  position: relative;
  min-height: 450px;
  transform-style: preserve-3d;
  transition: transform 720ms cubic-bezier(0.16, 1, 0.3, 1);
}
.fifa-card.flipped {
  transform: rotateY(180deg);
}
.fifa-card-face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border: 1px solid #6b6b73;
  border-radius: @radius-card;
  padding: clamp(1.25rem, 4vw, 2rem);
  backface-visibility: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 24px 50px rgba(0, 0, 0, 0.38);
}
.fifa-card-front {
  display: flex;
  flex-direction: column;
  justify-content: end;
  background:
    radial-gradient(circle at 70% 16%, rgba(244, 244, 245, 0.14), transparent 30%),
    repeating-linear-gradient(125deg, transparent 0 22px, rgba(255, 255, 255, 0.025) 22px 23px),
    #18181b;
}
.fifa-card-front::before {
  content: '';
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  width: 120px;
  aspect-ratio: 1;
  border: 1px solid rgba(244, 244, 245, 0.16);
  border-radius: 50%;
}
.card-position {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  color: @accent-strong;
  font-size: 1rem;
}
.fifa-card-front strong {
  position: relative;
  font-size: clamp(2.7rem, 10vw, 4.6rem);
  letter-spacing: -0.075em;
  line-height: 0.86;
  overflow-wrap: anywhere;
}
.fifa-card-front p {
  position: relative;
  margin: 1rem 0 0;
  color: @text-muted;
  line-height: 1.5;
}
.front-hint {
  position: relative;
  margin-top: 1.2rem;
  border-top: 1px solid @line;
  padding-top: 1rem;
  color: #8d8d96;
  font-size: 0.72rem;
  line-height: 1.45;
}
.fifa-card-back {
  display: flex;
  flex-direction: column;
  background: linear-gradient(150deg, rgba(227, 6, 19, 0.18), transparent 36%), #18181b;
  transform: rotateY(180deg);
}
.card-back-heading span {
  color: @accent-strong;
  font-size: 0.6rem;
  letter-spacing: 0.11em;
}
.card-back-heading strong {
  display: block;
  margin-top: 0.5rem;
  font-size: 1.7rem;
  letter-spacing: -0.04em;
}
.skill-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.55rem;
  margin: 1.5rem 0;
}
.skill-stats div {
  min-width: 0;
  border: 1px solid @line;
  border-radius: @radius-control;
  padding: 0.75rem 0.5rem;
  background: rgba(9, 9, 11, 0.72);
  text-align: center;
}
.skill-stats dt {
  color: @text-muted;
  font-size: 0.68rem;
  font-weight: 720;
}
.skill-stats dt span {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.55rem;
  font-weight: 500;
}
.skill-stats dd {
  margin: 0.55rem 0 0;
  color: @text;
  font-size: 1.65rem;
  font-weight: 760;
}
.fifa-card-back blockquote {
  margin: 0;
  border-left: 3px solid @accent;
  padding: 0.1rem 0 0.1rem 0.85rem;
}
.fifa-card-back blockquote span {
  color: @accent-strong;
  font-size: 0.7rem;
  font-weight: 720;
}
.fifa-card-back blockquote p {
  margin: 0.55rem 0 0;
  color: @text;
  line-height: 1.55;
}
.skill-dialog > footer {
  display: flex;
  justify-content: center;
  gap: 0.65rem;
}
.skill-dialog footer .flip-again {
  border-color: @accent;
  background: @accent;
}
.skill-dialog footer .dialog-close {
  background: @surface-raised;
}
.skill-dialog-enter-active,
.skill-dialog-leave-active {
  transition: opacity 180ms ease;
}
.skill-dialog-enter-active .skill-dialog,
.skill-dialog-leave-active .skill-dialog {
  transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}
.skill-dialog-enter-from,
.skill-dialog-leave-to {
  opacity: 0;
}
.skill-dialog-enter-from .skill-dialog,
.skill-dialog-leave-to .skill-dialog {
  transform: translate3d(0, 18px, 0) scale(0.98);
}

button:focus-visible,
[tabindex='-1']:focus-visible {
  outline: 2px solid @text;
  outline-offset: 3px;
}

@media (max-width: 767px) {
  .tactical-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
  .tactical-toolbar > button {
    width: 100%;
  }
  .tactical-layout {
    grid-template-columns: 1fr;
  }
  .formation {
    display: grid;
    height: auto;
    min-height: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.7rem;
    padding: 1rem;
    background: @surface-raised;
  }
  .formation::before,
  .center-line,
  .center-circle,
  .penalty-box {
    display: none;
  }
  .tactical-card {
    position: relative;
    top: auto;
    left: auto;
    width: 100%;
    min-height: 92px;
    transform: none;
    touch-action: manipulation;
  }
  .tactical-card.is-armed,
  .tactical-card.is-drop-target {
    transform: scale(1.02);
  }
  .skill-note {
    display: none;
  }
  .substitute-list {
    grid-template-columns: 1fr;
  }
  .skill-dialog-backdrop {
    place-items: start center;
  }
  .skill-dialog {
    margin-block: auto;
  }
  .fifa-card-stage,
  .fifa-card {
    min-height: 420px;
  }
  .skill-dialog > footer {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .tactical-layout {
    grid-template-columns: 1fr;
  }
  .substitute-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .formation {
    grid-template-columns: 1fr;
  }
  .skill-stats {
    gap: 0.35rem;
  }
  .skill-stats div {
    padding-inline: 0.35rem;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .skill-dialog-backdrop {
    backdrop-filter: none;
    background: rgba(3, 3, 5, 0.96);
  }
  .substitutes,
  .fifa-card-front,
  .fifa-card-back {
    background: @surface-raised;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tactical-card,
  .skill-note,
  .tactical-toolbar > button,
  .skill-dialog footer button,
  .fifa-card,
  .skill-dialog-enter-active,
  .skill-dialog-leave-active,
  .skill-dialog-enter-active .skill-dialog,
  .skill-dialog-leave-active .skill-dialog {
    animation: none;
    transition: none;
  }
}
</style>
