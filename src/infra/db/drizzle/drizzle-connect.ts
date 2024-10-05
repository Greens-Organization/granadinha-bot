import { dbCredentialsRemote, env, isLocal } from '@/infra/env'
import { createClient } from '@libsql/client'
import { drizzle as tursoSqlite } from 'drizzle-orm/libsql'
import { Database } from 'bun:sqlite'
import { drizzle as bunSqlite } from 'drizzle-orm/bun-sqlite'

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
