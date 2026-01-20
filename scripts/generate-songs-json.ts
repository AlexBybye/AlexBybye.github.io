import * as fs from 'fs';
import * as path from 'path';

interface TrackInfo {
  title: string;
  artist: string;
  type: string;
  filename: string;
  coverImage: string;
  duration: number | string; // 支持字符串或数字
}

interface MusicContext {
  tracks: TrackInfo[];
}

// 扫描目录并生成或更新musiccontext.json
const generateMusicJson = () => {
  const musicDir = path.join(process.cwd(), 'public', 'music');
  const outputFilePath = path.join(process.cwd(), 'public', 'music', 'musiccontext.json');
  
  console.log(`🔍 检查目录: ${musicDir}`);
  
  if (!fs.existsSync(musicDir)) {
    console.error(`❌ 目录不存在: ${musicDir}`);
    return;
  }
  
  // 读取现有的musiccontext.json文件（如果存在）
  let existingTracks: TrackInfo[] = [];
  if (fs.existsSync(outputFilePath)) {
    try {
      const existingContent = fs.readFileSync(outputFilePath, 'utf8');
      const existingData: MusicContext = JSON.parse(existingContent);
      existingTracks = existingData.tracks || [];
      console.log(`📚 发现现有文件，包含 ${existingTracks.length} 个曲目`);
    } catch (error) {
      console.warn(`⚠️ 读取现有文件失败，将创建新文件:`, error);
    }
  }
  
  // 读取目录中的所有音频文件
  const files = fs.readdirSync(musicDir);
  console.log(`🎵 找到 ${files.length} 个文件:`, files);
  
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
  const audioFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return audioExtensions.includes(ext);
  });
  
  console.log(`🎶 找到 ${audioFiles.length} 个音频文件:`, audioFiles);
  
  // 创建现有曲目的映射，以便查找已存在的条目
  const existingTrackMap = new Map<string, TrackInfo>();
  existingTracks.forEach(track => {
    existingTrackMap.set(track.filename, track);
  });
  
  const tracks: TrackInfo[] = [];
  
  for (const fileName of audioFiles) {
    const filePath = path.join(musicDir, fileName);
    console.log(`\n🔄 处理文件: ${filePath}`);
    
    // 检查是否已经存在于现有曲目中
    const existingTrack = existingTrackMap.get(fileName);
    
    if (existingTrack) {
      // 如果已经存在，保留原有信息
      tracks.push({ ...existingTrack }); // 使用展开运算符创建副本
      console.log(`🎵 保留现有曲目信息: ${existingTrack.artist} - ${existingTrack.title} (${fileName})`);
    } else {
      // 如果是新文件，创建新条目
      try {
        // 从文件名解析标题和艺术家（基于"艺术家 - 标题.mp3"格式）
        let title = '';
        let artist = '';
        
        const parsedName = path.parse(fileName);
        const nameWithoutExt = parsedName.name;
        
        // 尝试解析 "Artist - Title" 格式的文件名
        const parts = nameWithoutExt.split(' - ');
        if (parts.length >= 2) {
          artist = parts[0].trim();
          title = parts.slice(1).join(' - ').trim(); // 处理标题中可能包含 " - " 的情况
        } else {
          // 如果无法解析，则使用文件名作为标题，艺术家设为未知
          title = nameWithoutExt;
          artist = 'Unknown Artist';
        }
        
        // 从文件名派生类型和封面图片
        // 类型暂时为空，按照您的要求
        const type = ''; 
        
        // 封面图片名称基于类型，但后缀为.jpg
        const coverImage = `img/${type}.jpg`;
        
        // 持续时间设置为空字符串，让您自己填写
        const duration = '';
        
        const newTrack: TrackInfo = {
          title,
          artist,
          type,
          filename: fileName,
          coverImage,
          duration
        };
        
        tracks.push(newTrack);
        
        console.log(`🎵 新增曲目信息:`, {
          title,
          artist,
          type,
          filename: fileName,
          coverImage,
          duration
        });
      } catch (error) {
        console.error(`❌ 处理文件 ${fileName} 时出错:`, error);
        // 添加一个带错误标记的曲目条目
        tracks.push({
          title: `Error processing ${fileName}`,
          artist: 'Unknown',
          type: '',
          filename: fileName,
          coverImage: 'img/error.jpg',
          duration: ''
        });
      }
    }
  }
  
  // 检查是否有已删除的文件（即存在于旧文件中但不在当前目录中的文件）
  const currentFileNames = new Set(audioFiles);
  const remainingTracks = tracks.filter(track => currentFileNames.has(track.filename));
  
  if (remainingTracks.length !== tracks.length) {
    console.log(`🗑️ 移除了 ${tracks.length - remainingTracks.length} 个已删除的文件`);
    tracks.splice(0, tracks.length, ...remainingTracks);
  }
  
  const musicContext: MusicContext = { tracks };
  
  // 写入JSON文件
  fs.writeFileSync(outputFilePath, JSON.stringify(musicContext, null, 2));
  
  console.log(`\n✅ 成功生成/更新 musiccontext.json 文件`);
  console.log(`📁 最终包含 ${tracks.length} 首歌曲`);
  tracks.forEach(track => {
    console.log(`🎵 ${track.artist} - ${track.title} (${track.filename}) [${track.duration}]`);
  });
};

// 执行生成
try {
  generateMusicJson();
} catch (error) {
  console.error('❌ 脚本执行失败:', error);
}