import { getGithubToken } from '../auth/githubOAuth'
import { ensureDiscussion } from './commentsRepo'
import { githubGraphql } from './githubGraphql'
import { loadPublicDiscussion } from './publicSnapshot'

export interface ReactionState {
  count: number
  viewerHasReacted: boolean
  offline: boolean
}

const cache = new Map<string, ReactionState>()

export async function getReactionState(targetId: string, subjectId?: string): Promise<ReactionState> {
  const key = subjectId || targetId
  if (!getGithubToken()) {
    const publicThread = await loadPublicDiscussion(targetId)
    return publicThread
      ? { count: subjectId ? (publicThread.comments.find((comment) => comment.id === subjectId)?.reactionCount || 0) : publicThread.reactionCount, viewerHasReacted: false, offline: false }
      : cache.get(key) || { count: 0, viewerHasReacted: false, offline: true }
  }
  const id = subjectId || (await ensureDiscussion(targetId)).id
  const data = await githubGraphql<{
    node: { reactionGroups: Array<{ content: string; viewerHasReacted: boolean; users: { totalCount: number } }> }
  }>(`query ReactionState($id: ID!) {
    node(id: $id) {
      ... on Reactable { reactionGroups { content viewerHasReacted users { totalCount } } }
    }
  }`, { id })
  const thumbsUp = data.node.reactionGroups.find((group) => group.content === 'THUMBS_UP')
  const state = { count: thumbsUp?.users.totalCount || 0, viewerHasReacted: thumbsUp?.viewerHasReacted || false, offline: false }
  cache.set(key, state)
  return state
}

export async function toggleReaction(targetId: string, current: ReactionState, subjectId?: string) {
  const id = subjectId || (await ensureDiscussion(targetId)).id
  const mutation = current.viewerHasReacted ? 'removeReaction' : 'addReaction'
  await githubGraphql(`mutation ToggleSiteReaction($id: ID!) {
    ${mutation}(input: { subjectId: $id, content: THUMBS_UP }) { reaction { content } }
  }`, { id })
  const next = {
    count: Math.max(0, current.count + (current.viewerHasReacted ? -1 : 1)),
    viewerHasReacted: !current.viewerHasReacted,
    offline: false
  }
  cache.set(subjectId || targetId, next)
  return next
}
