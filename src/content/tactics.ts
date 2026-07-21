import { loadPublicJson } from './publicConfig'
export type TacticalRole = 'forward' | 'midfielder' | 'defender' | 'keeper' | 'substitute'
export interface TacticalStats { pac: number; pas: number; dri: number; mock: true }
export interface TacticalSkill { id: string; name: string; preferredRole: Exclude<TacticalRole, 'substitute'>; note: string; stats: TacticalStats; coachNote: string }
export interface TacticalSlot { id: string; squad: 'starting' | 'bench'; role: TacticalRole; label: string; x?: number; y?: number }
export interface TacticalAssignment { slotId: string; skillId: string }
export const tacticalSkills: TacticalSkill[] = []
export const tacticalSlots: TacticalSlot[] = []
export const initialTacticalAssignments: TacticalAssignment[] = []
export const tacticalSwapCopy = {
  ready: '', vueReact: '', reset: '',
  benchPromotion: (incoming: string, outgoing: string) => `${incoming} 替补登场，换下 ${outgoing}。战术变更！触发化学反应！`,
  standard: (first: string, second: string) => `${first} 与 ${second} 完成换位，阵型已重新计算。`,
}
export async function loadTacticsConfig() {
  const data = await loadPublicJson<{ skills: TacticalSkill[]; slots: TacticalSlot[]; assignments: TacticalAssignment[]; copy: { ready: string; vueReact: string; reset: string; benchPromotionTemplate: string; standardTemplate: string } }>('tactics.json')
  tacticalSkills.splice(0, tacticalSkills.length, ...data.skills)
  tacticalSlots.splice(0, tacticalSlots.length, ...data.slots)
  initialTacticalAssignments.splice(0, initialTacticalAssignments.length, ...data.assignments)
  tacticalSwapCopy.ready = data.copy.ready
  tacticalSwapCopy.vueReact = data.copy.vueReact
  tacticalSwapCopy.reset = data.copy.reset
  tacticalSwapCopy.benchPromotion = (incoming, outgoing) => data.copy.benchPromotionTemplate.replace('{incoming}', incoming).replace('{outgoing}', outgoing)
  tacticalSwapCopy.standard = (first, second) => data.copy.standardTemplate.replace('{first}', first).replace('{second}', second)
}
