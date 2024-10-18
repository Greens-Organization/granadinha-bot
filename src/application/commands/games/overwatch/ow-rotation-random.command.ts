import { makeOWRotationRandom } from '@/application/usecases/games/overwatch/rotations/factories'
import { CommandBase } from '@/core/structures/bot/commands/command-base'
import { sleep } from 'bun'
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  type CommandInteraction,
  ComponentType,
  EmbedBuilder,
  type GuildMember,
  type Message,
  StringSelectMenuBuilder
} from 'discord.js'

export default class OWRotationRandom extends CommandBase {
  private mainMessage: Message | null = null
  constructor() {
    super()
    this.setName('ow-rotation').setDescription(
      'Gera uma rotação de campeões do Overwatch para os jogadores'
    )
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    if (!interaction.isCommand() || !interaction.inCachedGuild()) {
      await interaction.reply({
        content: 'Este comando só pode ser usado em um servidor.',
        ephemeral: true
      })
      return
    }

    const guildMembers = await interaction.guild.members.fetch()
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select-players')
      .setPlaceholder('Selecione até 5 jogadores')
      .setMinValues(1)
      .setMaxValues(5)
      .addOptions(
        guildMembers.map((member) => ({
          label: member.user.username,
          value: member.id
        }))
      )

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      selectMenu
    )

    await interaction.reply({
      content: 'Selecione os jogadores para a rotação:',
      components: [row]
    })

    // Inicializa this.mainMessage
    this.mainMessage = await interaction.channel?.send(
      'Aguardando seleção de jogadores...'
    )

    const collector = interaction.channel?.createMessageComponentCollector({
      time: 60000
    })

    let selectedPlayers: GuildMember[] = []

    collector.on('collect', async (i) => {
      if (i.isStringSelectMenu() && i.customId === 'select-players') {
        selectedPlayers = await Promise.all(
          i.values.map((id) => interaction.guild?.members.fetch(id))
        )

        const confirmButton = new ButtonBuilder()
          .setCustomId('confirm-rotation')
          .setLabel('Gerar Rotação')
          .setStyle(ButtonStyle.Primary)

        const cancelButton = new ButtonBuilder()
          .setCustomId('cancel-rotation')
          .setLabel('Cancelar')
          .setStyle(ButtonStyle.Danger)

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          confirmButton,
          cancelButton
        )

        await i.update({
          content: `Jogadores selecionados: ${selectedPlayers.map((p) => p.user.username).join(', ')}`,
          components: [buttonRow]
        })

        // Atualiza this.mainMessage
        await this.mainMessage.edit(
          `Jogadores selecionados: ${selectedPlayers.map((p) => p.user.username).join(', ')}`
        )
      } else if (i.isButton()) {
        if (i.customId === 'confirm-rotation') {
          await this.generateAndUpdateRotation(i, selectedPlayers)
        } else if (i.customId === 'cancel-rotation') {
          if (this.mainMessage) {
            await this.mainMessage.edit({
              content: 'Rotação cancelada.',
              components: []
            })
          }
          collector.stop()
        }
      }
    })

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        await interaction.editReply({
          content: 'Tempo esgotado. Por favor, tente novamente.',
          components: []
        })
        if (this.mainMessage) {
          await this.mainMessage.edit(
            'Sessão de rotação encerrada devido a timeout.'
          )
          sleep(5000)
          await this.mainMessage.delete()
        }
      }
    })
  }

  // private async generateAndUpdateRotation(
  //   interaction: ButtonInteraction,
  //   players: GuildMember[],
  //   fixedMessage: Message
  // ): Promise<void> {
  //   const rotation = await makeOWRotationRandom().assignHeroesToPlayers(
  //     players.map((p) => p.displayName)
  //   )

  //   const fullRotationEmbed = this.createFullRotationEmbed(rotation)

  //   const newRotationButton = new ButtonBuilder()
  //     .setCustomId('new-rotation')
  //     .setLabel('Gerar Nova Rotação')
  //     .setStyle(ButtonStyle.Primary)

  //   const cancelButton = new ButtonBuilder()
  //     .setCustomId('cancel-rotation')
  //     .setLabel('Encerrar')
  //     .setStyle(ButtonStyle.Danger)

  //   const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
  //     newRotationButton,
  //     cancelButton
  //   )

  //   await fixedMessage.edit({
  //     content: 'Rotação atual:',
  //     embeds: [fullRotationEmbed],
  //     components: [buttonRow]
  //   })

  //   await interaction.update({
  //     content: 'Rotação gerada com sucesso!',
  //     components: []
  //   })

  //   const newCollector = fixedMessage.createMessageComponentCollector({
  //     componentType: ComponentType.Button,
  //     time: 300000 // 5 minutos
  //   })

  //   newCollector.on('collect', async (i: ButtonInteraction) => {
  //     if (i.customId === 'new-rotation') {
  //       await this.generateAndUpdateRotation(i, players, fixedMessage)
  //     } else if (i.customId === 'cancel-rotation') {
  //       await fixedMessage.delete()
  //       newCollector.stop()
  //     }
  //   })

  //   newCollector.on('end', async (collected, reason) => {
  //     if (reason === 'time') {
  //       await fixedMessage.edit({
  //         content: 'Sessão de rotação encerrada.',
  //         components: []
  //       })
  //     }
  //   })
  // }

  private async generateAndUpdateRotation(
    interaction: ButtonInteraction,
    players: GuildMember[]
  ): Promise<void> {
    const rotation = await makeOWRotationRandom().assignHeroesToPlayers(
      players.map((p) => p.displayName)
    )

    const fullRotationEmbed = this.createFullRotationEmbed(rotation)

    const newRotationButton = new ButtonBuilder()
      .setCustomId('new-rotation')
      .setLabel('Gerar Nova Rotação')
      .setStyle(ButtonStyle.Primary)

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel-rotation')
      .setLabel('Encerrar')
      .setStyle(ButtonStyle.Danger)

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      newRotationButton,
      cancelButton
    )

    if (this.mainMessage) {
      await this.mainMessage.edit({
        content: 'Rotação atual:',
        embeds: [fullRotationEmbed],
        components: [buttonRow]
      })
    } else {
      // Caso a mensagem principal tenha sido deletada por algum motivo
      this.mainMessage = await interaction.channel?.send({
        content: 'Rotação atual:',
        embeds: [fullRotationEmbed],
        components: [buttonRow]
      })
    }

    await interaction.update({
      content: 'Rotação gerada com sucesso!',
      components: []
    })

    // Remover coletores antigos, se existirem
    // biome-ignore lint/complexity/noForEach: <explanation>
    this.mainMessage.collectors.forEach((collector: { stop: () => any }) =>
      collector.stop()
    )

    const newCollector = this.mainMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000 // 5 minutos
    })

    newCollector.on('collect', async (i: ButtonInteraction) => {
      if (i.customId === 'new-rotation') {
        await this.generateAndUpdateRotation(i, players)
      } else if (i.customId === 'cancel-rotation') {
        if (this.mainMessage) {
          await this.mainMessage.edit({
            content: 'Sessão de rotação encerrada.',
            components: []
          })
        }
        newCollector.stop()
      }
    })

    newCollector.on('end', async (collected, reason) => {
      if (reason === 'time' && this.mainMessage) {
        await this.mainMessage.edit({
          content: 'Sessão de rotação encerrada.',
          components: []
        })
      }
    })
  }

  private createFullRotationEmbed(
    rotation: Array<{ player: string; hero: string; role: string }>
  ): EmbedBuilder {
    return new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Rotação de Campeões do Overwatch')
      .setDescription('Aqui está a rotação completa para todos os jogadores:')
      .addFields(
        rotation.map(({ player, hero, role }) => ({
          name: player,
          value: `${hero} (${role})`,
          inline: true
        }))
      )
      .setTimestamp()
      .setFooter({ text: 'Boa sorte e divirta-se!' })
  }
}
