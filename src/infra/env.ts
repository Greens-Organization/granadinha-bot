import dotenv from 'dotenv'
import { z } from 'zod'
import { join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { logger } from '@/utils'

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production', 'local'])
    .default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().default(3000),

  BOT_TOKEN: z.string(),
  APPLICATION_ID: z.string(),

  TURSO_URL: z.string(),
  TURSO_AUTH_TOKEN: z.string(),
  TEST_GUILD_IDS: z.string().optional(),

  DEBUG: z
    .string()
    .optional()
    .transform((str) => str === 'true')
})

function loadEnv(): z.infer<typeof EnvSchema> {
  let envVars = { ...process.env }

  const envPath = join(process.cwd(), '.env')
  if (existsSync(envPath)) {
    const envConfig = dotenv.parse(readFileSync(envPath))
    envVars = { ...envVars, ...envConfig }
  }

  const result = EnvSchema.safeParse(envVars)

  if (!result.success) {
    logger.error(result.error.format())
    throw new Error('❌ Invalid environment variables.')
  }

  return result.data
}

export const env = loadEnv()

export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
export const isLocal = env.NODE_ENV === 'local'

export const dbCredentials = {
  url: env.TURSO_URL,
  authToken: env.TURSO_AUTH_TOKEN
}
