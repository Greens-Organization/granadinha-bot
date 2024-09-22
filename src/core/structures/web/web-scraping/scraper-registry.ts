import type { ScraperConstructor } from './web-scraping-base'

// NO USAGE YET
export class ScraperRegistry {
  private static instance: ScraperRegistry
  private scrapers: Map<string, ScraperConstructor> = new Map()

  private constructor() {}

  static getInstance(): ScraperRegistry {
    if (!ScraperRegistry.instance) {
      ScraperRegistry.instance = new ScraperRegistry()
    }
    return ScraperRegistry.instance
  }

  register(key: string, scraperClass: ScraperConstructor) {
    this.scrapers.set(key, scraperClass)
  }

  getAll(): ScraperConstructor[] {
    return Array.from(this.scrapers.values())
  }
}
