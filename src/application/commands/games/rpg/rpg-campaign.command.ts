// import { CommandBase } from '@/core/structures/bot/commands/command-base'
// import { rpgCampaigns, rpgCampaignMembers } from '@/infra/database/schema'
// import {
//   type CommandInteraction,
//   ChannelType,
//   PermissionFlagsBits
// } from 'discord.js'

// export default class RegisterRPGCampaign extends CommandBase {
//   constructor() {
//     super()
//     this.setName('registrar-rpg')
//       .setDescription('Registra uma nova campanha de RPG')
//       .addStringOption((option) =>
//         option
//           .setName('nome')
//           .setDescription('Nome da campanha')
//           .setRequired(true)
//           .setMaxLength(100)
//       )
//       .addStringOption((option) =>
//         option
//           .setName('plataforma')
//           .setDescription('Plataforma onde o RPG será jogado')
//           .setRequired(true)
//           .addChoices(
//             { name: 'Roll20', value: 'ROLL20' },
//             { name: 'Foundry VTT', value: 'FOUNDRY' },
//             { name: 'Discord', value: 'DISCORD' },
//             { name: 'Presencial', value: 'PRESENCIAL' },
//             { name: 'Outro', value: 'OUTRO' }
//           )
//       )
//       .addChannelOption((option) =>
//         option
//           .setName('canal')
//           .setDescription('Canal do Discord para a campanha')
//           .setRequired(true)
//           .addChannelTypes(ChannelType.GuildText)
//       )
//       .addStringOption((option) =>
//         option
//           .setName('horario')
//           .setDescription('Horário padrão das sessões (ex: Segunda 20:00)')
//           .setRequired(true)
//       )
//       .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
//   }

//   async execute(interaction: CommandInteraction): Promise<void> {
//     if (!interaction.inGuild()) {
//       await interaction.reply({
//         content: 'Este comando só pode ser usado em servidores.',
//         ephemeral: true
//       })
//       return
//     }

//     await interaction.deferReply({ ephemeral: true })

//     try {
//       const nome = interaction.options.get('nome', true).value as string
//       const plataforma = interaction.options.get('plataforma', true)
//         .value as string
//       const canal = interaction.options.get('canal', true)
//       const horario = interaction.options.get('horario', true).value as string
//       const userId = interaction.user.id
//       const username = interaction.user.username

//       // Verifica se o canal é válido
//       if (!canal || !canal.channel) {
//         await interaction.editReply('Canal inválido.')
//         return
//       }

//       // Verifica se já existe uma campanha neste canal
//       const existingCampaign = await db.query.rpgCampaigns.findFirst({
//         where: (campaigns, { eq }) =>
//           eq(campaigns.discordChannelId, canal.channel?.id)
//       })

//       if (existingCampaign) {
//         await interaction.editReply(
//           'Já existe uma campanha registrada neste canal.'
//         )
//         return
//       }

//       // Cria a campanha e registra o mestre
//       const currentTimestamp = new Date()

//       const [campaign] = await db
//         .insert(rpgCampaigns)
//         .values({
//           name: nome,
//           gamePlatform: plataforma,
//           discordChannelId: canal.channel.id,
//           defaultSchedule: horario,
//           timestampCreatedAt: currentTimestamp,
//           timestampUpdatedAt: currentTimestamp
//         })
//         .returning({ insertedId: rpgCampaigns.id })

//       if (!campaign) {
//         throw new Error('Falha ao criar a campanha')
//       }

//       // Registra o criador como mestre
//       await db.insert(rpgCampaignMembers).values({
//         campaignId: campaign.insertedId,
//         userId: userId,
//         username: username,
//         role: 'MASTER',
//         timestampCreatedAt: currentTimestamp,
//         timestampUpdatedAt: currentTimestamp
//       })

//       // Guarda o ID da campanha no cache para uso em comandos subsequentes
//       const cacheKey = `last_campaign_${interaction.guildId}_${userId}`
//       await this.setCacheData(cacheKey, String(campaign.insertedId), 3600) // expira em 1 hora

//       await interaction.editReply({
//         content: `✅ Campanha "${nome}" registrada com sucesso!\n\n📌 Canal: <#${canal.channel.id}>\n🎲 Plataforma: ${plataforma}\n⏰ Horário: ${horario}\n\nVocê foi registrado como Mestre desta campanha.`
//       })
//     } catch (error) {
//       console.error('Erro ao registrar campanha:', error)
//       await interaction.editReply({
//         content:
//           'Ocorreu um erro ao registrar a campanha. Por favor, tente novamente.'
//       })
//     }
//   }
// }
