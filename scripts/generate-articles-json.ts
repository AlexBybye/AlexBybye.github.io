import * as fs from 'fs';
import * as path from 'path';

interface ArticleMetadata {
  title: string;
  date: string;
  category: string;
  tags: string[];
  description: string;
}

interface ArticleInfo {
  id: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  description?: string;
}

// 更健壮的YAML解析器
const parseYAML = (yamlStr: string): ArticleMetadata => {
  const result: any = {};
  const lines = yamlStr.split(/\r?\n/); // 处理不同平台的换行符

  for (const line of lines) {
    if (!line.trim()) continue; // 跳过空行
    
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      let value: string | string[] | boolean | number = line.substring(colonIndex + 1).trim();

      // 尝试解析数组，处理更复杂的格式
      if (value.startsWith('[') && value.endsWith(']')) {
        // 更精确地分割数组项，考虑可能存在的引号
        value = value
          .substring(1, value.length - 1)
          .split(/,(?=(?:[^'"]*'[^'"]*')*[^'"]*$)/) // 正确处理带引号的逗号分隔
          .map(item => item.trim().replace(/^['"]|['"]$/g, '')) // 移除首尾引号
          .filter(item => item); // 过滤掉空项
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      } else if (value === 'true' || value === 'false') {
        value = value === 'true';
      } else if (value && !isNaN(Number(value))) {
        value = Number(value);
      }

      result[key] = value;
    }
  }

  // 确保返回默认值
  return {
    title: result.title || '',
    date: result.date || '',
    category: result.category || '',
    tags: Array.isArray(result.tags) ? result.tags : (result.tags ? [result.tags] : []),
    description: result.description || ''
  };
};

// 解析Markdown内容，提取YAML front matter
const parseMarkdownWithFrontMatter = (content: string): { metadata: ArticleMetadata; body: string } => {
  const lines = content.split(/\r?\n/); // 处理不同平台的换行符
  
  // 检查是否有 front matter，允许开头有空白字符
  let frontMatterStartIndex = -1;
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    if (lines[i].trim() === '---') {
      frontMatterStartIndex = i;
      break;
    }
  }
  
  if (frontMatterStartIndex !== -1) {
    let endIndex = -1;
    for (let i = frontMatterStartIndex + 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        endIndex = i;
        break;
      }
    }

    if (endIndex > 0) {
      const yamlStr = lines.slice(frontMatterStartIndex + 1, endIndex).join('\n');
      try {
        const metadata = parseYAML(yamlStr);
        const body = lines.slice(endIndex + 1).join('\n').trim();
        return { metadata, body };
      } catch (error) {
        console.error(`解析YAML front matter时出错:`, error);
        // 发生错误时返回默认值
        return { 
          metadata: { title: '', date: '', category: '', tags: [], description: '' }, 
          body: content 
        };
      }
    }
  }

  // 如果没有front matter，则返回空metadata和整个body
  return { 
    metadata: { title: '', date: '', category: '', tags: [], description: '' }, 
    body: content 
  };
};

// 获取文章ID（文件名，不含扩展名）
const getArticleId = (fileName: string): string => {
  return path.basename(fileName, '.md');
};

// 扫描目录并生成articles.json
const generateArticlesJson = () => {
  const articlesDir = path.join(process.cwd(), 'public', 'article');
  const outputFilePath = path.join(process.cwd(), 'public', 'article', 'articles.json');
  
  console.log(`🔍 检查目录: ${articlesDir}`);
  
  if (!fs.existsSync(articlesDir)) {
    console.error(`❌ 目录不存在: ${articlesDir}`);
    return;
  }
  
  // 读取目录中的所有Markdown文件
  const files = fs.readdirSync(articlesDir);
  console.log(`📄 找到 ${files.length} 个文件:`, files);
  
  const mdFiles = files.filter((file: string) => path.extname(file.toLowerCase()) === '.md');
  console.log(`📝 找到 ${mdFiles.length} 个 Markdown 文件:`, mdFiles);
  
  const articles: ArticleInfo[] = [];
  
  for (const fileName of mdFiles) {
    const filePath = path.join(articlesDir, fileName);
    console.log(`\n🔄 处理文件: ${filePath}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      console.log(`📄 文件大小: ${content.length} 字符`);
      console.log(`📄 文件开头预览: ${content.substring(0, 100)}...`);
      
      const { metadata } = parseMarkdownWithFrontMatter(content);
      const id = getArticleId(fileName);
      
      console.log(`📊 提取的元数据:`, metadata);
      
      articles.push({
        id,
        title: metadata.title,
        date: metadata.date,
        category: metadata.category,
        tags: Array.isArray(metadata.tags) ? metadata.tags : [metadata.tags].filter(Boolean) as string[],
        description: metadata.description
      });
    } catch (error) {
      console.error(`❌ 处理文件 ${fileName} 时出错:`, error);
      // 添加一个带错误标记的文章条目
      const id = getArticleId(fileName);
      articles.push({
        id,
        title: `Error processing ${fileName}`,
        date: '',
        category: '',
        tags: [],
        description: `Error: ${(error as Error).message}`
      });
    }
  }
  
  // 按日期排序（最新的在前）
  articles.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return isNaN(dateB) ? (isNaN(dateA) ? 0 : -1) : (isNaN(dateA) ? 1 : dateB - dateA);
  });
  
  // 写入JSON文件
  fs.writeFileSync(outputFilePath, JSON.stringify(articles, null, 2));
  
  console.log(`\n✅ 成功生成 articles.json 文件`);
  console.log(`📁 找到了 ${articles.length} 篇文章`);
  articles.forEach(article => {
    console.log(`📝 ${article.id}: ${article.title || '(无标题)'}`);
  });
};

// 执行生成
try {
  generateArticlesJson();
} catch (error) {
  console.error('❌ 脚本执行失败:', error);
}