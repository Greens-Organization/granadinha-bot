import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const scrapingData = sqliteTable('scraping_data', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  source: text('source').notNull(),
  type: text('type').notNull(),
  data: text('data').notNull(),
  timestamp_created_at: integer('timestamp_created_at', {
    mode: 'timestamp'
  }).notNull(),
  timestamp_updated_at: integer('timestamp_updated_at', {
    mode: 'timestamp'
  }).notNull()
})
