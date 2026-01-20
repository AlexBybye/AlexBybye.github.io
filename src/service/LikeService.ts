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
    
    if (isLiked) {
      // 取消点赞
      userLiked.articles = userLiked.articles.filter(id => id !== articleId);
      const currentCount = this.getArticleLikes(articleId);
      const newCount = Math.max(0, currentCount - 1);
      
      // 更新文章点赞数
      const allLikes = this.getAllArticleLikes();
      allLikes[articleId] = newCount;
      localStorage.setItem(this.articleLikesKey, JSON.stringify(allLikes));
    } else {
      // 点赞
      userLiked.articles.push(articleId);
      const currentCount = this.getArticleLikes(articleId);
      const newCount = currentCount + 1;
      
      // 更新文章点赞数
      const allLikes = this.getAllArticleLikes();
      allLikes[articleId] = newCount;
      localStorage.setItem(this.articleLikesKey, JSON.stringify(allLikes));
    }
    
    // 保存用户点赞记录
    localStorage.setItem(this.userLikedKey, JSON.stringify(userLiked));
    
    return {
      liked: !isLiked,
      count: this.getArticleLikes(articleId)
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
    
    if (isLiked) {
      // 取消点赞
      userLiked.comments = userLiked.comments.filter(id => id !== commentId);
      const currentCount = this.getCommentLikes(commentId);
      const newCount = Math.max(0, currentCount - 1);
      
      // 更新评论点赞数
      const allLikes = this.getAllCommentLikes();
      allLikes[commentId] = newCount;
      localStorage.setItem(this.commentLikesKey, JSON.stringify(allLikes));
    } else {
      // 点赞
      userLiked.comments.push(commentId);
      const currentCount = this.getCommentLikes(commentId);
      const newCount = currentCount + 1;
      
      // 更新评论点赞数
      const allLikes = this.getAllCommentLikes();
      allLikes[commentId] = newCount;
      localStorage.setItem(this.commentLikesKey, JSON.stringify(allLikes));
    }
    
    // 保存用户点赞记录
    localStorage.setItem(this.userLikedKey, JSON.stringify(userLiked));
    
    return {
      liked: !isLiked,
      count: this.getCommentLikes(commentId)
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
    if (!stored) {
      return {
        articles: [],
        comments: []
      };
    }
    
    try {
      const parsed = JSON.parse(stored);
      return {
        articles: Array.isArray(parsed.articles) ? parsed.articles : [],
        comments: Array.isArray(parsed.comments) ? parsed.comments : []
      };
    } catch {
      return {
        articles: [],
        comments: []
      };
    }
  }
  
  // 获取用户点赞的特定类型项目的ID列表
   getUserLikedIds(itemType: 'article' | 'comment'): string[] {
    const userLiked = this.getUserLikedItems();
    if (itemType === 'article') {
      return userLiked.articles;
    } else {
      return userLiked.comments;
    }
  }
}

export const likeService = new LikeService();