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
      const CommandClass = commandModule.default

      if (CommandClass && typeof CommandClass === 'function') {
        const command = new CommandClass()

        if (command instanceof CommandBase && 'execute' in command) {
          this.commands.set(command.name, command)
        } else {
          logger.warn(
            `O comando em ${filePath} não é uma instância válida de CommandBase ou não tem um método 'execute'.`
          )
        }
      } else {
        logger.warn(
          `O arquivo ${filePath} não exporta uma classe de comando válida.`
        )
      }
    } catch (error) {
      logger.error(`Erro ao carregar o comando em ${filePath}:`, error)
    }
  }
}
