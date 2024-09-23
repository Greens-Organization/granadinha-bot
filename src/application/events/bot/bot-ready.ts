import { CommandHandlerManager } from '@/core/structures/bot/commands/command-handler-manager'
import { EventBase } from '@/core/structures/bot/events/event-base'
import { logger } from '@/utils'
import { type Client, Events } from 'discord.js'

export default class ClientReadyEvent extends EventBase<Events.ClientReady> {
  constructor(readonly client: Client) {
    super(Events.ClientReady, true, client)
  }

  async execute(): Promise<void> {
    try {
      const commandHandlerManager = CommandHandlerManager.getInstance()
      await commandHandlerManager.initCommandHandler()

      logger.info(`Bot está online como ${this.client.user?.tag}`)
    } catch (error) {
      logger.error('Erro ao inicializar o bot:', error)
    }
  }
}
