import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { logger } from '@/utils'
import dotenv from 'dotenv'
import { z } from 'zod'

const booleanParse = z
  .string()
  .optional()
  .transform((str) => str === 'true')

const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production', 'local'])
      .default('development'),
    HOST: z.string().default('0.0.0.0'),
    PORT: z.coerce.number().default(3000),

    BOT_TOKEN: z.string(),
    APPLICATION_ID: z.string(),

    TURSO_URL: z.string().optional(),
    TURSO_AUTH_TOKEN: z.string().optional(),
    TEST_GUILD_IDS: z
      .string()
      .optional()
      .transform((data) => data?.split(',').map((i) => i.trim())),

    DEBUG: booleanParse,
    SQLITE_LOCAL: z.string().default('bot.db')
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production' || data.NODE_ENV === 'development') {
      if (!data.TURSO_AUTH_TOKEN) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'TURSO_AUTH_TOKEN is required when NODE_ENV is development or production',
          path: ['TURSO_AUTH_TOKEN']
        })
      }
      if (!data.TURSO_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'TURSO_URL is required when NODE_ENV is development or production',
          path: ['TURSO_URL']
        })
      }
    }
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

export const dbCredentialsLocal = { url: `file:./${env.SQLITE_LOCAL}` }
export const dbCredentialsRemote = {
  url: env.TURSO_URL!,
  authToken: env.TURSO_AUTH_TOKEN!
}
