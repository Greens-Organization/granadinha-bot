export interface ITransactionBase {
  runInTransaction<T>(work: () => T | Promise<T>): Promise<T>
}
