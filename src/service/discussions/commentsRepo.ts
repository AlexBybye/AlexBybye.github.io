import { getGithubToken } from '../auth/githubOAuth'
import { getGithubRepositoryConfig, githubGraphql } from './githubGraphql'
import { loadPublicDiscussion } from './publicSnapshot'

export interface SocialComment {
  id: string
  author: string
  avatarUrl: string
  authorUrl: string
  body: string
  createdAt: string
  viewerDidAuthor: boolean
  reactionCount: number
  viewerHasReacted: boolean
}

export interface DiscussionThread {
  id: string
  number: number
  slug: string
  comments: SocialComment[]
}

interface DiscussionMeta {
  id: string
  number: number
  title: string
}

const threadCache = new Map<string, DiscussionMeta>()

function cacheKey(slug: string) {
  return `lin_eclipse.social.${slug}`
}

function readOffline(slug: string): DiscussionThread | null {
  try {
    const value = localStorage.getItem(cacheKey(slug))
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

function writeOffline(thread: DiscussionThread) {
  try {
    localStorage.setItem(cacheKey(thread.slug), JSON.stringify(thread))
  } catch {
    // Storage can be disabled. The network result remains usable.
  }
}

async function findDiscussion(slug: string): Promise<DiscussionMeta | null> {
  if (threadCache.has(slug)) return threadCache.get(slug)!
  const { owner, name } = getGithubRepositoryConfig()
  const title = `[site:${slug}]`
  const data = await githubGraphql<{
    repository: { discussions: { nodes: DiscussionMeta[] } }
  }>(`query FindSiteDiscussion($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      discussions(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes { id number title }
      }
    }
  }`, { owner, name })
  const match = data.repository.discussions.nodes.find((node) => node.title === title) || null
  if (match) threadCache.set(slug, match)
  return match
}

async function createDiscussion(slug: string): Promise<DiscussionMeta> {
  const { owner, name, category } = getGithubRepositoryConfig()
  const repository = await githubGraphql<{
    repository: { id: string; discussionCategories: { nodes: Array<{ id: string; slug: string }> } }
  }>(`query SiteDiscussionSetup($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      discussionCategories(first: 25) { nodes { id slug } }
    }
  }`, { owner, name })
  const categoryNode = repository.repository.discussionCategories.nodes.find((node) => node.slug === category)
    || repository.repository.discussionCategories.nodes[0]
  if (!categoryNode) throw new Error('Enable GitHub Discussions and create a discussion category first')

  const result = await githubGraphql<{
    createDiscussion: { discussion: DiscussionMeta }
  }>(`mutation CreateSiteDiscussion($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
    createDiscussion(input: { repositoryId: $repositoryId, categoryId: $categoryId, title: $title, body: $body }) {
      discussion { id number title }
    }
  }`, {
    repositoryId: repository.repository.id,
    categoryId: categoryNode.id,
    title: `[site:${slug}]`,
    body: `Comments and reactions for ${slug}. Managed by the Lin_eclipse personal site.`
  })
  threadCache.set(slug, result.createDiscussion.discussion)
  return result.createDiscussion.discussion
}

export async function ensureDiscussion(slug: string) {
  const existing = await findDiscussion(slug)
  return existing || createDiscussion(slug)
}

export async function loadComments(slug: string): Promise<{ thread: DiscussionThread | null; offline: boolean }> {
  if (!getGithubToken()) {
    const publicThread = await loadPublicDiscussion(slug)
    if (publicThread) return { thread: { ...publicThread, comments: publicThread.comments.map((comment) => ({ ...comment, viewerDidAuthor: false, viewerHasReacted: false })) }, offline: false }
    return { thread: readOffline(slug), offline: true }
  }
  try {
    const meta = await findDiscussion(slug)
    if (!meta) return { thread: { id: '', number: 0, slug, comments: [] }, offline: false }
    const { owner, name } = getGithubRepositoryConfig()
    const data = await githubGraphql<{
      repository: { discussion: { id: string; number: number; comments: { nodes: Array<{
        id: string
        body: string
        createdAt: string
        viewerDidAuthor: boolean
        author: { login: string; avatarUrl: string; url: string } | null
        reactionGroups: Array<{ content: string; viewerHasReacted: boolean; users: { totalCount: number } }>
      }> } } }
    }>(`query SiteComments($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        discussion(number: $number) {
          id number
          comments(first: 20) {
            nodes {
              id body createdAt viewerDidAuthor
              author { login avatarUrl url }
              reactionGroups { content viewerHasReacted users { totalCount } }
            }
          }
        }
      }
    }`, { owner, name, number: meta.number })
    const discussion = data.repository.discussion
    const thread: DiscussionThread = {
      id: discussion.id,
      number: discussion.number,
      slug,
      comments: discussion.comments.nodes.map((node) => {
        const thumbsUp = node.reactionGroups.find((group) => group.content === 'THUMBS_UP')
        return {
          id: node.id,
          author: node.author?.login || 'ghost',
          avatarUrl: node.author?.avatarUrl || '/images/avatar.jpg',
          authorUrl: node.author?.url || 'https://github.com',
          body: node.body,
          createdAt: node.createdAt,
          viewerDidAuthor: node.viewerDidAuthor,
          reactionCount: thumbsUp?.users.totalCount || 0,
          viewerHasReacted: thumbsUp?.viewerHasReacted || false
        }
      })
    }
    writeOffline(thread)
    return { thread, offline: false }
  } catch {
    return { thread: readOffline(slug), offline: true }
  }
}

export async function addComment(slug: string, body: string) {
  const discussion = await ensureDiscussion(slug)
  await githubGraphql(`mutation AddSiteComment($discussionId: ID!, $body: String!) {
    addDiscussionComment(input: { discussionId: $discussionId, body: $body }) { comment { id } }
  }`, { discussionId: discussion.id, body })
}

export async function deleteComment(id: string) {
  await githubGraphql(`mutation DeleteSiteComment($id: ID!) {
    deleteDiscussionComment(input: { id: $id }) { clientMutationId }
  }`, { id })
}
