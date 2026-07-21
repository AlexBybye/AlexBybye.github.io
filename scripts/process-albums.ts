import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { optimizeImages } from './optimize-images'
import { normalizeAlbumFolder } from './normalize-album-images'

const root = path.join(process.cwd(), 'public', 'album')
const sourceExtensions = new Set(['.jpg', '.jpeg', '.png'])

function pruneOrphanWebp(folder: string) {
  const files = fs.readdirSync(folder)
  const sources = files.filter((name) => sourceExtensions.has(path.extname(name).toLowerCase()))
  if (sources.length === 0) return
  const sourceBases = new Set(sources.map((name) => path.parse(name).name))
  for (const name of files.filter((entry) => entry.toLowerCase().endsWith('.webp'))) {
    if (!sourceBases.has(path.parse(name).name)) {
      fs.unlinkSync(path.join(folder, name))
      console.log(`Removed orphan WebP: ${path.join(folder, name)}`)
    }
  }
}

const folders = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
const targets = folders.length ? folders : fs.readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
for (const folder of targets) {
  normalizeAlbumFolder(folder)
  pruneOrphanWebp(path.join(root, folder))
  const result = await optimizeImages([path.join(root, folder)])
  if (result.created.length) console.log(`Generated ${result.created.length} WebP file(s) in ${folder}`)
}
execFileSync('npm', ['run', 'generate-albums', '--', '--no-prompt'], { stdio: 'inherit' })
