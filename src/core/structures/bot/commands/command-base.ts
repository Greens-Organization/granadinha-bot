import type { CacheInterface } from '@/infra/libs/cache'
import { type CommandInteraction, SlashCommandBuilder } from 'discord.js'

/* 
  TODO: Infelizmente essa classe SlashCommandBuilder não temos controle sobre ela, pois ela vem direto do modulo do discord.js. E atualmente, ela é bem robusta para o que a API do discord pede, em relação a criação de um slash command. Que mudou drasticamente de sua versão '9' para '10', que trabalhamos hoje em dia.
*/
export abstract class CommandBase extends SlashCommandBuilder {
  protected cache?: CacheInterface
  constructor(cache?: CacheInterface) {
    super()
    this.cache = cache
  }

  abstract execute(interaction: CommandInteraction): Promise<void>

  protected async getCacheData(key: string): Promise<string | null> {
    return this.cache ? this.cache.get(key) : null
  }

  protected async setCacheData(
    key: string,
    value: string,
    expirationInSeconds?: number
  ): Promise<void> {
    if (this.cache) {
      await this.cache.set(key, value, expirationInSeconds)
    }
  }
}
