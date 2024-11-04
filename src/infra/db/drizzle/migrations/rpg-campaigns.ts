import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { rpgCampaignMembers } from './rpg-campaign-members'

// Tabela de Campanhas
export const rpgCampaigns = sqliteTable('rpg_campaigns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  gamePlatform: text('game_platform').notNull(), // Roll20, Foundry, etc.
  discordChannelId: integer('discord_channel_id').notNull(),
  discordVoiceId: integer('discord_voice_id').notNull(),
  defaultSchedule: text('default_schedule'), // Horário padrão das sessões
  timestampCreatedAt: integer('timestamp_created_at', {
    mode: 'timestamp'
  }).notNull(),
  timestampUpdatedAt: integer('timestamp_updated_at', {
    mode: 'timestamp'
  }).notNull()
})

export const rpgCampaignsRelations = relations(rpgCampaigns, ({ many }) => ({
  rpgCampaignMembers: many(rpgCampaignMembers)
}))

export type RpgCampaign = typeof rpgCampaigns
