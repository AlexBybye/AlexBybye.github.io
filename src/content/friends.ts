import { loadPublicJson } from './publicConfig'
export interface FriendLink { name: string; url: string; description: string; avatar: string }
export const friendLinks: FriendLink[] = []
export async function loadFriendsConfig() {
  const data = await loadPublicJson<{ friends: FriendLink[] }>('friends.json')
  friendLinks.splice(0, friendLinks.length, ...data.friends)
}
