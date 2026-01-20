import { createRouter, createWebHashHistory } from 'vue-router'

// 导入组件
import Animation3 from '@/component/Main/Animation3.vue'
import About from '@/component/Pages/About.vue'
import Album from '@/component/Pages/Album.vue'
import AlbumDetail from '@/component/Pages/AlbumDetail.vue'
import Article from '@/component/Pages/Article.vue'
import Music from '@/component/Pages/Music.vue'
import MusicPlaylist from '@/component/Pages/MusicPlaylist.vue'
import TagCloud from '@/component/Pages/TagCloud.vue'
import FriendLinks from '@/component/Pages/Friendlinks.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Animation3
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/album',
    name: 'Album',
    component: Album
  },
  {
    path: '/album/:id',
    name: 'AlbumDetail',
    component: AlbumDetail,
    props: true
  },
  {
    path: '/article',
    name: 'Article',
    component: Article
  },
  {
    path: '/music',
    name: 'Music',
    component: Music
  },
  {
    path: '/musiclist',
    name: 'MusicPlaylist',
    component: MusicPlaylist
  },
  {
    path: '/tagcloud',
    name: 'TagCloud',
    component: TagCloud
  },
  {
    path: '/friends',
    name: 'FriendLinks',
    component: FriendLinks
  }
]

const router = createRouter({
  history: createWebHashHistory('/PersonalWeb/'), // 使用hash模式
  routes
})

export default router