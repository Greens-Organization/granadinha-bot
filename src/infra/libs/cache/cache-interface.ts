export interface CacheInterface {
  get(key: string): Promise<string | null>
  set(key: string, value: string, expirationInSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
}
