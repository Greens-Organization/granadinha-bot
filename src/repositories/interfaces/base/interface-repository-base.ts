import type { InferInsertModel, InferSelectModel, Table } from 'drizzle-orm'

// Drizzle Infer Types - No recommend!
export interface IRepositoryBase<T extends Table> {
  create(item: InferInsertModel<T>): Promise<InferSelectModel<T>>
  read(): Promise<InferSelectModel<T>[]>
  update(id: number, item: Partial<InferInsertModel<T>>): Promise<void>
  delete(id: number): Promise<void>
  findById(id: number): Promise<InferSelectModel<T> | null>
}
