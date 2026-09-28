---
title: "Pinia 状态的创建、读取与修改"
date: "2025-04-25"
category: "前端"
tags: ["Vue", "Pinia", "前端"]
description: "通过示例整理 Pinia Store 的定义、组件读取状态以及更新状态的基本方式。"
---
规范：
先创一个store文件夹
再于其中写XXX.ts
![[pinia储存-读取与修改-674b244f88.webp]]defineStore后面是它的id，最好和文件名XXX一致
state( ){函数里面放要管理的东西a,b,c...}
### 之后怎么用？
# 异文件import引入
## 在对应的components组件XXX.vue中
import {useTalkStore} from '@/store/XXX'
#### @就是src的意思
### 然后：
const talkStore = useTalkStore( )
### 此步做完，pinia就已经形成了对应的状态管理，vue中要使用的talkList可直接用talkStore.talkList来代替，说得明白些就是可以通过talkStore来接收pinia管理的a,b,c

# 修改方法：
## 1： 不同于vuex，可以直接通过改XXXStore. X 值来实现
## 2：第二种通过actions来修改；当然，要在pinia的ts中改：
```ts
export const useCountStore = defineStore('count',{
   actions:{
   increment(value){
   
   this.sum += value
   
   }
   },
   state(){
      return{
       sum:6,
      }
   }
})
```
### 其中actions放的是一个一个的方法，用于响应组件动作，
### this.`state里面的变量`=`increment（赋值）`中的值
### 为什么不在调用文件去搞？在increment中调用公共代码，减少重复性
之后想要调用只需要:
```html
<template>
  <div>
    <p>{{ countStore.sum }}</p>
    <select v-model.number="n">
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
    </select>
    <button @click="add">加</button>
    <button @click="minus">减</button>
  </div>
</template>

<script setup lang="ts">
import { useCountStore } from './stores/countStore'

const countStore = useCountStore()
let n = ref(1) // 用户选择的数字
function add(){
    // 第一种修改方式
    // countStore.sum += 1

    // 第二种修改方式
    /* countStore.$patch({
      sum:888,
      school:'尚硅谷',
      address:'北京'
    }) */

    // 第三种修改方式
    countStore.increment(n.value)

  }
</script>
```

