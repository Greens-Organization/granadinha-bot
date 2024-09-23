import { SlashCommandBuilder, type CommandInteraction } from 'discord.js'

/* 
  TODO: Infelizmente essa classe SlashCommandBuilder não temos controle sobre ela, pois ela vem direto do modulo do discord.js. E atualmente, ela é bem robusta para o que a API do discord pede, em relação a criação de um slash command. Que mudou drasticamente de sua versão '9' para '10', que trabalhamos hoje em dia.
*/
export abstract class CommandBase extends SlashCommandBuilder {
  abstract execute(interaction: CommandInteraction): Promise<void>
}
