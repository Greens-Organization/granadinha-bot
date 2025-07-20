import type { Client } from 'discord.js'
import { env } from '@/infra/env'
import type { EventHandler } from './events/event-handler'

export class DiscordJSAdapter {
  constructor(
    private readonly client: Client,
    private readonly eventHandler: EventHandler
  ) {}

  async init(): Promise<void> {
    await Promise.all([this.eventHandler.init(), this.login()])
  }

  private async login(): Promise<void> {
    await this.client.login(env.BOT_TOKEN)
  }
}
