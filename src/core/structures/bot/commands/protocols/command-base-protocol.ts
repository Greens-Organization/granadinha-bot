import type { CommandInteraction, SlashCommandBuilder } from 'discord.js'

export interface CommandBaseProtocol extends SlashCommandBuilder {
  execute: (interaction: CommandInteraction) => Promise<void>
}
