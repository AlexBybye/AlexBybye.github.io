import { readdir, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import sharp from 'sharp'

const roots = ['public/album', 'public/images', 'public/music/img', 'public/resources']
const supported = new Set(['.jpg', '.jpeg', '.png'])

async function collect(directory: string): Promise<string[]> {
  const entries = await readdir(directory)
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry)
    return (await stat(path)).isDirectory() ? collect(path) : [path]
  }))
  return files.flat()
}

let created = 0
let originalBytes = 0
let optimizedBytes = 0

for (const root of roots) {
  for (const input of await collect(root)) {
    const extension = extname(input).toLowerCase()
    if (!supported.has(extension)) continue
    const output = input.slice(0, -extension.length) + '.webp'
    try {
      await stat(output)
      continue
    } catch {
      // Generate only missing derivatives so the script is safe to rerun.
    }

    const inputStats = await stat(input)
    await sharp(input)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 })
      .toFile(output)
    const outputStats = await stat(output)
    created += 1
    originalBytes += inputStats.size
    optimizedBytes += outputStats.size
  }
}

const savedMb = (originalBytes - optimizedBytes) / 1024 / 1024
console.log(`Generated ${created} WebP files, reducing transferred bytes by about ${savedMb.toFixed(1)} MB.`)
