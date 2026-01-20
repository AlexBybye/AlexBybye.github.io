// 引入node原生模块，零依赖，脚本与子文件夹同级存放即可，无需配置路径
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// 极简配置区 - 只有2个简单开关，不用改路径！
const CONFIG = {
  // 支持的图片格式，按需增删即可
  supportImageExts: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  // 是否递归处理文件夹内的子文件夹 true=递归  false=只处理当前文件夹一级图片
  isRecursive: true
};

// 创建命令行输入交互
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * 递归读取指定文件夹内的所有图片文件
 */
function getAllImageFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullFilePath = path.join(dir, file.name);
    if (file.isDirectory() && CONFIG.isRecursive) {
      getAllImageFiles(fullFilePath, fileList);
    } else if (file.isFile()) {
      // 获取文件后缀并过滤图片
      const ext = path.extname(file.name).toLowerCase().slice(1);
      if (CONFIG.supportImageExts.includes(ext)) {
        fileList.push(fullFilePath);
      }
    }
  }
  return fileList;
}

/**
 * 检查目标文件名是否已存在
 */
function isTargetNameExists(targetDir: string, baseName: string, ext: string): boolean {
  const targetPath = path.join(targetDir, `${baseName}${ext}`);
  return fs.existsSync(targetPath);
}

/**
 * 核心重命名方法 - 严格生成 photo_数字.原格式，带安全检查
 */
function renameFolderImages(targetDir: string): number {
  try {
    const imageFiles = getAllImageFiles(targetDir);
    if (imageFiles.length === 0) {
      console.log(`✅ 该文件夹内无图片文件，无需处理`);
      return 0;
    }

    // 检查是否已经有重名的文件，避免覆盖
    const conflicts = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const ext = path.extname(imageFiles[i]).toLowerCase();
      const newFileName = `photo_${i + 1}${ext}`;
      const newFilePath = path.join(targetDir, newFileName);
      
      if (fs.existsSync(newFilePath) && imageFiles[i] !== newFilePath) {
        conflicts.push(newFileName);
      }
    }
    
    if (conflicts.length > 0) {
      console.log(`⚠️  警告：以下文件已存在，重命名可能导致覆盖：`);
      conflicts.forEach(conflict => console.log(`   - ${conflict}`));
      rl.question('是否继续？(y/N): ', (answer) => {
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          console.log('操作已取消');
          rl.close();
          return 0;
        }
        
        // 执行重命名
        let successCount = 0;
        imageFiles.forEach((filePath, index) => {
          const ext = path.extname(filePath).toLowerCase();
          const newFileName = `photo_${index + 1}${ext}`; // 核心命名规则，序号从1开始
          const newFilePath = path.join(path.dirname(filePath), newFileName);
          
          // 只有当源文件和目标文件不同时才重命名
          if (filePath !== newFilePath) {
            fs.renameSync(filePath, newFilePath);
            successCount++;
            console.log(`✅ 成功: ${path.basename(filePath)} → ${newFileName}`);
          } else {
            console.log(`ℹ️  跳过: ${newFileName} (文件名已符合规范)`);
          }
        });
        
        console.log(`\n----------------------------------------`);
        console.log(`🎉 处理完成！共成功重命名 ${successCount} 张图片`);
        rl.close();
      });
      return conflicts.length; // 返回冲突数，实际处理将在回调中完成
    }

    // 执行重命名
    let successCount = 0;
    imageFiles.forEach((filePath, index) => {
      const ext = path.extname(filePath).toLowerCase();
      const newFileName = `photo_${index + 1}${ext}`; // 核心命名规则，序号从1开始
      const newFilePath = path.join(path.dirname(filePath), newFileName);
      
      // 只有当源文件和目标文件不同时才重命名
      if (filePath !== newFilePath) {
        fs.renameSync(filePath, newFilePath);
        successCount++;
        console.log(`✅ 成功: ${path.basename(filePath)} → ${newFileName}`);
      } else {
        console.log(`ℹ️  跳过: ${newFileName} (文件名已符合规范)`);
      }
    });
    return successCount;
  } catch (error) {
    console.error(`❌ 处理失败: `, (error as Error).message);
    return 0;
  }
}

/**
 * 主程序 - 核心逻辑
 */
function main() {
  rl.question('请输入要处理的【相册文件夹名称】（相对于public/album目录）：', (folderName) => {
    const targetFolder = folderName.trim();
    // 校验输入
    if (!targetFolder) {
      console.error('❌ 错误：文件夹名称不能为空！');
      rl.close();
      return;
    }

    // ✅ 关键：使用项目根目录下的public/album目录
    const targetFolderPath = path.join(process.cwd(), 'public', 'album', targetFolder);

    // 校验文件夹是否存在
    if (!fs.existsSync(targetFolderPath)) {
      console.error(`❌ 错误：在public/album目录下未找到【${targetFolder}】文件夹！`);
      console.log(`🔍 尝试路径：${targetFolderPath}`);
      rl.close();
      return;
    }
    if (!fs.statSync(targetFolderPath).isDirectory()) {
      console.error(`❌ 错误：【${targetFolder}】不是文件夹！`);
      rl.close();
      return;
    }

    console.log(`\n📌 开始处理 → 目标文件夹：${targetFolderPath}`);
    console.log(`----------------------------------------\n`);

    // 执行重命名
    const successNum = renameFolderImages(targetFolderPath);

    // 如果没有冲突，则直接输出完成信息
    if (successNum >= 0) { // 正常情况下的返回值是>=0的
      console.log(`\n----------------------------------------`);
      console.log(`🎉 处理完成！共成功重命名 ${successNum} 张图片`);
      rl.close();
    }
    // 如果有冲突，完成信息将在回调中输出
  });
}

// 启动脚本
main();