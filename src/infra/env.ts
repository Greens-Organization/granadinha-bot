import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import dotenv from 'dotenv'
import { z } from 'zod'
import { logger } from '@/utils'

const booleanSchema = z.stringbool({
  truthy: ['yes', 'true'],
  falsy: ['no', 'false']
})

const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production', 'local'])
      .default('development'),
    HOST: z.string().default('0.0.0.0'),
    PORT: z.coerce.number().default(3000),

    BOT_TOKEN: z.string().min(1),
    APPLICATION_ID: z.string(),

    TURSO_URL: z.string().optional(),
    TURSO_AUTH_TOKEN: z.string().optional(),
    TEST_GUILD_IDS: z
      .string()
      .optional()
      .transform((data) => data?.split(',').map((i) => i.trim())),

    DEBUG: booleanSchema.default(false),
    SQLITE_LOCAL: z.string().default('bot.db'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_HOST: z.string().default('localhost')
  })
  .check((ctx) => {
    const data = ctx.value
    if (data.NODE_ENV === 'production' || data.NODE_ENV === 'development') {
      if (!data.TURSO_AUTH_TOKEN) {
        ctx.issues.push({
          code: 'custom',
          input: data.TURSO_AUTH_TOKEN,
          message:
            'TURSO_AUTH_TOKEN is required when NODE_ENV is development or production',
          path: ['TURSO_AUTH_TOKEN']
        })
      }
      if (!data.TURSO_URL) {
        ctx.issues.push({
          code: 'custom',
          input: data.TURSO_URL,
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
    logger.error(z.treeifyError(result.error))
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
  url: env.TURSO_URL as string,
  authToken: env.TURSO_AUTH_TOKEN as string
}
