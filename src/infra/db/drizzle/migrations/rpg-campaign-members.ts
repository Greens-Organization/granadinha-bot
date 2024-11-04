import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { rpgCampaigns } from './rpg-campaigns'

// Tabela de Membros da Campanha (com informações do personagem)
export const rpgCampaignMembers = sqliteTable('rpg_campaign_members', {
  campaignId: integer('campaign_id')
    .notNull()
    .references(() => rpgCampaigns.id),
  userId: text('user_id').notNull(), // Discord User ID
  username: text('username').notNull(),
  characterName: text('character_name'), // Opcional, pois o mestre pode não ter personagem
  role: text('role', { enum: ['MASTER', 'PLAYER'] }).notNull(),
  timestampCreatedAt: integer('timestamp_created_at', {
    mode: 'timestamp'
  }).notNull(),
  timestampUpdatedAt: integer('timestamp_updated_at', {
    mode: 'timestamp'
  }).notNull()
})

export const rpgCampaignMembersRelations = relations(
  rpgCampaignMembers,
  ({ one }) => ({
    campaign: one(rpgCampaigns, {
      fields: [rpgCampaignMembers.userId],
      references: [rpgCampaigns.id]
    })
  })
)

export type RpgCampaignMember = typeof rpgCampaignMembers
