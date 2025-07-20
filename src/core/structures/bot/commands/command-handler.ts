import { REST, Routes } from 'discord.js'
import type { CommandBaseProtocol } from '@/core/structures/bot/commands/protocols'
import { constants } from '@/infra/common'
import { env, isDevelopment, isLocal } from '@/infra/env'
import { CacheFactory, type CacheFactoryType } from '@/infra/libs/cache'
import { Collection } from '@/infra/libs/collection'
import { logger } from '@/utils'
import { CommandLoader } from './command-loader'

export class CommandHandler {
  private commands: Collection<string, CommandBaseProtocol> = new Collection()
  private commandLoader: CommandLoader

  constructor(
    private readonly commandsDir = constants.COMMANDS_DIR,
    private readonly cacheFactoryType: CacheFactoryType = 'none'
    /* 
      TODO: Remover isso daqui e deixar o comando fluir, ao menos deixar uma
      instrução para o desenvolvedor que alguns comandos fazem parte de sistema
      de cache e caso queira ativar isso é preciso subir um cache presente
      na pasta do cache/adapters
    */
  ) {
    const cache = CacheFactory.createCache(this.cacheFactoryType)
    this.commandLoader = new CommandLoader(this.commandsDir, cache)
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
          for (const guildId of env.TEST_GUILD_IDS) {
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
