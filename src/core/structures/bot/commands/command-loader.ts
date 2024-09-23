import { logger } from '@/utils'
import type { CommandBaseProtocol } from './protocols'
import { readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { resolveAliasPath } from '@/core/helpers/resolve-alias-path'
import { CommandBase } from './command-base'

export class CommandLoader {
  private commands: Map<string, CommandBaseProtocol> = new Map()

  constructor(private readonly commandsDir: string) {}

  async loadCommands(): Promise<Map<string, CommandBaseProtocol>> {
    const resolvedDir = resolveAliasPath(this.commandsDir)

    const files = await readdir(resolvedDir, {
      withFileTypes: true,
      recursive: true
    })

    // for (const file of files) {
    //   if (
    //     file.isFile() &&
    //     (file.name.endsWith('.ts') || file.name.endsWith('.js'))
    //   ) {
    //     const relativePath = relative(
    //       resolvedDir,
    //       join(file.parentPath, file.name)
    //     )
    //     const fullPath = join(resolvedDir, relativePath)
    //     await this.loadCommandFile(fullPath)
    //   }
    // }

    const loadAllFiles = files
      .filter(
        (file) =>
          file.isFile() &&
          (file.name.endsWith('.ts') || file.name.endsWith('.js'))
      )
      .map((file) => {
        const relativePath = relative(
          resolvedDir,
          join(file.parentPath, file.name)
        )
        const fullPath = join(resolvedDir, relativePath)
        return this.loadCommandFile(fullPath)
      })
    await Promise.all(loadAllFiles)

    return this.commands
  }
  private async loadCommandFile(filePath: string): Promise<void> {
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
