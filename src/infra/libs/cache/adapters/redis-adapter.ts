import Redis, { type RedisOptions } from 'ioredis'
import type { CacheInterface } from '../cache-interface'

export class RedisAdapter implements CacheInterface {
  private ioRedis: Redis

  constructor(port: number, host: string, options?: RedisOptions) {
    this.ioRedis = new Redis({ port, host, ...options })
  }

  async get(key: string): Promise<string | null> {
    return this.ioRedis.get(key)
  }

  async set(
    key: string,
    value: string,
    expirationInSeconds?: number
  ): Promise<void> {
    if (expirationInSeconds) {
      await this.ioRedis.set(key, value, 'EX', expirationInSeconds)
    } else {
      await this.ioRedis.set(key, value)
    }
  }

  async delete(key: string): Promise<void> {
    await this.ioRedis.del(key)
  }
}
