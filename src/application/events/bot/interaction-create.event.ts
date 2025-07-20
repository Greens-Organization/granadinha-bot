import { Events, type Interaction } from 'discord.js'
import { CommandHandlerManager } from '@/core/structures/bot/commands/command-handler-manager'
import { EventBase } from '@/core/structures/bot/events/event-base'
import { logger } from '@/utils'

export default class InteractionCreate extends EventBase<Events.InteractionCreate> {
  constructor() {
    super(Events.InteractionCreate)
  }

  async execute(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return

    const commandHandlerManager = CommandHandlerManager.getInstance()
    const commandHandler = commandHandlerManager.getCommandHandler()

    const command = commandHandler.getCommand(interaction.commandName)
    if (!command) {
      logger.error(
        `Nenhum comando correspondente "${interaction.commandName}" foi encontrado.`
      )
      await this.sendErrorResponse(interaction, 'Comando não encontrado.')
      return
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      logger.error(
        `Erro ao executar o comando "${interaction.commandName}":`,
        error
      )
      await this.sendErrorResponse(
        interaction,
        'Ocorreu um erro ao executar este comando!'
      )
    }
  }

  private async sendErrorResponse(
    interaction: Interaction,
    content: string
  ): Promise<void> {
    if (!interaction.isRepliable()) return
    const errorResponse = { content, ephemeral: true }
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorResponse)
    } else {
      await interaction.reply(errorResponse)
    }
  }
}
