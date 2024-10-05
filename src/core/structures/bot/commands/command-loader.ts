import { join } from 'node:path'
import { resolveAliasPath } from '@/core/helpers/resolve-alias-path'
import { logger } from '@/utils'
import { Glob } from 'bun'
import { CommandBase } from './command-base'
import type { CommandBaseProtocol } from './protocols'

export class CommandLoader {
  private commands: Map<string, CommandBaseProtocol> = new Map()

  constructor(private readonly commandsDir: string) {}

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

      const command = new CommandClass()

      if (!(command instanceof CommandBase)) {
        logger.warn(
          `O comando em ${filePath} não é uma instância de CommandBase.`
        )
        return
      }

      if (typeof command.execute !== 'function') {
        logger.warn(`O comando em ${filePath} não tem um método 'execute'.`)
        return
      }

      if (typeof command.name !== 'string' || command.name.length === 0) {
        logger.warn(`O comando em ${filePath} não tem um nome válido.`)
        return
      }

      this.commands.set(command.name, command)
    } catch (error) {
      logger.error(`Erro ao carregar o comando em ${filePath}:`, error)
    }
  }
}
