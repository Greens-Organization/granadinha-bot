import { existsSync } from 'node:fs'
import { join } from 'node:path'

export function resolveAliasPath(path: string): string {
  if (path.startsWith('@/')) {
    const rootDir = process.cwd()
    const withSrc = join(rootDir, 'src', path.slice(2))
    const withoutSrc = join(rootDir, path.slice(2))

    return existsSync(withSrc) ? withSrc : withoutSrc
  }
  return path
}
