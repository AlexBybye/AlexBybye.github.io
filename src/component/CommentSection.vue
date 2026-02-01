<template>
  <div class="comment-section">
    <h3>评论区</h3>

    <!-- 评论表单 -->
    <div class="comment-form">
      <textarea v-model="newComment.content" placeholder="输入你的评论..." rows="3"></textarea>
      <div class="form-footer">
        <div class="avatar-input">
          <img :src="getUserAvatar(newComment.author)" alt="avatar" class="avatar-preview" />
          <input v-model="newComment.author" placeholder="你的名字或GitHub用户名" maxlength="20" />
        </div>
        <button @click="submitComment" :disabled="!canSubmit">发表评论</button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item" :class="{ 'is-reply': comment.parentId }">
        <div class="comment-header">
          <div class="author-info">
            <img :src="getUserAvatar(comment.author)" alt="avatar" class="comment-avatar" />
            <span class="author">{{ comment.author }}</span>
          </div>
          <span class="date">{{ formatDate(comment.date) }}</span>
          <div class="actions">
            <button class="like-btn" :class="{ liked: isLiked(comment.id) }" @click="toggleLike(comment.id)">
              👍 {{ getLikeCount(comment.id) }}
            </button>
            <button class="reply-btn" @click="toggleReplyForm(comment.id)">回复</button>
            <button v-if="currentUserIsAuthor(comment.author)" class="delete-btn" @click="deleteComment(comment.id)">
              删除
            </button>
          </div>
        </div>
        <div class="comment-content">{{ comment.content }}</div>

        <!-- 回复表单 -->
        <div v-if="activeReplyId === comment.id" class="reply-form">
          <textarea v-model="replyContent" placeholder="输入你的回复..." rows="2"></textarea>
          <div class="form-footer">
            <input v-model="replyAuthor" placeholder="你的名字" maxlength="20" />
            <button @click="submitReply(comment.id)" :disabled="!canReply">回复</button>
            <button @click="cancelReply" class="cancel-btn">取消</button>
          </div>
        </div>

        <!-- 子评论（回复） -->
        <div v-if="getReplies(comment.id).length > 0" class="replies">
          <div v-for="reply in getReplies(comment.id)" :key="reply.id" class="comment-item reply-item">
            <div class="comment-header">
              <div class="author-info">
                <img :src="getUserAvatar(reply.author)" alt="avatar" class="comment-avatar" />
                <span class="author">{{ reply.author }}</span>
              </div>
              <span class="date">{{ formatDate(reply.date) }}</span>
              <div class="actions">
                <button class="like-btn" :class="{ liked: isLiked(reply.id) }" @click="toggleLike(reply.id)">
                  👍 {{ getLikeCount(reply.id) }}
                </button>
                <button v-if="currentUserIsAuthor(reply.author)" class="delete-btn" @click="deleteComment(reply.id)">
                  删除
                </button>
              </div>
            </div>
            <div class="comment-content">回复 {{ getParentAuthor(reply.parentId) }}: {{ reply.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

import { likeService } from '@/service/LikeService';

interface Comment {
  id: string;
  articleId: string;
  content: string;
  author: string;
  date: string;
  parentId?: string; // 用于标识回复的目标评论
}

const emit = defineEmits(['comment-count-change']);

const props = defineProps<{
  articleId: string;
}>();
// 当前登录用户（可以从外部传入或者通过其他方式获取）
const currentUser = ref(''); // 这里可以根据实际登录系统设置当前用户
// 评论状态
const newComment = ref({
  content: '',
  author: ''
});
const comments = ref<Comment[]>([]);
const activeReplyId = ref<string | null>(null);
const replyContent = ref('');
const replyAuthor = ref('');

// 加载评论
const loadComments = () => {
  const stored = localStorage.getItem('comments');
  if (stored) {
    try {
      const allComments: Comment[] = JSON.parse(stored);
      comments.value = allComments.filter(comment => comment.articleId === props.articleId);
    } catch {
      comments.value = [];
    }
  }
};

// 提交评论
const submitComment = () => {
  // 如果没有用户名，提示用户输入
  if (!newComment.value.author.trim()) {
    const usernameInput = prompt('请输入您的GitHub用户名：');
    if (usernameInput) {
      newComment.value.author = usernameInput.trim();
      localStorage.setItem('comment_username', newComment.value.author);
    } else {
      // 用户取消输入
      return;
    }
  }

  if (!newComment.value.content.trim() || !newComment.value.author.trim()) return;

  const comment: Comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    articleId: props.articleId,
    content: newComment.value.content.trim(),
    author: newComment.value.author.trim(),
    date: new Date().toISOString()
  };

  // 保存到localStorage
  const stored = localStorage.getItem('comments');
  let allComments: Comment[] = [];
  if (stored) {
    try {
      allComments = JSON.parse(stored);
    } catch { }
  }
  allComments.push(comment);
  localStorage.setItem('comments', JSON.stringify(allComments));

  // 记住用户名以便后续验证
  localStorage.setItem('comment_username', comment.author);

  // 添加到列表
  comments.value.push(comment);

  // 清空表单
  newComment.value = { content: '', author: '' };
};

// 切换回复表单
const toggleReplyForm = (commentId: string) => {
  if (activeReplyId.value === commentId) {
    activeReplyId.value = null;
    replyContent.value = '';
    replyAuthor.value = '';
  } else {
    activeReplyId.value = commentId;
  }
};

// 提交回复
const submitReply = (parentId: string) => {
  // 如果没有用户名，提示用户输入
  if (!replyAuthor.value.trim()) {
    const usernameInput = prompt('请输入您的GitHub用户名：');
    if (usernameInput) {
      replyAuthor.value = usernameInput.trim();
      localStorage.setItem('comment_username', replyAuthor.value);
    } else {
      // 用户取消输入
      return;
    }
  }

  if (!replyContent.value.trim() || !replyAuthor.value.trim()) return;

  const reply: Comment = {
    id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    articleId: props.articleId,
    content: replyContent.value.trim(),
    author: replyAuthor.value.trim(),
    date: new Date().toISOString(),
    parentId
  };

  // 保存到localStorage
  const stored = localStorage.getItem('comments');
  let allComments: Comment[] = [];
  if (stored) {
    try {
      allComments = JSON.parse(stored);
    } catch { }
  }
  allComments.push(reply);
  localStorage.setItem('comments', JSON.stringify(allComments));
  // 记住用户名以便后续验证
  localStorage.setItem('comment_username', reply.author);

  // 添加到列表
  comments.value.push(reply);

  // 清空回复表单
  replyContent.value = '';
  replyAuthor.value = '';
  activeReplyId.value = null;
};

// 取消回复
const cancelReply = () => {
  activeReplyId.value = null;
  replyContent.value = '';
  replyAuthor.value = '';
};

// 获取指定评论的回复
const getReplies = (parentId: string) => {
  return comments.value.filter(comment => comment.parentId === parentId);
};

// 获取父评论的作者名
const getParentAuthor = (parentId?: string) => {
  if (!parentId) return '';
  const parent = comments.value.find(comment => comment.id === parentId);
  return parent ? parent.author : '';
};

// 点赞相关功能
const toggleLike = (commentId: string) => {
  // 获取当前用户标识
  let currentUsername = localStorage.getItem('comment_username');

  if (!currentUsername) {
    currentUsername = prompt('请输入您的GitHub用户名以进行点赞：');
    if (currentUsername) {
      localStorage.setItem('comment_username', currentUsername.trim());
      // 同时更新表单中的用户名
      newComment.value.author = currentUsername.trim();
    } else {
      // 用户取消输入，不执行点赞
      return;
    }
  }

  const result = likeService.toggleCommentLike(commentId);
  // 重新加载评论以更新UI
  loadComments();
};

const getLikeCount = (commentId: string) => {
  return likeService.getCommentLikes(commentId);
};

const isLiked = (commentId: string) => {
  return likeService.isItemLiked(commentId, 'comment');
};

// 计算是否可以提交评论
const canSubmit = computed(() => {
  return newComment.value.content.trim() && newComment.value.author.trim();
});

// 计算是否可以提交回复
const canReply = computed(() => {
  return replyContent.value.trim() && replyAuthor.value.trim();
});

// 获取用户头像
const getUserAvatar = (username: string) => {
  if (!username) return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y'; // 使用默认头像

  // 检查是否为有效的GitHub用户名格式（字母数字和连字符，长度1-39）
  const githubRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
  if (githubRegex.test(username)) {
    // 尝试获取GitHub头像
    return `https://avatars.githubusercontent.com/${username}?size=40`;
  }

  // 否则使用Gravatar基于用户名生成头像
  // 使用简单的方法生成类似哈希的值
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hexHash = Math.abs(hash).toString(16);

  return `https://www.gravatar.com/avatar/${hexHash}?d=identicon&s=40`;
};

// 检查当前用户是否是评论作者
const currentUserIsAuthor = (author: string) => {
  // 检查本地存储中是否有用户名，如果没有则提示输入
  let savedUsername = localStorage.getItem('comment_username');

  if (!savedUsername) {
    // 提示用户输入用户名
    const usernameInput = prompt('请输入您的GitHub用户名以验证身份：');
    if (usernameInput) {
      savedUsername = usernameInput.trim();
      localStorage.setItem('comment_username', savedUsername);
    }
  }

  return savedUsername === author;
};

// 删除评论
const deleteComment = (commentId: string) => {
  if (!confirm('确定要删除这条评论吗？')) return;

  const stored = localStorage.getItem('comments');
  let allComments: Comment[] = [];
  if (stored) {
    try {
      allComments = JSON.parse(stored);
    } catch { }
  }

  // 删除评论及其所有回复
  const commentIndex = allComments.findIndex(comment => comment.id === commentId);
  if (commentIndex !== -1) {
    allComments.splice(commentIndex, 1);
  }

  // 删除该评论的所有回复
  const repliesToDelete = allComments.filter(comment => comment.parentId === commentId);
  repliesToDelete.forEach(reply => {
    const replyIndex = allComments.findIndex(c => c.id === reply.id);
    if (replyIndex !== -1) {
      allComments.splice(replyIndex, 1);
    }
  });

  // 保存到localStorage
  localStorage.setItem('comments', JSON.stringify(allComments));

  // 重新加载评论
  loadComments();
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadComments();
});
</script>

<style scoped>
.comment-section {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.comment-section h3 {
  color: white;
  margin-bottom: 20px;
}

.comment-form {
  margin-bottom: 30px;
}

.comment-form textarea {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  resize: vertical;
  font-family: inherit;
}

.comment-form input {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  margin-right: 10px;
}

.avatar-input {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 10px;
}

.avatar-preview {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #6200ea;
}

.form-footer {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.comment-form button,
.reply-form button {
  padding: 8px 16px;
  background: #6200ea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.comment-form button:hover,
.reply-form button:hover {
  background: #3700b3;
}

.reply-form button.cancel-btn {
  background: #757575;
  margin-left: 5px;
}

.reply-form button.cancel-btn:hover {
  background: #616161;
}

.comment-form button:disabled,
.reply-form button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-item.is-reply {
  margin-left: 30px;
  border-left: 3px solid #6200ea;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 10px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #6200ea;
}

.author {
  font-weight: bold;
  color: #bb86fc;
}

.date {
  color: #ccc;
  font-size: 0.85em;
}

.actions {
  display: flex;
  gap: 8px;
}

.like-btn,
.reply-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s;
}

.delete-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s;
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.3);
}

.like-btn {
  background: rgba(179, 136, 255, 0.2);
  color: #bb86fc;
}

.like-btn:hover {
  background: rgba(179, 136, 255, 0.3);
}

.like-btn.liked {
  background: rgba(179, 136, 255, 0.4);
  color: #ffffff;
}

.reply-btn {
  background: rgba(98, 0, 234, 0.2);
  color: #bb86fc;
}

.reply-btn:hover {
  background: rgba(98, 0, 234, 0.3);
}

.comment-content {
  color: #e0e0e0;
  line-height: 1.5;
}

.replies {
  margin-top: 15px;
  padding-left: 20px;
  border-left: 2px solid rgba(98, 0, 234, 0.2);
}

.reply-item {
  background: rgba(98, 0, 234, 0.1);
  margin-top: 10px;
}

.reply-form {
  margin-top: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.reply-form textarea {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 10px;
}

.reply-form input {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  margin-right: 10px;
}
</style>