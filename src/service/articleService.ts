import { marked } from 'marked';

interface Article {
  id: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  content: string;
  description?: string;
}

// 简单的YAML解析器
const parseYAML = (yamlStr: string): any => {
  const result: any = {};
  const lines = yamlStr.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      let value: string | string[] | boolean | number = line.substring(colonIndex + 1).trim();

      // 尝试解析数组
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .substring(1, value.length - 1)
          .split(',')
          .map(item => item.trim().replace(/['"]/g, ''));
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      } else if (value === 'true' || value === 'false') {
        value = value === 'true';
      } else if (!isNaN(Number(value))) {
        value = Number(value);
      }

      result[key] = value;
    }
  }

  return result;
};

const parseMarkdownWithFrontMatter = (content: string): { metadata: any; body: string } => {
  // 建议：使用正则统一处理换行符，并去掉前后空白
  const lines = content.trim().split(/\r?\n/);

  // 使用 .trim() 确保排除掉肉眼看不见的空格或 \r 字符
  if (lines[0].trim() === '---') {
    let endIndex = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        endIndex = i;
        break;
      }
    }

    if (endIndex > 0) {
      const yamlStr = lines.slice(1, endIndex).join('\n');
      const metadata = parseYAML(yamlStr);
      // 获取 body 时，从第二个 --- 之后开始
      const body = lines.slice(endIndex + 1).join('\n').trim();
      return { metadata, body };
    }
  }

  // 如果没有识别到 front matter
  console.warn("Front matter parsing failed, checking first line:", lines[0]);
  return { metadata: {}, body: content };
};

// 加载文章列表
export const loadArticles = async (): Promise<Article[]> => {
  try {
    // 在生产环境中，这应该是从API获取的
    // 由于Vue应用无法直接读取本地文件系统，这里使用fetch获取public目录下的文件
    const response = await fetch('/article/articles.json');
    
    if (response.ok) {
      // 如果存在预生成的文章列表JSON文件
      const articleList = await response.json();
      return articleList;
    } else {
      // 如果没有预生成的JSON文件，则尝试获取目录中的文件列表
      // 这里只是一个fallback，实际中可能需要后端API来列出文件
      console.warn('没有找到预生成的文章列表，使用默认数据');
      return [];
    }
  } catch (error) {
    console.error('加载文章列表失败:', error);
    
    // 作为fallback，返回一些默认文章
    return [];
  }
};

// 根据ID加载特定文章
export const getArticleById = async (id: string): Promise<Article | null> => {
  try {
    // 构造文章文件路径
    const filePath = `/article/${id}.md`;
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${filePath}`);
    }

    const content = await response.text();
    const { metadata, body } = parseMarkdownWithFrontMatter(content);

    // 使用marked将Markdown转换为HTML
    const htmlContent = marked.parse(body) as string;

    // 创建文章对象
    const article: Article = {
      id,
      title: metadata.title || id,
      date: metadata.date || new Date().toISOString().split('T')[0],
      category: metadata.category || '',
      tags: Array.isArray(metadata.tags) ? metadata.tags : [metadata.tags].filter(Boolean) as string[],
      content: htmlContent,
      description: metadata.description || ''
    };

    return article;
  } catch (error) {
    console.error(`加载文章 ${id} 失败:`, error);
    return null;
  }
};

// 根据标签获取文章
export const getArticlesByTag = async (tag: string): Promise<Article[]> => {
  try {
    // 先获取所有文章
    const allArticles = await loadArticles();
    
    // 过滤出包含指定标签的文章
    const tagArticles = allArticles.filter(article => 
      article.tags && article.tags.includes(tag)
    );
    
    return tagArticles;
  } catch (error) {
    console.error(`加载标签 "${tag}" 的文章失败:`, error);
    return [];
  }
};