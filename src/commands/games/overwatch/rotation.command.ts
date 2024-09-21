import { SlashCommandBuilder } from '@discordjs/builders'
import { type CommandInteraction, EmbedBuilder } from 'discord.js'

interface Hero {
  name: string
  type: 'SUPPORT' | 'DPS' | 'TANK'
}

interface PlayerAssignment {
  player: string
  hero: string
  type: Hero['type']
}

const heroes: Hero[] = [
  { name: 'Ana', type: 'SUPPORT' },
  { name: 'Ashe', type: 'DPS' },
  { name: 'Baptiste', type: 'SUPPORT' },
  { name: 'Bastion', type: 'DPS' },
  { name: 'Brigitte', type: 'SUPPORT' },
  { name: 'Cassidy', type: 'DPS' },
  { name: 'D.Va', type: 'TANK' },
  { name: 'Doomfist', type: 'TANK' },
  { name: 'Echo', type: 'DPS' },
  { name: 'Genji', type: 'DPS' },
  { name: 'Hanzo', type: 'DPS' },
  { name: 'Junker Queen', type: 'TANK' },
  { name: 'Junkrat', type: 'DPS' },
  { name: 'Kiriko', type: 'SUPPORT' },
  { name: 'Lifeweaver', type: 'SUPPORT' },
  { name: 'Lucio', type: 'SUPPORT' },
  { name: 'Mei', type: 'DPS' },
  { name: 'Mercy', type: 'SUPPORT' },
  { name: 'Moira', type: 'SUPPORT' },
  { name: 'Orisa', type: 'TANK' },
  { name: 'Pharah', type: 'DPS' },
  { name: 'Ramattra', type: 'TANK' },
  { name: 'Reaper', type: 'DPS' },
  { name: 'Reinhardt', type: 'TANK' },
  { name: 'Roadhog', type: 'TANK' },
  { name: 'Sigma', type: 'TANK' },
  { name: 'Sojourn', type: 'DPS' },
  { name: 'Soldier: 76', type: 'DPS' },
  { name: 'Sombra', type: 'DPS' },
  { name: 'Symmetra', type: 'DPS' },
  { name: 'Torbjorn', type: 'DPS' },
  { name: 'Tracer', type: 'DPS' },
  { name: 'Widowmaker', type: 'DPS' },
  { name: 'Winston', type: 'TANK' },
  { name: 'Wrecking Ball', type: 'TANK' },
  { name: 'Zarya', type: 'TANK' },
  { name: 'Zenyatta', type: 'SUPPORT' },
  { name: 'Mauga', type: 'TANK' },
  { name: 'Venture', type: 'DPS' },
  { name: 'Juno', type: 'SUPPORT' }
]

/**
 * TODO: Adicionar uma forma de quando alguém pegar o hero de alguém
 */
function assignHeroesToPlayers(playerNames: string[]): PlayerAssignment[] {
  if (playerNames.length < 1 || playerNames.length > 5) {
    throw new Error('A quantidade de jogadores deve ser entre 1 e 5.')
  }

  const selectedHeroes: PlayerAssignment[] = []
  const assignedPlayers = new Set<string>()
  let tankCount = 0
  let supportCount = 0
  let dpsCount = 0
  const availableHeroes = [...heroes]

  while (selectedHeroes.length < playerNames.length) {
    const randomHeroIndex = Math.floor(Math.random() * availableHeroes.length)
    const randomHero = availableHeroes[randomHeroIndex]
    const randomPlayerIndex = Math.floor(Math.random() * playerNames.length)
    const randomPlayer = playerNames[randomPlayerIndex]

    if (assignedPlayers.has(randomPlayer)) continue

    if (
      (randomHero.type === 'TANK' && tankCount < 1) ||
      (randomHero.type === 'SUPPORT' && supportCount < 2) ||
      (randomHero.type === 'DPS' && dpsCount < 2)
    ) {
      selectedHeroes.push({
        player: randomPlayer,
        hero: randomHero.name,
        type: randomHero.type
      })
      assignedPlayers.add(randomPlayer)
      availableHeroes.splice(randomHeroIndex, 1)

      if (randomHero.type === 'TANK') tankCount++
      else if (randomHero.type === 'SUPPORT') supportCount++
      else if (randomHero.type === 'DPS') dpsCount++
    }
  }

  return selectedHeroes
}

export const data = new SlashCommandBuilder()
  .setName('ow-rotation')
  .setDescription('Gera uma rotação de campeões do Overwatch para os jogadores')

export async function execute(interaction: CommandInteraction): Promise<void> {
  try {
    const rotation = assignHeroesToPlayers([
      'Alpha',
      'Matheus',
      'Luiz',
      'Bseven'
    ])

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Rotação de Campeões do Overwatch')
      .setDescription('Aqui está a rotação de campeões para os jogadores:')
      .addFields(
        rotation.map(({ player, hero, type }) => ({
          name: player,
          value: `${hero} (${type})`,
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
