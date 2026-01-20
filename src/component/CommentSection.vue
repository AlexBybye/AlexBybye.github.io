<template>
  <div class="comment-section">
    <h3>评论区</h3>
    
    <!-- 用户认证状态 -->
    <div class="auth-status">
      <div v-if="currentUser" class="user-info">
        <img :src="currentUser.avatar_url" :alt="currentUser.login" class="avatar" @error="handleImageError" />
        <span class="username">{{ currentUser.login }}</span>
        <button @click="logout" class="logout-btn">退出</button>
      </div>
      <div v-else class="login-options">
        <p>请登录以发表评论：</p>
        <button @click="useAnonymousMode" class="anon-login-btn">匿名评论</button>
        <button @click="promptGithubLogin" class="login-btn">使用 GitHub 用户名</button>
      </div>
    </div>
    
    <!-- 发表评论 -->
    <div v-if="currentUser" class="comment-form">
      <textarea 
        v-model="newCommentContent" 
        placeholder="写下你的评论..."
        rows="4"
        maxlength="500"
        class="comment-input"
      ></textarea>
      <button @click="submitComment" :disabled="!newCommentContent.trim()" class="submit-btn">
        发表评论
      </button>
    </div>
    
    <!-- 评论列表 -->
    <div class="comments-list">
      <div v-if="loadingComments" class="loading">加载评论中...</div>
      <div v-else-if="comments.length === 0" class="no-comments">
        暂无评论，快来发表第一个评论吧！
      </div>
      <div v-else v-for="comment in sortedComments" :key="comment.id" class="comment-item">
        <div class="comment-header">
          <img :src="comment.githubAvatarUrl" :alt="comment.githubUsername" class="avatar" @error="handleImageError" />
          <div class="user-info">
            <span class="username">{{ comment.githubUsername }}</span>
            <span class="date">{{ formatDate(comment.createdAt) }}</span>
          </div>
        </div>
        <div class="comment-body">
          <p>{{ comment.content }}</p>
        </div>
        <div v-if="isCurrentUserComment(comment)" class="comment-actions">
          <button @click="deleteComment(comment.id)" class="delete-btn">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { githubAuthService } from '@/service/githubAuthService';
import type { GithubUser } from '@/service/githubAuthService';

// 评论接口定义
interface Comment {
  id: string;
  articleId: string;
  githubUsername: string;
  githubAvatarUrl: string;
  content: string;
  createdAt: string; // ISO日期字符串
}

// Props
interface Props {
  articleId: string;
}
const props = withDefaults(defineProps<Props>(), {
  articleId: ''
});

// 响应式数据
const comments = ref<Comment[]>([]);
const newCommentContent = ref('');
const loadingComments = ref(true);
const currentUser = ref<GithubUser | null>(null);

// 计算属性
const sortedComments = computed(() => {
  return [...comments.value].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});

// 图片加载错误处理 - 修复 'error' 的 any 类型错误
const handleImageError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement;
  // 使用我们在 service 中定义的默认兜底地址
  imgElement.src = 'https://github.com/identicons/guest.png';
};

// 方法
const loadComments = async () => {
  loadingComments.value = true;
  try {
    // 从localStorage加载评论
    const stored = localStorage.getItem('article-comments');
    if (stored) {
      const allComments: Comment[] = JSON.parse(stored);
      comments.value = allComments.filter(comment => comment.articleId === props.articleId);
    } else {
      comments.value = [];
    }
  } catch (error) {
    console.error('加载评论失败:', error);
    comments.value = [];
  } finally {
    loadingComments.value = false;
  }
};

const loadCurrentUser = async () => {
  // 从认证服务获取当前用户
  const user = githubAuthService.getCachedUserInfo();
  console.log('加载当前用户:', user);
  currentUser.value = user;
};

const submitComment = async () => {
  if (!newCommentContent.value.trim() || !currentUser.value) return;
  
  try {
    // 获取现有评论
    let allComments: Comment[] = [];
    const stored = localStorage.getItem('article-comments');
    if (stored) {
      allComments = JSON.parse(stored);
    }
    
    // 创建新评论
    const newComment: Comment = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      articleId: props.articleId,
      githubUsername: currentUser.value.login,
      githubAvatarUrl: currentUser.value.avatar_url,
      content: newCommentContent.value.trim(),
      createdAt: new Date().toISOString()
    };
    
    console.log('提交的新评论:', newComment);
    
    // 添加新评论
    allComments.push(newComment);
    
    // 保存到localStorage
    localStorage.setItem('article-comments', JSON.stringify(allComments));
    
    // 清空输入框
    newCommentContent.value = '';
    
    // 重新加载评论
    await loadComments();
  } catch (error) {
    console.error('提交评论失败:', error);
    alert('提交评论失败，请重试');
  }
};

const deleteComment = async (commentId: string) => {
  if (!confirm('确定要删除这条评论吗？')) return;
  
  try {
    // 获取现有评论
    let allComments: Comment[] = [];
    const stored = localStorage.getItem('article-comments');
    if (stored) {
      allComments = JSON.parse(stored);
    }
    
    // 过滤掉要删除的评论
    const index = allComments.findIndex(comment => 
      comment.id === commentId && 
      comment.githubUsername === currentUser.value?.login
    );
    
    if (index !== -1) {
      allComments.splice(index, 1);
      
      // 保存到localStorage
      localStorage.setItem('article-comments', JSON.stringify(allComments));
      
      // 重新加载评论
      await loadComments();
    } else {
      alert('无法删除此评论');
    }
  } catch (error) {
    console.error('删除评论失败:', error);
    alert('删除评论失败，请重试');
  }
};

// 登录方法修改：适配简化后的 login 逻辑
const promptGithubLogin = () => {
  const username = prompt('请输入您的 GitHub 用户名:');
  if (username && username.trim()) {
    // 调用简化的同步 login 逻辑
    const user = githubAuthService.login(username.trim());
    currentUser.value = user;
    console.log('GitHub登录成功:', user);
  }
};

// 匿名模式修改：统一使用 login 方法传入固定标识
const useAnonymousMode = () => {
  const anonUser = githubAuthService.login('anonymous-user');
  currentUser.value = anonUser;
  console.log('切换到匿名模式:', anonUser);
};

// 登出方法修改：调用 logout
const logout = () => {
  githubAuthService.logout();
  currentUser.value = null;
  console.log('用户已登出');
};

const isCurrentUserComment = (comment: Comment) => {
  return currentUser.value && comment.githubUsername === currentUser.value.login;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 组件挂载时加载评论和当前用户
onMounted(async () => {
  console.log('CommentSection 组件挂载');
  await loadCurrentUser();
  await loadComments();
});
</script>

<style scoped>
.comment-section {
  margin-top: 40px;
  padding: 20px;
  background-color: #2c2c2c;
  border-radius: 8px;
}

.auth-status {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-weight: bold;
  color: #fff;
}

.logout-btn {
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #555;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-options {
  display: flex;
  gap: 10px;
  align-items: center;
}

.login-options button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #6200ea;
  color: white;
}

.anon-login-btn {
  background-color: #03dac6;
}

.comment-form {
  margin-bottom: 20px;
}

.comment-input {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #555;
  background-color: #333;
  color: #fff;
  resize: vertical;
  min-height: 80px;
}

.submit-btn {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #03dac6;
  color: black;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.comments-list {
  margin-top: 20px;
}

.comment-item {
  padding: 15px;
  border: 1px solid #444;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: #333;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-body {
  margin: 10px 0;
  color: #ddd;
  line-height: 1.5;
}

.comment-actions {
  text-align: right;
}

.delete-btn {
  padding: 5px 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.loading, .no-comments {
  text-align: center;
  padding: 20px;
  color: #aaa;
}
</style>