import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceExtensions = new Set(['.jpg', '.jpeg', '.png'])
const albumRoot = path.join(process.cwd(), 'public', 'album')

export function normalizeAlbumFolder(folderName: string): string[] {
  const folder = path.join(albumRoot, folderName)
  if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) throw new Error(`Album not found: ${folderName}`)
  const files = fs.readdirSync(folder).filter((name) => sourceExtensions.has(path.extname(name).toLowerCase()))
  const used = new Set<number>()
  const numbered = /^photo_(\d+)\.(jpg|jpeg|png)$/i
  for (const name of files) {
    const match = name.match(numbered)
    if (match) used.add(Number(match[1]))
  }
  const pending = files.filter((name) => !numbered.test(name)).sort((a, b) => a.localeCompare(b, 'zh-CN'))
  const moves: Array<{ source: string; target: string; webp?: string }> = []
  let next = 1
  for (const source of pending) {
    while (used.has(next)) next++
    const target = `photo_${next}${path.extname(source).toLowerCase()}`
    const webp = `${path.parse(source).name}.webp`
    moves.push({ source, target, webp: fs.existsSync(path.join(folder, webp)) ? webp : undefined })
    used.add(next++)
  }
  const changed: string[] = []
  moves.forEach(({ source, webp }, index) => {
    const temp = `.album-rename-${process.pid}-${index}`
    fs.renameSync(path.join(folder, source), path.join(folder, `${temp}${path.extname(source).toLowerCase()}`))
    if (webp) fs.renameSync(path.join(folder, webp), path.join(folder, `${temp}.webp`))
  })
  moves.forEach(({ source, target, webp }, index) => {
    const temp = `.album-rename-${process.pid}-${index}`
    fs.renameSync(path.join(folder, `${temp}${path.extname(source).toLowerCase()}`), path.join(folder, target))
    if (webp) fs.renameSync(path.join(folder, `${temp}.webp`), path.join(folder, `${path.parse(target).name}.webp`))
    changed.push(path.join(folder, target))
  })
  return changed
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const requested = process.argv.slice(2)
  const folders = requested.includes('--all')
    ? fs.readdirSync(albumRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    : requested.filter((arg) => !arg.startsWith('--'))
  for (const folder of folders) {
    const changed = normalizeAlbumFolder(folder)
    if (changed.length) console.log(`Normalized ${changed.length} image(s) in ${folder}`)
  }
}
