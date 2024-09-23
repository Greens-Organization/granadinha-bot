import type { Client, ClientEvents } from 'discord.js'

export abstract class EventBase<K extends keyof ClientEvents> {
  constructor(
    public readonly name: K,
    public readonly once: boolean = false,
    protected client?: Client
  ) {}

  abstract execute(...args: ClientEvents[K]): Promise<void>
}
