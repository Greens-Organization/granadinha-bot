import { env } from '@/infra/env'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

export function connect() {
  const url = env.TURSO_URL
  const authToken = env.TURSO_AUTH_TOKEN

  const client = createClient({ url, authToken })
  return drizzle(client)
}

export const db = connect()
