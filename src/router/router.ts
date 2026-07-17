import { createRouter, createWebHashHistory } from 'vue-router'

const Animation1 = () => import('@/component/welcome/Animation1.vue')
const Animation2 = () => import('@/component/welcome/Animation2.vue')
const Animation3 = () => import('@/component/Main/Animation3.vue')
const PackReveal = () => import('@/component/Main/PackReveal.vue')
const About = () => import('@/component/Pages/About.vue')
const Album = () => import('@/component/Pages/Album.vue')
const AlbumDetail = () => import('@/component/Pages/AlbumDetail.vue')
const Article = () => import('@/component/Pages/Article.vue')
const Music = () => import('@/component/Pages/Music.vue')
const MusicPlaylist = () => import('@/component/Pages/MusicPlaylist.vue')
const TagCloud = () => import('@/component/Pages/TagCloud.vue')
const FriendLinks = () => import('@/component/Pages/Friendlinks.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Animation1
  },
  {
    path: '/Animation2',
    name: 'Animation2',
    component: Animation2
  },
  {
    path: '/Animation3',
    name: 'Animation3',
    component: Animation3,
    children: [
      {
        path: '',
        name: 'Animation3Index',
        component: PackReveal
      },
      {
        path: 'about',
        name: 'About',
        component: About
      },
      {
        path: 'article',
        name: 'Article',
        component: Article
      },
      {
        path: 'article/detail/:id',
        name: 'ArticleDetail',
        component: Article, 
        props: true
      },
      {
        path: 'music',
        name: 'Music',
        component: Music
      },
      {
        path: 'album',
        name: 'Album',
        component: Album
      },
      {
        path: 'album/detail/:id',
        name: 'AlbumDetail',
        component: AlbumDetail,
        props: true
      },
      {
        path: 'music/playlist',
        name: 'MusicPlaylist',
        component: MusicPlaylist
      },
      {
        path: 'tagcloud',
        name: 'TagCloud',
        component: TagCloud
      },
      {
        path: 'friends',
        name: 'FriendLinks',
        component: FriendLinks
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
