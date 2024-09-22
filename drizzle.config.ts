import { dbCredentials } from '@/infra/env'
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/infra/db/drizzle/**/*',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials
} satisfies Config
