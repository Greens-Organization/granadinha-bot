import type { Client } from 'discord.js'
import { EventLoader } from './event-loader'
import type { EventBaseProtocol } from './protocols'
import { constants } from '@/infra/common'

export class EventHandler {
  private events: EventBaseProtocol[] = []
  private eventLoader: EventLoader

  constructor(
    private readonly client: Client,
    private readonly eventsDir = `${constants.EVENTS_DIR}/bot`
  ) {
    this.eventLoader = new EventLoader(this.eventsDir, this.client)
  }

  async init(): Promise<void> {
    this.events = await this.eventLoader.loadEvents()
    for (const event of this.events) {
      if (event.once) {
        this.client.once(event.name, (...args) => event.execute(...args))
      } else {
        this.client.on(event.name, (...args) => event.execute(...args))
      }
    }
  }
}
