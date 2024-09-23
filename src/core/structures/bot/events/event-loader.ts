import { resolveAliasPath } from '@/core/helpers/resolve-alias-path'
import type { EventBaseProtocol } from './protocols'
import { readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { logger } from '@/utils'
import { EventBase } from './event-base'
import type { Client } from 'discord.js'

export class EventLoader {
  private events: EventBaseProtocol[] = []

  constructor(
    private readonly eventsDir: string,
    private readonly client: Client
  ) {}

  async loadEvents(): Promise<EventBaseProtocol[]> {
    const resolvedDir = resolveAliasPath(this.eventsDir)
    const files = await readdir(resolvedDir, {
      withFileTypes: true,
      recursive: true
    })

    for (const file of files) {
      if (
        file.isFile() &&
        (file.name.endsWith('.ts') || file.name.endsWith('.js'))
      ) {
        const relativePath = relative(
          resolvedDir,
          join(file.parentPath, file.name)
        )
        const fullPath = join(resolvedDir, relativePath)
        await this.loadEventFile(fullPath)
      }
    }

    return this.events
  }

  private async loadEventFile(filePath: string): Promise<void> {
    try {
      const eventModule = await import(filePath)
      const EventClass = eventModule.default

      if (EventClass && typeof EventClass === 'function') {
        const event = new EventClass(this.client)
        if (event instanceof EventBase && 'execute' in event) {
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
}
