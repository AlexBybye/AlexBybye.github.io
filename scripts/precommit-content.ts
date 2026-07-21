import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const output = execFileSync('git', ['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMDRT'])
const staged = output.toString('utf8').split('\0').filter(Boolean)
const albumFolders = new Set<string>()
const optimizeRoots = new Set<string>()
let articlesChanged = false
let musicChanged = false

interface SourceState { size: number; mtimeMs: number }
const gitDir = execFileSync('git', ['rev-parse', '--git-dir'], { encoding: 'utf8' }).trim()
const stateFile = path.resolve(gitDir, 'blog-album-sources.json')
const albumRoot = path.join(process.cwd(), 'public', 'album')

function scanAlbumSources(): Record<string, SourceState> {
  const state: Record<string, SourceState> = {}
  for (const album of fs.readdirSync(albumRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
    const folder = path.join(albumRoot, album.name)
    for (const file of fs.readdirSync(folder).filter((name) => /\.(jpg|jpeg|png)$/i.test(name))) {
      const stats = fs.statSync(path.join(folder, file))
      state[`${album.name}/${file}`] = { size: stats.size, mtimeMs: stats.mtimeMs }
    }
  }
  return state
}

const currentSources = scanAlbumSources()
const previousSources = fs.existsSync(stateFile)
  ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) as Record<string, SourceState>
  : currentSources
for (const source of new Set([...Object.keys(previousSources), ...Object.keys(currentSources)])) {
  const previous = previousSources[source]
  const current = currentSources[source]
  if (!previous || !current || previous.size !== current.size || previous.mtimeMs !== current.mtimeMs) {
    albumFolders.add(source.split('/')[0])
    if (previous && !current) {
      const webp = path.join(albumRoot, source.replace(/\.(jpg|jpeg|png)$/i, '.webp'))
      if (fs.existsSync(webp)) fs.unlinkSync(webp)
    }
  }
}

for (const file of staged) {
  const parts = file.split('/')
  if (parts[0] !== 'public') continue
  if (parts[1] === 'album' && parts.length >= 4) albumFolders.add(parts[2])
  if (parts[1] === 'article' && parts[2] && parts[2].endsWith('.md')) articlesChanged = true
  if (parts[1] === 'music' && parts[2] && /\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(parts[2])) musicChanged = true
  if (/\.(jpg|jpeg|png)$/i.test(file)) {
    if (file.startsWith('public/images/')) optimizeRoots.add('public/images')
    else if (file.startsWith('public/music/img/')) optimizeRoots.add('public/music/img')
    else if (file.startsWith('public/resources/')) optimizeRoots.add('public/resources')
  }
}

if (albumFolders.size) {
  execFileSync('npm', ['run', 'process-albums', '--', ...albumFolders], { stdio: 'inherit' })
  for (const folder of albumFolders) execFileSync('git', ['add', '--all', `public/album/${folder}`], { stdio: 'inherit' })
  execFileSync('git', ['add', 'public/album/albumcontext.json'], { stdio: 'inherit' })
}
if (articlesChanged) {
  execFileSync('npm', ['run', 'generate-articles'], { stdio: 'inherit' })
  execFileSync('git', ['add', 'public/article/articles.json'], { stdio: 'inherit' })
}
if (musicChanged) {
  execFileSync('npm', ['run', 'generate-songs'], { stdio: 'inherit' })
  execFileSync('git', ['add', 'public/music/musiccontext.json'], { stdio: 'inherit' })
}
for (const root of optimizeRoots) {
  execFileSync('npm', ['run', 'optimize-images', '--', root], { stdio: 'inherit' })
  execFileSync('git', ['add', '--all', root], { stdio: 'inherit' })
}
fs.writeFileSync(stateFile, JSON.stringify(scanAlbumSources()))
