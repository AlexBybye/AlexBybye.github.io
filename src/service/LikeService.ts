interface ArticleLikes {
  [articleId: string]: number;
}

interface CommentLikes {
  [commentId: string]: number;
}

interface UserLikedItems {
  articles: string[];
  comments: string[];
}

class LikeService {
  private articleLikesKey = 'article-likes';
  private commentLikesKey = 'comment-likes';
  private userLikedKey = 'user-liked-items';
  private commentsKey = 'comments'; // 新增：指向你存评论的 key

  // --- 新增私有方法：同步更新评论主列表里的 likes 字段 ---
  private updateMainCommentsData(commentId: string, delta: number) {
    const stored = localStorage.getItem(this.commentsKey);
    if (!stored) return;
    try {
      const allComments = JSON.parse(stored);
      // 递归寻找评论（考虑到可能有回复嵌套）
      const findAndUpdate = (list: any[]) => {
        for (let item of list) {
          if (item.id === commentId) {
            item.likes = (item.likes || 0) + delta;
            return true;
          }
          if (item.replies && item.replies.length > 0) {
            if (findAndUpdate(item.replies)) return true;
          }
        }
        return false;
      };
      findAndUpdate(allComments);
      localStorage.setItem(this.commentsKey, JSON.stringify(allComments));
    } catch (e) {
      console.error("Sync comments failed", e);
    }
  }

  // 获取文章点赞数
  getArticleLikes(articleId: string): number {
    const stored = localStorage.getItem(this.articleLikesKey);
    if (!stored) return 0;
    try {
      const likes: ArticleLikes = JSON.parse(stored);
      return likes[articleId] || 0;
    } catch {
      return 0;
    }
  }

  // 点赞/取消点赞文章
  toggleArticleLike(articleId: string): { liked: boolean; count: number } {
    const userLiked = this.getUserLikedItems();
    const isLiked = userLiked.articles.includes(articleId);
    const allLikes = this.getAllArticleLikes();
    
    if (isLiked) {
      userLiked.articles = userLiked.articles.filter(id => id !== articleId);
      allLikes[articleId] = Math.max(0, (allLikes[articleId] || 1) - 1);
    } else {
      userLiked.articles.push(articleId);
      allLikes[articleId] = (allLikes[articleId] || 0) + 1;
    }
    
    localStorage.setItem(this.articleLikesKey, JSON.stringify(allLikes));
    localStorage.setItem(this.userLikedKey, JSON.stringify(userLiked));
    
    return {
      liked: !isLiked,
      count: allLikes[articleId]
    };
  }

  // 获取所有文章点赞数
  getAllArticleLikes(): ArticleLikes {
    const stored = localStorage.getItem(this.articleLikesKey);
    if (!stored) return {};
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }

  // 获取评论点赞数
  getCommentLikes(commentId: string): number {
    const stored = localStorage.getItem(this.commentLikesKey);
    if (!stored) return 0;
    try {
      const likes: CommentLikes = JSON.parse(stored);
      return likes[commentId] || 0;
    } catch {
      return 0;
    }
  }

  // 点赞/取消点赞评论
  toggleCommentLike(commentId: string): { liked: boolean; count: number } {
    const userLiked = this.getUserLikedItems();
    const isLiked = userLiked.comments.includes(commentId);
    const allLikes = this.getAllCommentLikes();
    
    // 确定增量
    const delta = isLiked ? -1 : 1;

    if (isLiked) {
      userLiked.comments = userLiked.comments.filter(id => id !== commentId);
      allLikes[commentId] = Math.max(0, (allLikes[commentId] || 1) - 1);
    } else {
      userLiked.comments.push(commentId);
      allLikes[commentId] = (allLikes[commentId] || 0) + 1;
    }
    
    localStorage.setItem(this.commentLikesKey, JSON.stringify(allLikes));
    localStorage.setItem(this.userLikedKey, JSON.stringify(userLiked));
    
    // --- 核心修改：同步更新主数据 ---
    this.updateMainCommentsData(commentId, delta);
    
    return {
      liked: !isLiked,
      count: allLikes[commentId]
    };
  }

  // 获取所有评论点赞数
  getAllCommentLikes(): CommentLikes {
    const stored = localStorage.getItem(this.commentLikesKey);
    if (!stored) return {};
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }

  // 检查用户是否已点赞某项
  isItemLiked(itemId: string, itemType: 'article' | 'comment'): boolean {
    const userLiked = this.getUserLikedItems();
    if (itemType === 'article') {
      return userLiked.articles.includes(itemId);
    } else {
      return userLiked.comments.includes(itemId);
    }
  }

  // 获取用户点赞的所有项目
  getUserLikedItems(): UserLikedItems {
    const stored = localStorage.getItem(this.userLikedKey);
    if (!stored) return { articles: [], comments: [] };
    try {
      const parsed = JSON.parse(stored);
      return {
        articles: Array.isArray(parsed.articles) ? parsed.articles : [],
        comments: Array.isArray(parsed.comments) ? parsed.comments : []
      };
    } catch {
      return { articles: [], comments: [] };
    }
  }

  // 获取用户点赞的特定类型项目的ID列表
  getUserLikedIds(itemType: 'article' | 'comment'): string[] {
    const userLiked = this.getUserLikedItems();
    return itemType === 'article' ? userLiked.articles : userLiked.comments;
  }
}

export const likeService = new LikeService();