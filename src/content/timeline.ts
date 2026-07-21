import { loadPublicJson } from './publicConfig'
export interface Milestone { year: string; title: string; description: string }
export interface WorldieSupport { baseCount: number; storageKey: string; buttonLabel: string; persistedNote: string; sessionNote: string }
export const milestones: Milestone[] = []
export const worldieSupport: WorldieSupport = { baseCount: 0, storageKey: '', buttonLabel: '', persistedNote: '', sessionNote: '' }
export async function loadTimelineConfig() {
  const data = await loadPublicJson<{ milestones: Milestone[]; worldieSupport: WorldieSupport }>('timeline.json')
  milestones.splice(0, milestones.length, ...data.milestones)
  Object.assign(worldieSupport, data.worldieSupport)
}
