import { eq } from 'drizzle-orm'
import type { Table, InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { IRepositoryBase } from '@/repositories/interfaces/base/interface-repository-base'
import { db } from '@/infra/db/drizzle/drizzle-connect'
import type { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core'

export abstract class DrizzleBaseRepository<T extends Table>
  implements IRepositoryBase<T>
{
  constructor(protected readonly table: SQLiteTableWithColumns<any>) {}

  async create(item: InferInsertModel<T>): Promise<InferSelectModel<T>> {
    try {
      const [query] = (await db
        .insert(this.table)
        .values(item)
        .returning()) as InferSelectModel<T>[]
      return query
    } catch (error) {
      throw new Error(`Failed to create record: ${error}`)
    }
  }

  async read(): Promise<InferSelectModel<T>[]> {
    try {
      return (await db.select().from(this.table).all()) as InferSelectModel<T>[]
    } catch (error) {
      throw new Error(`Failed to read records: ${error}`)
    }
  }

  async update(id: number, item: Partial<InferInsertModel<T>>): Promise<void> {
    try {
      await db.update(this.table).set(item).where(eq(this.table.id, id)).run()
    } catch (error) {
      throw new Error(`Failed to update record: ${error}`)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await db.delete(this.table).where(eq(this.table.id, id)).run()
    } catch (error) {
      throw new Error(`Failed to delete record: ${error}`)
    }
  }

  async findById(id: number): Promise<InferSelectModel<T> | null> {
    try {
      const result = (await db
        .select()
        .from(this.table)
        .where(eq(this.table.id, id))
        .get()) as InferSelectModel<T> | undefined

      return result || null
    } catch (error) {
      throw new Error(`Failed to find record: ${error}`)
    }
  }
}
