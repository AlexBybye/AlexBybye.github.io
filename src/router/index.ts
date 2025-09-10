import { createRouter, createWebHistory } from 'vue-router'
import Animation1 from '../component/welcome/Animation1.vue'
import Animation2 from '../component/welcome/Animation2.vue'
import Animation3 from '../component/Main/Animation3.vue'
const router = createRouter({
  history: createWebHistory('AlexBybye.github.io'), 
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
      component: Animation3
    }
  ],
})

export default router