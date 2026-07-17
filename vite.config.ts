import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { copyFileSync } from 'fs'
import { join } from 'path'

// 自定义插件：复制 .nojekyll 文件到输出目录
function copyNoJekyllPlugin() {
  return {
    name: 'copy-nojekyll',
    closeBundle() {
      // 在构建完成后复制 .nojekyll 文件到输出目录
      const outputPath = join(process.cwd(), 'dist', '.nojekyll');
      const inputPath = join(process.cwd(), '.nojekyll');
      
      try {
        copyFileSync(inputPath, outputPath);
      } catch (error) {
        console.error('无法复制 .nojekyll 文件:', (error as Error).message);
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    copyNoJekyllPlugin(), // 添加自定义插件
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        // 确保文件名不会产生冲突或特殊字符
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name].[hash][extname]';
          }
          // 对于其他资源文件，确保正确的扩展名
          return 'assets/[name].[hash][extname]';
        },
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  },
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: false,
  },
  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: false,
  },
  // 静态资源服务配置，有助于解决部署时的MIME类型问题
  optimizeDeps: {
    exclude: ['canvas-confetti']
  }
})
