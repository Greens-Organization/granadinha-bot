import 'reflect-metadata'
import { join } from 'node:path'
import { resolveAliasPath } from '@/core/helpers/resolve-alias-path'
import { logger } from '@/utils'
import { Glob } from 'bun'
import { CommandBase } from './command-base'
import type { CommandBaseProtocol } from './protocols'
import type { CacheInterface } from '@/infra/libs/cache/cache-interface'

export class CommandLoader {
  private commands: Map<string, CommandBaseProtocol> = new Map()

  constructor(
    private readonly commandsDir: string,
    private readonly cache?: CacheInterface
  ) {}

  async loadCommands(): Promise<Map<string, CommandBaseProtocol>> {
    const resolvedDir = resolveAliasPath(this.commandsDir)

    const glob = new Glob('**/*.{ts,js}')
    const files = await Array.fromAsync(glob.scan({ cwd: resolvedDir }))

    for (const file of files) {
      const fullPath = join(resolvedDir, file)
      await this.loadFiles(fullPath)
    }

    return this.commands
  }

  private async loadFiles(filePath: string): Promise<void> {
    try {
      const commandModule = await import(filePath)

      if (!commandModule.default) {
        logger.warn(
          `O arquivo ${filePath} não tem uma exportação padrão (default).`
        )
        return
      }

      const CommandClass = commandModule.default

      if (typeof CommandClass !== 'function') {
        logger.warn(
          `A exportação padrão de ${filePath} não é uma classe ou função.`
        )
        return
      }

      const needsCache = Reflect.getMetadata('needsCache', CommandClass)
      const commandInstance = needsCache
        ? new CommandClass(this.cache)
        : new CommandClass()

      if (!(commandInstance instanceof CommandBase)) {
        logger.warn(
          `O comando em ${filePath} não é uma instância de CommandBase.`
        )
        return
      }

      if (typeof commandInstance.execute !== 'function') {
        logger.warn(`O comando em ${filePath} não tem um método 'execute'.`)
        return
      }

      if (
        typeof commandInstance.name !== 'string' ||
        commandInstance.name.length === 0
      ) {
        logger.warn(`O comando em ${filePath} não tem um nome válido.`)
        return
      }

      this.commands.set(commandInstance.name, commandInstance)
    } catch (error) {
      logger.error(`Erro ao carregar o comando em ${filePath}:`, error)
    }
  }
}
