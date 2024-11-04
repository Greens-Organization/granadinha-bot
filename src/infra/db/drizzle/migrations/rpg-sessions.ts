import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { rpgCampaigns } from './rpg-campaigns'

// Tabela de Sessões
export const rpgSessions = sqliteTable('rpg_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  campaignId: integer('campaign_id')
    .notNull()
    .references(() => rpgCampaigns.id),
  scheduledDate: integer('scheduled_date', {
    mode: 'timestamp'
  }).notNull(),
  pollMessageId: text('poll_message_id'),
  status: text('status', {
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED']
  })
    .notNull()
    .default('SCHEDULED'),
  timestampCreatedAt: integer('timestamp_created_at', {
    mode: 'timestamp'
  }).notNull(),
  timestampUpdatedAt: integer('timestamp_updated_at', {
    mode: 'timestamp'
  }).notNull()
})

export type RpgSession = typeof rpgSessions
