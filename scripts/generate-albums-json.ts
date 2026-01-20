import * as fs from 'fs';
import * as path from 'path';

interface AlbumInfo {
  id: string;
  title: string;
  date: string;
  count: number;
  description?: string;
}

// 更健壮的YAML解析器用于解析相册描述信息
const parseYAML = (yamlStr: string): any => {
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

  return result;
};

// 解析相册配置文件，提取YAML front matter
const parseAlbumConfig = (content: string): { metadata: any; body: string } => {
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
        console.error(`解析相册配置YAML时出错:`, error);
        // 发生错误时返回默认值
        return { 
          metadata: { title: '', date: '', description: '' }, 
          body: content 
        };
      }
    }
  }

  // 如果没有front matter，则返回空metadata和整个body
  return { 
    metadata: { title: '', date: '', description: '' }, 
    body: content 
  };
};

// 获取相册ID（文件夹名称）
const getAlbumId = (folderName: string): string => {
  return folderName;
};

// 扫描目录并生成albumcontext.json
const generateAlbumsJson = () => {
  const albumsDir = path.join(process.cwd(), 'public', 'album');
  const outputFilePath = path.join(process.cwd(), 'public', 'album', 'albumcontext.json');
  
  console.log(`🔍 检查目录: ${albumsDir}`);
  
  if (!fs.existsSync(albumsDir)) {
    console.error(`❌ 目录不存在: ${albumsDir}`);
    return;
  }
  
  // 读取目录中的所有子目录（相册文件夹）
  const folders = fs.readdirSync(albumsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`📁 找到 ${folders.length} 个相册文件夹:`, folders);
  
  const albums: AlbumInfo[] = [];
  
  for (const folderName of folders) {
    const folderPath = path.join(albumsDir, folderName);
    console.log(`\n🔄 处理相册文件夹: ${folderPath}`);
    
    try {
      // 读取该相册文件夹内的所有文件
      const files = fs.readdirSync(folderPath);
      // 过滤出图片文件
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
      });
      
      const albumId = getAlbumId(folderName);
      
      // 尝试读取相册配置文件（如果存在）
      let title = folderName; // 默认使用文件夹名作为标题
      let date = new Date().toISOString().split('T')[0]; // 默认使用今天日期
      let description = '';
      
      const configFilePath = path.join(folderPath, 'album_config.md');
      if (fs.existsSync(configFilePath)) {
        const configContent = fs.readFileSync(configFilePath, 'utf-8');
        const { metadata } = parseAlbumConfig(configContent);
        
        title = metadata.title || folderName;
        date = metadata.date || new Date().toISOString().split('T')[0];
        description = metadata.description || '';
      } else {
        // 如果没有配置文件，尝试从文件夹名生成标题（转为中文提示）
        title = folderName.replace(/[_-]/g, ' ');
      }
      
      console.log(`📊 相册信息: ID=${albumId}, 标题="${title}", 图片数量=${imageFiles.length}`);
      
      albums.push({
        id: albumId,
        title: title,
        date: date,
        count: imageFiles.length,
        description: description
      });
    } catch (error) {
      console.error(`❌ 处理相册文件夹 ${folderName} 时出错:`, error);
      // 添加一个带错误标记的相册条目
      const albumId = getAlbumId(folderName);
      albums.push({
        id: albumId,
        title: `Error processing ${folderName}`,
        date: '',
        count: 0,
        description: `Error: ${(error as Error).message}`
      });
    }
  }
  
  // 按日期排序（最新的在前）
  albums.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return isNaN(dateB) ? (isNaN(dateA) ? 0 : -1) : (isNaN(dateA) ? 1 : dateB - dateA);
  });
  
  // 写入JSON文件
  fs.writeFileSync(outputFilePath, JSON.stringify(albums, null, 2));
  
  console.log(`\n✅ 成功生成 albumcontext.json 文件`);
  console.log(`📁 找到了 ${albums.length} 个相册`);
  albums.forEach(album => {
    console.log(`📸 ${album.id}: ${album.title} (${album.count} 张照片)`);
  });
};

// 执行生成
try {
  generateAlbumsJson();
} catch (error) {
  console.error('❌ 脚本执行失败:', error);
}