import type { Client } from 'discord.js'
import type { EventHandler } from './events/event-handler'
import { env } from '@/infra/env'

export class DiscordJSAdapter {
  constructor(
    private readonly client: Client,
    private readonly eventHandler: EventHandler
  ) {}

  async init(): Promise<void> {
    await this.login()
    await this.eventHandler.init()
  }

  private async login(): Promise<void> {
    await this.client.login(env.BOT_TOKEN)
  }
}
