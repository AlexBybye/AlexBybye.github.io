import { readdir, stat } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import sharp from 'sharp'

export const defaultRoots = ['public/album', 'public/images', 'public/music/img', 'public/resources']
const supported = new Set(['.jpg', '.jpeg', '.png'])

async function collect(directory: string): Promise<string[]> {
  const entries = await readdir(directory)
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry)
    return (await stat(path)).isDirectory() ? collect(path) : [path]
  }))
  return files.flat()
}

export interface OptimizationResult { created: string[]; originalBytes: number; optimizedBytes: number }

export async function optimizeImages(roots: string[]): Promise<OptimizationResult> {
  const result: OptimizationResult = { created: [], originalBytes: 0, optimizedBytes: 0 }
  for (const root of roots) {
    let rootStats
    try { rootStats = await stat(root) } catch { continue }
    if (!rootStats.isDirectory()) continue
    for (const input of await collect(root)) {
      const extension = extname(input).toLowerCase()
      if (!supported.has(extension)) continue
      const output = input.slice(0, -extension.length) + '.webp'
      try {
        const outputStats = await stat(output)
        const inputStats = await stat(input)
        if (outputStats.mtimeMs >= inputStats.mtimeMs) continue
      } catch { /* Missing derivative. */ }
      const inputStats = await stat(input)
      await sharp(input).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78, effort: 4 }).toFile(output)
      const outputStats = await stat(output)
      result.created.push(output)
      result.originalBytes += inputStats.size
      result.optimizedBytes += outputStats.size
    }
  }
  return result
}

if (process.argv[1] && relative(process.cwd(), process.argv[1]) === 'scripts/optimize-images.ts') {
  const roots = process.argv.slice(2).length > 0 ? process.argv.slice(2) : defaultRoots
  const result = await optimizeImages(roots)
  const savedMb = (result.originalBytes - result.optimizedBytes) / 1024 / 1024
  console.log(`Generated ${result.created.length} WebP files, reducing transferred bytes by about ${savedMb.toFixed(1)} MB.`)
}
