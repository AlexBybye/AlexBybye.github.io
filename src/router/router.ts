import { createRouter, createWebHashHistory } from 'vue-router'

// 导入组件
import Animation1 from '@/component/welcome/Animation1.vue'
import Animation2 from '@/component/welcome/Animation2.vue'
import Animation3 from '@/component/Main/Animation3.vue'
import About from '@/component/Pages/About.vue'
import Album from '@/component/Pages/Album.vue'
import AlbumDetail from '@/component/Pages/AlbumDetail.vue'
import Article from '@/component/Pages/Article.vue'
import Music from '@/component/Pages/Music.vue'
import MusicPlaylist from '@/component/Pages/MusicPlaylist.vue'
import TagCloud from '@/component/Pages/TagCloud.vue'
import FriendLinks from '@/component/Pages/Friendlinks.vue'
import path from 'path'

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
        component: Article, // 这里应该使用一个专门的详情组件或修复逻辑
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
  routes
})

export default router