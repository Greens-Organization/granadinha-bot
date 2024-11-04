import { db } from '@/infra/db/drizzle/drizzle-connect'
import type { ITransactionBase } from '../interfaces/base/interface-transaction-base'

/**
 * Read more about SQLite Transactions in {@link https://www.sqlite.org/lang_transaction.html}
 */
export class DrizzleTransaction implements ITransactionBase {
  async runInTransaction<T>(work: () => T | Promise<T>): Promise<T> {
    // @ts-expect-error - Ignoring type error as we know that both bank types support transaction. For something more robust, it is recommended to make a drizzle helper with separate strategies for each type of connection. Remote | Location
    return await db.transaction(async (_trx) => {
      return await Promise.resolve(work())
    })
  }
}
