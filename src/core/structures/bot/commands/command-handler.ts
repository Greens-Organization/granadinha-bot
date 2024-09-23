import { Collection, REST, Routes } from 'discord.js'
import type { CommandBaseProtocol } from '@/core/structures/bot/commands/protocols'
import { CommandLoader } from './command-loader'
import { constants } from '@/infra/common'
import { env, isDevelopment, isLocal } from '@/infra/env'
import { logger } from '@/utils'

export class CommandHandler {
  private commands: Collection<string, CommandBaseProtocol> = new Collection()
  private commandLoader: CommandLoader

  constructor(private readonly commandsDir = constants.COMMANDS_DIR) {
    this.commandLoader = new CommandLoader(this.commandsDir)
  }

  async init(): Promise<void> {
    const loadedCommands = await this.commandLoader.loadCommands()
    this.commands = new Collection(loadedCommands)
    await this.registerSlashCommands()
  }

  private async registerSlashCommands(): Promise<void> {
    const rest = new REST({ version: constants.DISCORD_API_VERSION }).setToken(
      env.BOT_TOKEN
    )
    const commandsData = this.commands.map((command) => command)

    try {
      // TODO: remover isso depois e da uma forma de transformar isso em um
      // web streaming ou coisa parecida para ler em corrência, para adicionar
      // em todos os servidores que o granadinha estiver.
      if (isDevelopment || isLocal) {
        if (env.TEST_GUILD_IDS) {
          const testGuildIds = env.TEST_GUILD_IDS.split(',').map((id) =>
            id.trim()
          )
          for (const guildId of testGuildIds) {
            await rest.put(
              Routes.applicationGuildCommands(env.APPLICATION_ID, guildId),
              { body: commandsData }
            )
          }
        }
      } else {
        await rest.put(Routes.applicationCommands(env.APPLICATION_ID), {
          body: commandsData
        })
      }
    } catch (error) {
      logger.error('Erro ao registrar comandos slash:', error)
    }
  }

  getCommand(commandName: string): CommandBaseProtocol | undefined {
    return this.commands.get(commandName)
  }
}
