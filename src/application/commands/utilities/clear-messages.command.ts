import { CommandBase } from '@/core/structures/bot/commands/command-base'
import { sleep } from 'bun'
import {
  AuditLogEvent,
  type CommandInteraction,
  type Guild,
  PermissionFlagsBits,
  TextChannel
} from 'discord.js'

export default class ClearMessages extends CommandBase {
  constructor() {
    super()
    this.setName('clear')
      .setDescription('Remove mensagens de um servidor.')
      .addIntegerOption((option) =>
        option
          .setName('quantidade')
          .setDescription('Número de mensagens a serem deletadas (máximo 100)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(100)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: 'Este comando só pode ser usado em servidores.',
        ephemeral: true
      })
      return
    }

    if (
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)
    ) {
      await interaction.reply({
        content: 'Você não tem permissão para usar este comando.',
        ephemeral: true
      })
      return
    }

    const channel = interaction.channel
    if (!(channel instanceof TextChannel)) {
      await interaction.reply({
        content: 'Este comando só pode ser usado em canais de texto.',
        ephemeral: true
      })
      return
    }

    const amount = interaction.options.get('quantidade', true)?.value as number

    await interaction.deferReply({ ephemeral: true })

    try {
      const result = await this.deleteMessagesAndLog(
        interaction,
        channel,
        amount
      )
      await interaction.editReply(result)
    } catch (error) {
      console.error('Erro ao processar o comando:', error)
      await interaction.editReply(
        'Ocorreu um erro ao processar o comando. Por favor, tente novamente mais tarde.'
      )
    }
  }

  private async deleteMessagesAndLog(
    interaction: CommandInteraction,
    channel: TextChannel,
    amount: number
  ): Promise<string> {
    const botId = interaction.client.user.id
    const actionTimestamp = Date.now()

    // Deletar mensagens
    const messages = await channel.bulkDelete(amount, true)

    // Verificar o audit log
    let auditLogEntry = null
    if (
      interaction.guild?.members.me?.permissions.has(
        PermissionFlagsBits.ViewAuditLog
      )
    ) {
      auditLogEntry = await this.findAuditLogEntry(
        interaction.guild,
        channel.id,
        botId,
        actionTimestamp,
        messages.size
      )
    }

    // Preparar a mensagem de resposta
    let response = `Deletadas ${messages.size} mensagens.`
    if (auditLogEntry) {
      response += ` Ação registrada no audit log por ${auditLogEntry.executor?.tag}.`
    } else {
      response += ' Não foi possível verificar o registro no audit log.'
    }

    return response
  }

  private async findAuditLogEntry(
    guild: Guild,
    channelId: string,
    botId: string,
    actionTimestamp: number,
    messageCount: number,
    maxAttempts = 5
  ): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      const auditLogs = await guild.fetchAuditLogs({
        type: AuditLogEvent.MessageBulkDelete,
        limit: 5
      })

      const entry = auditLogs.entries.find(
        (entry: {
          executorId: any
          targetId: any
          createdTimestamp: number
          extra: { count: any }
        }) =>
          entry.executorId === botId &&
          entry.targetId === channelId &&
          entry.createdTimestamp >= actionTimestamp &&
          entry.extra.count === messageCount
      )

      if (entry) {
        return entry
      }

      // Espera curta entre tentativas
      await sleep(200)
    }

    return null
  }
}
