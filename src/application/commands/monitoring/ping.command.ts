import { CommandBase } from '@/core/structures/bot/commands/command-base'
import type { CommandInteraction } from 'discord.js'

export default class Ping extends CommandBase {
  constructor() {
    super()
    this.setName('ping').setDescription('Replies with Pong!')
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    const reply = await interaction.reply({
      content: 'Pinging...',
      fetchReply: true,
      ephemeral: true
    })
    const latency = reply.createdTimestamp - interaction.createdTimestamp
    await interaction.editReply(`Pong! Latency is ${latency}ms.`)
  }
}
