<template>
  <div class="friend-links-container">
    <h1>友情链接</h1>
    <div class="links-grid">
      <div 
        v-for="(link, index) in friendLinks" 
        :key="index" 
        class="link-card"
        @click="openLink(link.url)"
      >
        <div class="link-avatar">
          <img :src="link.avatar" :alt="link.name" />
        </div>
        <div class="link-info">
          <h3>{{ link.name }}</h3>
          <p>{{ link.description }}</p>
          <span class="link-url">{{ link.url }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface FriendLink {
  name: string;
  url: string;
  description: string;
  avatar: string;
}

const friendLinks = ref<FriendLink[]>([
  {
    name: '肖恩',
    url: 'https://devilsean-github-io.vercel.app/',
    description: '这是肖恩的个人博客',
    avatar: 'https://avatars.githubusercontent.com/u/170224409?v=4'
  },
]);

const openLink = (url: string) => {
  window.open(url, '_blank');
};
</script>

<style scoped>
.friend-links-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.friend-links-container h1 {
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: #333;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  justify-items: center;
}

.link-card {
  width: 100%;
  max-width: 350px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: left;
}

.link-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.link-avatar {
  flex-shrink: 0;
}

.link-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.link-info {
  flex-grow: 1;
}

.link-info h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #fff;
}

.link-info p {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.link-url {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>