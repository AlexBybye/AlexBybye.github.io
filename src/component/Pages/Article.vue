<template>
  <div class="page-container">
    <div v-if="currentArticleId && !currentTag" class="article-detail">
      <button @click="goBackToList" class="back-button">← 返回文章列表</button>
      <div v-if="currentArticle" class="article-content">
        <h1>{{ currentArticle.title }}</h1>
        <div class="article-meta">
          <span class="date">{{ formatDate(currentArticle.date) }}</span>
          <span class="category" v-if="currentArticle.category">{{ currentArticle.category }}</span>
          <div class="tags" v-if="currentArticle.tags && currentArticle.tags.length > 0">
            <span class="tag" v-for="tag in currentArticle.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
        <div class="markdown-content" v-html="currentArticle.content"></div>
        
        <!-- 评论区 -->
        <CommentSection v-if="currentArticleId" :article-id="currentArticleId" class="comment-section" />
      </div>
      <div v-else class="loading">加载文章中...</div>
    </div>

    <div v-else-if="currentTag" class="tag-articles">
      <button @click="goBackToList" class="back-button">← 返回文章列表</button>
      <h2>标签: {{ currentTag }}</h2>
      <div v-if="filteredArticles.length > 0" class="articles-grid">
        <div v-for="article in filteredArticles" :key="article.id" class="article-card"
          @click="openArticle(article.id)">
          <h3>{{ article.title }}</h3>
          <div class="article-meta">
            <span class="date">{{ formatDate(article.date) }}</span>
            <span class="category" v-if="article.category">{{ article.category }}</span>
          </div>
          <div class="tags" v-if="article.tags && article.tags.length > 0">
            <span class="tag" v-for="tag in article.tags" :key="tag">{{ tag }}</span>
          </div>
          <p class="summary">{{ article.description || truncateText(article.content, 100) }}</p>
        </div>
      </div>
      <div v-else class="no-articles">
        <p>没有找到包含此标签的文章</p>
      </div>
    </div>

    <div v-else class="article-list">
      <h1>Articles</h1>
      <p>Explore my article base and technical articles.</p>

      <!-- 标签云图 -->
      <TagCloud :tags="allTags" @tag-click="filterByTag" />

      <div class="filters">
        <select v-model="selectedCategory" @change="filterArticles" class="filter-select">
          <option value="">所有分类</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>

        <input v-model="searchQuery" @input="filterArticles" placeholder="搜索文章..." class="search-input" />
      </div>

      <div v-if="filteredArticles.length > 0" class="articles-grid">
        <div v-for="article in filteredArticles" :key="article.id" class="article-card"
          @click="openArticle(article.id)">
          <h3>{{ article.title }}</h3>
          <div class="article-meta">
            <span class="date">{{ formatDate(article.date) }}</span>
            <span class="category" v-if="article.category">{{ article.category }}</span>
          </div>
          <div class="tags" v-if="article.tags && article.tags.length > 0">
            <span class="tag" v-for="tag in article.tags" :key="tag">{{ tag }}</span>
          </div>
          <p class="summary">{{ article.description || truncateText(article.content, 100) }}</p>
        </div>
      </div>
      <div v-else class="no-articles">
        <p>没有找到匹配的文章</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TagCloud from './TagCloud.vue'; // 导入标签云组件
import CommentSection from '../CommentSection.vue'; // 导入评论组件
import { loadArticles, getArticleById } from '@/service/articleService'; // 导入文章服务

interface Article {
  id: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  content: string;
  description?: string;
}

const route = useRoute();
const router = useRouter();

const articles = ref<Article[]>([]);
const currentArticleId = computed(() => route.params.id as string);
const currentTag = computed(() => route.params.tag as string);
const currentArticle = ref<Article | null>(null);
const selectedCategory = ref('');
const searchQuery = ref('');
const filteredArticles = ref<Article[]>([]);

// 获取所有可用的分类
const categories = computed(() => {
  const cats = new Set<string>();
  articles.value.forEach(article => {
    if (article.category) {
      cats.add(article.category);
    }
  });
  return Array.from(cats);
});

// 获取所有标签用于标签云
const allTags = computed(() => {
  const tagCounts: Record<string, number> = {};
  articles.value.forEach(article => {
    article.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCounts).map(([name, count]) => ({
    name,
    count
  }));
});

// 监听路由参数变化
watch([() => route.params.id, () => route.params.tag], async ([newId, newTag]) => {
  if (newId) {
    await loadArticleDetail(newId as string);
  } else if (newTag) {
    filterByTag(newTag as string);
  } else {
    // 显示所有文章
    filteredArticles.value = [...articles.value];
    currentArticle.value = null;
  }
}, { immediate: true });

onMounted(async () => {
  await loadAllArticles();

  // 检查路由参数并相应地加载内容
  if (currentArticleId.value) {
    await loadArticleDetail(currentArticleId.value);
  } else if (currentTag.value) {
    filterByTag(currentTag.value);
  } else {
    filteredArticles.value = [...articles.value];
  }
});

const loadAllArticles = async () => {
  try {
    // 从服务加载文章
    const loadedArticles = await loadArticles();
    articles.value = loadedArticles;

    // 根据路由参数决定如何初始化显示
    if (currentArticleId.value) {
      await loadArticleDetail(currentArticleId.value);
    } else if (currentTag.value) {
      filterByTag(currentTag.value);
    } else {
      filteredArticles.value = [...articles.value];
    }
  } catch (error) {
    console.error('加载文章失败:', error);
    
    // 作为fallback，可以加载一些示例数据
    articles.value = [];
    filteredArticles.value = [];
  }
};

async function loadArticleDetail(id: string)  {
  try {
    // 从服务加载特定文章
    const article = await getArticleById(id);
    if (article) {
      currentArticle.value = article;
      filteredArticles.value = []; // 清空文章列表
    } else {
      console.error(`未找到ID为 ${id} 的文章`);
      currentArticle.value = null;
    }
  } catch (error) {
    console.error(`加载文章 ${id} 失败:`, error);
    currentArticle.value = null;
  }
};

const filterByTag = (tag: string) => {
  const result = articles.value.filter(article => 
    article.tags.includes(tag)
  );
  filteredArticles.value = result;
  currentArticle.value = null;
};

const openArticle = (id: string) => {
  // 修改路由路径为 animation3/article/:id 格式
  router.push(`/Animation3/article/detail/${id}`);
};

const goBackToList = () => {
  // 修改返回路由为 animation3/article
  router.push('/Animation3/article');
};

const filterArticles = () => {
  let result = articles.value;

  if (selectedCategory.value) {
    result = result.filter(article => article.category === selectedCategory.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.tags.some(tag => tag.toLowerCase().includes(query)) ||
      (article.content && article.content.toLowerCase().includes(query))
    );
  }

  filteredArticles.value = result;
  currentArticle.value = null;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const truncateText = (html: string, maxLength: number) => {
  // 简单地去除HTML标签并截取文本
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || "";
  
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
</script>

<style scoped>
.page-container {
  width: 80%;
  margin: 0 auto;
  padding: 20px;
  background-color: #333;
  min-height: calc(100vh - 30% - 40px);
  opacity: 0.95;
  transition: opacity 0.3s ease;
}

h1 {
  color: #fff;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 20px;
}

h2 {
  color: #fff;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 20px;
}

p {
  color: #ccc;
  font-size: 1.2rem;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 30px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-select,
.search-input {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #555;
  background-color: #222;
  color: #fff;
  font-size: 14px;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.article-card {
  background-color: #444;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #555;
  min-height: 180px;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  background-color: #4a4a4a;
}

.article-card h3 {
  color: #fff;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #aaa;
}

.date {
  color: #888;
}

.category {
  background-color: #6200ea;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  background-color: #03dac6;
  color: #000;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.summary {
  color: #ccc;
  line-height: 1.5;
  margin-bottom: 0;
}

.back-button {
  background-color: #555;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 1rem;
}

.back-button:hover {
  background-color: #666;
}

.article-detail {
  min-height: 400px; /* 确保详情页有足够的空间 */
}

.article-content {
  color: #ddd;
  background-color: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
}

.article-content h1 {
  color: #fff;
  text-align: left;
  margin-top: 0;
}

.markdown-content {
  margin-top: 20px;
  line-height: 1.7;
  color: #ddd;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  color: #fff;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
}

.markdown-content p {
  margin-bottom: 1em;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #ccc;
  font-size: 1.2rem;
}

.no-articles {
  text-align: center;
  padding: 40px;
  color: #ccc;
  font-size: 1.2rem;
}

.tag-articles {
  min-height: 400px;
}

.comment-section {
  margin-top: 40px;
}
</style>