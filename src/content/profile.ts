import { loadPublicJson } from './publicConfig'

export interface Profile { name: string; handle: string; title: string; location: string; qqId: string; avatar: string; bio: string; github: string; university: string }
export interface Interest { title: string; detail: string; kind: string }
export const profile: Profile = { name: '', handle: '', title: '', location: '', qqId: '', avatar: '', bio: '', github: '', university: '' }
export const interests: Interest[] = []
export async function loadProfileConfig() {
  const data = await loadPublicJson<{ profile: Profile; interests: Interest[] }>('profile.json')
  Object.assign(profile, data.profile)
  interests.splice(0, interests.length, ...data.interests)
}
