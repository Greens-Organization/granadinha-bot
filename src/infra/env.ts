import dotenv from 'dotenv'
import { z } from 'zod'
import { join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { logger } from '@/utils'

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production', 'local'])
    .default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().default(3000),

  BOT_TOKEN: z.string(),
  APPLICATION_ID: z.string(),

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
