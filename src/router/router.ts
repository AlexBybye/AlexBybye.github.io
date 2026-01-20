import { createRouter, createWebHistory } from 'vue-router'
// 注意：Vite 环境下导入 Vue 组件必须写 .vue 后缀
import Animation1 from '../component/welcome/Animation1.vue'
import Animation2 from '../component/welcome/Animation2.vue'
import Animation3 from '../component/Main/Animation3.vue'
import About from '../component/Pages/About.vue'
import Article from '../component/Pages/Article.vue'
import Music from '../component/Pages/Music.vue'
import Album from '../component/Pages/Album.vue'
import MusicPlaylist from '../component/Pages/MusicPlaylist.vue'
import FriendLinks from '../component/Pages/Friendlinks.vue'

const router = createRouter({
    // 如果你部署在 AlexBybye.github.io 的根目录，传空字符串或 '/' 即可
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'animation1',
            component: Animation1
        },
        {
            path: '/animation2',
            name: 'animation2',
            component: Animation2
        },
        {
            path: '/animation3',
            name: 'animation3',
            component: Animation3,
            children: [
                {
                    path: 'about',
                    name: 'about',
                    component: About
                },
                {
                    path: 'article',
                    name: 'article',
                    component: Article
                },
                {
                    path: 'article/detail/:id',
                    name: 'articleDetail',
                    component: Article,
                    props: true
                },
                {
                    path: 'article/tag/:tag',
                    name: 'articleByTag',
                    component: Article,
                    props: true
                },
                {
                    path: 'music',
                    name: 'music',
                    component: Music
                },
                {
                    path: 'music/playlist',
                    name: 'musicPlaylist',
                    component: MusicPlaylist
                },
                {
                    path: 'album',
                    name: 'album',
                    component: Album
                },
                {
                    path: 'album/detail/:id', 
                    name: 'AlbumDetail',
                    component: () => import('../component/Pages/AlbumDetail.vue'), // 所有相册共用这一个组件
                    props: true
                },
                {
                    path: 'friends',
                    name: 'friendLinks',
                    component: FriendLinks
                }
            ]
        },

    ],
})

export default router