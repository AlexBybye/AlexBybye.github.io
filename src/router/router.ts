import { createRouter, createWebHashHistory } from 'vue-router'

const KickoffView = () => import('@/views/landing/KickoffView.vue')
const ShowcaseView = () => import('@/views/landing/ShowcaseView.vue')
const BlogLayout = () => import('@/views/blog/BlogLayout.vue')
const BlogHomeView = () => import('@/views/blog/BlogHomeView.vue')
const AboutView = () => import('@/views/blog/AboutView.vue')
const AlbumView = () => import('@/views/blog/AlbumView.vue')
const AlbumDetailView = () => import('@/views/blog/AlbumDetailView.vue')
const ArticleView = () => import('@/views/blog/ArticleView.vue')
const MusicView = () => import('@/views/blog/MusicView.vue')
const MusicPlaylistView = () => import('@/views/blog/MusicPlaylistView.vue')
const TagCloud = () => import('@/components/ui/TagCloud.vue')
const FriendLinksView = () => import('@/views/blog/FriendLinksView.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: KickoffView
  },
  {
    path: '/Animation2',
    name: 'Animation2',
    component: ShowcaseView
  },
  {
    path: '/Animation3',
    name: 'Animation3',
    component: BlogLayout,
    redirect: { name: 'Animation3Index' },
    children: [
      {
        path: '',
        name: 'Animation3Index',
        component: BlogHomeView
      },
      {
        path: 'about',
        name: 'About',
        component: AboutView
      },
      {
        path: 'article',
        name: 'Article',
        component: ArticleView
      },
      {
        path: 'article/detail/:id',
        name: 'ArticleDetail',
        component: ArticleView,
        props: true
      },
      {
        path: 'music',
        name: 'Music',
        component: MusicView
      },
      {
        path: 'album',
        name: 'Album',
        component: AlbumView
      },
      {
        path: 'album/detail/:id',
        name: 'AlbumDetail',
        component: AlbumDetailView,
        props: true
      },
      {
        path: 'music/playlist',
        name: 'MusicPlaylist',
        component: MusicPlaylistView
      },
      {
        path: 'tagcloud',
        name: 'TagCloud',
        component: TagCloud
      },
      {
        path: 'friends',
        name: 'FriendLinks',
        component: FriendLinksView
      }
    ]
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0, behavior: 'auto' }
  }
})

export default router
