import {
  dbCredentialsRemote,
  dbCredentialsLocal,
  isDevelopment,
  isLocal,
  isProduction
} from '@/infra/env'
import type { Config } from 'drizzle-kit'

let config = {} as Config
if (isProduction || isDevelopment) {
  config = {
    schema: './src/infra/db/drizzle/migrations/**/*',
    out: './migrations',
    dialect: 'turso',
    dbCredentials: dbCredentialsRemote
  }
}

if (isLocal) {
  config = {
    schema: './src/infra/db/drizzle/migrations/**/*',
    out: './migrations',
    dialect: 'sqlite',
    dbCredentials: dbCredentialsLocal
  } as Config
}

export default {
  ...config
}
