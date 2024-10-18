// import { CommandBase } from '@/core/structures/bot/commands/command-base'
// import {
//   type CommandInteraction,
//   PermissionFlagsBits,
//   type Role,
//   type Guild,
//   type ColorResolvable,
//   type GuildMember
// } from 'discord.js'

// const colors: ColorResolvable[] = [
//   '#FF0000', // Vermelho
//   '#FF7F00', // Laranja
//   '#FFFF00', // Amarelo
//   '#00FF00', // Verde
//   '#0000FF', // Azul
//   '#8B00FF' // Violeta
// ]

// const RAINBOW_ROLE_NAME = 'rainbow-bot'

// export default class RainbowRole extends CommandBase {
//   private rainbowInterval: NodeJS.Timer | null = null

//   constructor() {
//     super()
//     this.setName('rainbow')
//       .setDescription('Ativa ou desativa o efeito rainbow no bot')
//       .addBooleanOption((option) =>
//         option
//           .setName('ativar')
//           .setDescription('Ativar ou desativar o efeito rainbow')
//           .setRequired(true)
//       )
//       .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
//   }

//   async execute(interaction: CommandInteraction): Promise<void> {
//     if (!interaction.inGuild()) {
//       await interaction.reply({
//         content: 'Este comando só pode ser usado em servidores.',
//         ephemeral: true
//       })
//       return
//     }

//     if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
//       await interaction.reply({
//         content: 'Você não tem permissão para usar este comando.',
//         ephemeral: true
//       })
//       return
//     }

//     const ativar = interaction.options.get('ativar', true)?.value as boolean
//     await interaction.deferReply({ ephemeral: true })

//     try {
//       const result = await this.toggleRainbowEffect(interaction, ativar)
//       await interaction.editReply(result)
//     } catch (error) {
//       console.error('Erro ao processar o comando:', error)
//       if (error instanceof Error) {
//         await interaction.editReply(`Erro: ${error.message}`)
//       } else {
//         await interaction.editReply(
//           'Ocorreu um erro desconhecido ao processar o comando.'
//         )
//       }
//     }
//   }

//   private async toggleRainbowEffect(
//     interaction: CommandInteraction,
//     ativar: boolean
//   ): Promise<string> {
//     const guild = interaction.guild
//     if (!guild) {
//       throw new Error('Guild não encontrada.')
//     }

//     const botMember = guild.members.me
//     if (!botMember) {
//       throw new Error('Não foi possível encontrar o bot no servidor.')
//     }

//     if (ativar) {
//       if (this.rainbowInterval) {
//         return 'O efeito rainbow já está ativo!'
//       }

//       const rainbowRole = await this.getOrCreateRainbowRole(guild)
//       if (!rainbowRole) {
//         throw new Error(
//           'Não foi possível obter ou criar a role rainbow-bot. Verifique as permissões do bot.'
//         )
//       }

//       if (!botMember.roles.cache.has(rainbowRole.id)) {
//         await botMember.roles.add(rainbowRole).catch((error) => {
//           console.error('Erro ao adicionar role ao bot:', error)
//           throw new Error(
//             'Não foi possível adicionar a role rainbow-bot ao bot. Verifique as permissões.'
//           )
//         })
//       }

//       this.startRainbowEffect(rainbowRole)
//       return 'Efeito rainbow ativado na role rainbow-bot!'
//     }
//     if (!this.rainbowInterval) {
//       return 'O efeito rainbow não está ativo.'
//     }

//     const rainbowRole = guild.roles.cache.find(
//       (role) => role.name === RAINBOW_ROLE_NAME
//     )
//     if (rainbowRole) {
//       this.stopRainbowEffect(rainbowRole)
//       await this.removeRainbowRole(guild, rainbowRole, botMember)
//       return 'Efeito rainbow desativado e role rainbow-bot removida do bot.'
//     }
//     return 'Efeito rainbow desativado, mas a role rainbow-bot não foi encontrada.'
//   }

//   private async getOrCreateRainbowRole(guild: Guild): Promise<Role | null> {
//     let rainbowRole = guild.roles.cache.find(
//       (role) => role.name === RAINBOW_ROLE_NAME
//     )

//     if (!rainbowRole) {
//       if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
//         console.warn(
//           'O bot não tem permissão para criar roles. Tentando usar uma role existente.'
//         )
//         return this.findSuitableExistingRole(guild)
//       }

//       try {
//         rainbowRole = await guild.roles.create({
//           name: RAINBOW_ROLE_NAME,
//           color: colors[0],
//           reason: 'Role criada para o efeito rainbow',
//           permissions: [],
//           position: guild.roles.highest.position - 1
//         })
//       } catch (error) {
//         console.error('Erro ao criar a role rainbow-bot:', error)
//         return this.findSuitableExistingRole(guild)
//       }
//     }

//     return rainbowRole
//   }

//   private findSuitableExistingRole(guild: Guild): Role | null {
//     // Tenta encontrar uma role existente que o bot possa modificar
//     return (
//       guild.roles.cache.find(
//         (role) =>
//           role.editable &&
//           !role.managed &&
//           role.name !== '@everyone' &&
//           // @ts-ignore
//           guild.members.me?.roles.highest.comparePositionTo(role) > 0
//       ) || null
//     )
//   }

//   private startRainbowEffect(role: Role): void {
//     let colorIndex = 0
//     this.rainbowInterval = setInterval(() => {
//       role.setColor(colors[colorIndex] as ColorResolvable).catch(console.error)
//       colorIndex = (colorIndex + 1) % colors.length
//     }, 200) // Muda a cor a cada 10 segundos
//   }

//   private stopRainbowEffect(role: Role): void {
//     if (this.rainbowInterval) {
//       clearInterval(this.rainbowInterval)
//       this.rainbowInterval = null
//     }
//   }

//   private async removeRainbowRole(
//     guild: Guild,
//     role: Role,
//     botMember: GuildMember
//   ): Promise<void> {
//     if (role.name === RAINBOW_ROLE_NAME) {
//       if (botMember.roles.cache.has(role.id)) {
//         try {
//           await botMember.roles.remove(role)
//           console.log('Role rainbow-bot removida do bot com sucesso.')
//         } catch (error) {
//           console.error('Erro ao remover a role rainbow-bot do bot:', error)
//         }
//       }

//       if (guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
//         try {
//           await role.delete('Efeito rainbow desativado')
//           console.log('Role rainbow-bot deletada com sucesso.')
//         } catch (error) {
//           console.error('Erro ao deletar a role rainbow-bot:', error)
//           // Se não puder deletar, apenas remove a cor
//           try {
//             await role.setColor('Grey')
//             console.log('Cor da role rainbow-bot removida com sucesso.')
//           } catch (colorError) {
//             console.error(
//               'Erro ao resetar a cor da role rainbow-bot:',
//               colorError
//             )
//           }
//         }
//       }
//     } else {
//       // Se não for a role rainbow-bot, apenas remove a cor
//       try {
//         await role.setColor('Grey')
//         console.log('Cor da role removida com sucesso.')
//       } catch (error) {
//         console.error('Erro ao resetar a cor da role:', error)
//       }
//     }
//   }
// }
