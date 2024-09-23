import { join } from 'node:path'
import { resolveAliasPath } from '@/core/helpers/resolve-alias-path'
import { logger } from '@/utils'
import { Glob } from 'bun'
import type { Client } from 'discord.js'
import type { EventBaseProtocol } from './protocols'

export class EventLoader {
  private events: EventBaseProtocol[] = []

  constructor(
    private readonly eventsDir: string,
    private readonly client: Client
  ) {}

  async loadEvents(): Promise<EventBaseProtocol[]> {
    const resolvedDir = resolveAliasPath(this.eventsDir)

    const glob = new Glob('**/*.{ts,js}')
    const files = await Array.fromAsync(glob.scan({ cwd: resolvedDir }))

    for (const file of files) {
      const fullPath = join(resolvedDir, file)
      await this.loadFiles(fullPath)
    }

    return this.events
  }

  private async loadFiles(filePath: string): Promise<void> {
    try {
      const eventModule = await import(filePath)
      const EventClass = eventModule.default

      if (EventClass && typeof EventClass === 'function') {
        const event = new EventClass(this.client)
        if (this.isValidEvent(event)) {
          this.events.push(event)
        } else {
          logger.warn(
            `O evento em ${filePath} não é uma instância válida de EventBase ou não tem um método 'execute'.`
          )
        }
      } else {
        logger.warn(
          `O arquivo ${filePath} não exporta uma classe de evento válida.`
        )
      }
    } catch (e) {
      logger.error(`Error ao carregar o evento em ${filePath}: `, e)
    }
  }

  private isValidEvent(event: any): event is EventBaseProtocol {
    return (
      event &&
      typeof event === 'object' &&
      'name' in event &&
      typeof event.name === 'string' &&
      'execute' in event &&
      typeof event.execute === 'function' &&
      'once' in event &&
      typeof event.once === 'boolean'
    )
  }
}
