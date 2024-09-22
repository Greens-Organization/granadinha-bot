import { makeOWRotationRandom } from '@/application/usecases/games/overwatch/rotations/factories'
import { SlashCommandBuilder } from '@discordjs/builders'
import { type CommandInteraction, EmbedBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('ow-rotation')
  .setDescription('Gera uma rotação de campeões do Overwatch para os jogadores')

export async function execute(interaction: CommandInteraction): Promise<void> {
  try {
    const rotation = await (await makeOWRotationRandom()).assignHeroesToPlayers(
      ['Alpha', 'Matheus', 'Luiz', 'Bseven']
    )

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Rotação de Campeões do Overwatch')
      .setDescription('Aqui está a rotação de campeões para os jogadores:')
      .addFields(
        rotation.map(({ player, hero, role }) => ({
          name: player,
          value: `${hero} (${role})`,
          inline: false
        }))
      )
      .setTimestamp()
      .setFooter({ text: 'Boa sorte e divirta-se!' })

    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    if (error instanceof Error) {
      await interaction.reply({ content: error.message, ephemeral: true })
    } else {
      await interaction.reply({
        content: 'Ocorreu um erro ao gerar a rotação.',
        ephemeral: true
      })
    }
  }
}
