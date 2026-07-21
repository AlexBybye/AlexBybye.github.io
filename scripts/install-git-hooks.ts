import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const gitDir = execFileSync('git', ['rev-parse', '--git-dir'], { encoding: 'utf8' }).trim()
const hookPath = path.resolve(gitDir, 'hooks', 'pre-commit')
const marker = '# blog content pre-commit hook'
const content = `#!/bin/sh\n${marker}\nset -e\nexec npm run precommit:content\n`
fs.mkdirSync(path.dirname(hookPath), { recursive: true })
if (!fs.existsSync(hookPath) || fs.readFileSync(hookPath, 'utf8').includes(marker)) {
  fs.writeFileSync(hookPath, content, { mode: 0o755 })
  fs.chmodSync(hookPath, 0o755)
  console.log(`Installed ${hookPath}`)
} else {
  console.warn(`Skipped existing pre-commit hook: ${hookPath}`)
}
