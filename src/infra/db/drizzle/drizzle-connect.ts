import { env } from '@/infra/env'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

export function connect() {
  const url = env.TURSO_URL
  const authToken = env.TURSO_AUTH_TOKEN

  const client = createClient({ url, authToken })
  return drizzle(client)
}

export const db = connect()
