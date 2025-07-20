import { Database } from 'bun:sqlite'
import { createClient } from '@libsql/client'
import { drizzle as bunSqlite } from 'drizzle-orm/bun-sqlite'
import { drizzle as tursoSqlite } from 'drizzle-orm/libsql'
import { dbCredentialsRemote, env, isLocal } from '@/infra/env'

export function connect() {
  if (isLocal) {
    const sqlite = new Database(env.SQLITE_LOCAL, {
      create: true,
      strict: true
    })
    return bunSqlite(sqlite)
  }

  const client = createClient(dbCredentialsRemote)
  return tursoSqlite(client)
}

export const db = connect()
