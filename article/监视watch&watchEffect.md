---
title: "Vue watch 与 watchEffect：监听响应式变化"
date: "2025-04-12"
category: "前端"
tags: ["Vue", "响应式", "前端"]
description: "比较 watch 和 watchEffect 的依赖追踪方式，并整理监听 ref、reactive 数据时的常见写法。"
---
## 只监视四种数据：
### ref reactive 函数返回一个值（getter函数） 包含前三者的数组
## watch(监视对象名, 回调函数)
### 1：ref基本数据（ALL属性监视）
### ![[监视watch-watchEffect-669944c3cc.webp]]2：ref对象数据（不写{deep:true}则只会关心对象的地址有无变换，就是只有changePerson才会被监视到）（ALL属性监视）
![[监视watch-watchEffect-7ed3592d32.webp]]
我们现在就可以拓展下watch定义：
第一个参数newvalue:被监视数据
第二个参数oldvalue:监视回调
第三个参数：配置对象（ ）
#### - **深度监听**：使用 `deep:true` 选项监听对象的嵌套属性。
#### - **立即执行**：使用 `immediate:true` 选项在初始化时立即执行监听逻辑。
注意：实际开发可能前两个参数会简化成value，因为可以不管旧数据oldvalue
### reactive对象数据（ALL属性监视）
这里再复习下ref和reactive：
[[响应式数据]]
![[监视watch-watchEffect-00c9d8eec0.webp]]
```vue
<script lang="ts">
watch(person,(newvalue,oldvalue)=>{
console.log("person has been changed",newvalue,oldvalue)
})
</script>
```
#### 注意：reactive自动开启deep，所以针对对象除了地址变化，值变化亦可以
### 3：getter函数（监视唯一属性）
#### 对于监视ref或者reactive数据中某个属性，需要写成getter函数形式：
![[监视watch-watchEffect-4639bafff0.webp]]
### 4：(想监视多个但不是所有属性)说白了就是getter函数集合到一块当数组
```javascript
watch([()=>person.name,()=>person.car.c1],(newvalue,oldvalue)=>{
console.log('person.car变化',newvalue,oldvalue)
},{deep:true})
```
//此时还可以通过 let [a,b]=newvalue 把自己的新值进行调用
//实际开发可能注意新值，所以就value就行
## watchEffect
### 不用声明监视谁的方法
但需要注意，还是需要像ref reactive watch等 去import {watchEffect}
这个方法明显easy:
![[监视watch-watchEffect-d56400f026.webp]]
