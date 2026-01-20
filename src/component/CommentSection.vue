<template>
  <div class="comment-section">
    <h3>评论区</h3>
    
    <!-- 评论表单 -->
    <div class="comment-form">
      <textarea 
        v-model="newComment.content" 
        placeholder="输入你的评论..."
        rows="3"
      ></textarea>
      <div class="form-footer">
        <input 
          v-model="newComment.author" 
          placeholder="你的名字" 
          maxlength="20"
        />
        <button @click="submitComment" :disabled="!canSubmit">发表评论</button>
      </div>
    </div>
    
    <!-- 评论列表 -->
    <div class="comments-list">
      <div 
        v-for="comment in comments" 
        :key="comment.id" 
        class="comment-item"
        :class="{ 'is-reply': comment.parentId }"
      >
        <div class="comment-header">
          <span class="author">{{ comment.author }}</span>
          <span class="date">{{ formatDate(comment.date) }}</span>
          <div class="actions">
            <button 
              class="like-btn" 
              :class="{ liked: isLiked(comment.id) }"
              @click="toggleLike(comment.id)"
            >
              👍 {{ getLikeCount(comment.id) }}
            </button>
            <button class="reply-btn" @click="toggleReplyForm(comment.id)">回复</button>
          </div>
        </div>
        <div class="comment-content">{{ comment.content }}</div>
        
        <!-- 回复表单 -->
        <div v-if="activeReplyId === comment.id" class="reply-form">
          <textarea 
            v-model="replyContent" 
            placeholder="输入你的回复..."
            rows="2"
          ></textarea>
          <div class="form-footer">
            <input 
              v-model="replyAuthor" 
              placeholder="你的名字" 
              maxlength="20"
            />
            <button @click="submitReply(comment.id)" :disabled="!canReply">回复</button>
            <button @click="cancelReply" class="cancel-btn">取消</button>
          </div>
        </div>
        
        <!-- 子评论（回复） -->
        <div v-if="getReplies(comment.id).length > 0" class="replies">
          <div 
            v-for="reply in getReplies(comment.id)" 
            :key="reply.id" 
            class="comment-item reply-item"
          >
            <div class="comment-header">
              <span class="author">{{ reply.author }}</span>
              <span class="date">{{ formatDate(reply.date) }}</span>
              <div class="actions">
                <button 
                  class="like-btn" 
                  :class="{ liked: isLiked(reply.id) }"
                  @click="toggleLike(reply.id)"
                >
                  👍 {{ getLikeCount(reply.id) }}
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

const props = defineProps<{
  articleId: string;
}>();

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
    } catch {}
  }
  allComments.push(comment);
  localStorage.setItem('comments', JSON.stringify(allComments));
  
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
    } catch {}
  }
  allComments.push(reply);
  localStorage.setItem('comments', JSON.stringify(allComments));
  
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
  const result = likeService.toggleCommentLike(commentId);
  // 更新本地评论列表中的点赞状态（这里我们不需要显式更新，因为UI会根据服务状态显示）
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

.like-btn, .reply-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s;
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