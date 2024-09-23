import type { ClientEvents } from 'discord.js'

export interface EventBaseProtocol<K extends keyof ClientEvents = any> {
  name: K
  once: boolean
  execute(...args: ClientEvents[K]): Promise<void>
}
