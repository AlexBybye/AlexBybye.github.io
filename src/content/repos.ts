import { loadPublicJson } from './publicConfig'
export interface FeaturedRepo { owner: string; name: string; visitorPageId: string; description: string; language: string; href: string; visitorBadgeUrl?: string; visitorBadgeLabel?: string; visitorBadgeAlt?: string }
export const featuredRepos: FeaturedRepo[] = []
export async function loadRepoConfig() {
  const data = await loadPublicJson<{ repositories: FeaturedRepo[] }>('repos.json')
  featuredRepos.splice(0, featuredRepos.length, ...data.repositories)
}
