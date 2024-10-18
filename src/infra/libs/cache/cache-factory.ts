import { env } from '@/infra/env'
import { RedisAdapter } from './adapters/redis-adapter'
import type { CacheInterface } from './cache-interface'

export type CacheFactoryType = 'redis' | 'none'

export class CacheFactory {
  static createCache(type: CacheFactoryType): CacheInterface | undefined {
    switch (type) {
      case 'redis':
        return new RedisAdapter(env.REDIS_PORT, env.HOST)
      case 'none':
        return undefined
      default:
        throw new Error(`Tipo de cache não suportado: ${type}`)
    }
  }
}
