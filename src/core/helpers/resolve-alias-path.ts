import { join } from 'node:path'

export function resolveAliasPath(path: string) {
  if (path.startsWith('@/')) {
    const rootDir = process.cwd()
    return join(rootDir, 'src', path.slice(2))
  }
  return path
}
