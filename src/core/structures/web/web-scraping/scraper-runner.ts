import { ScraperRegistry } from './scraper-registry'

// NO USAGE YET
export class ScraperRunner {
  async runAllScrapersAndSave(): Promise<void> {
    const registry = ScraperRegistry.getInstance()
    const scraperClasses = registry.getAll()

    for (const ScraperClass of scraperClasses) {
      const scraper = new ScraperClass()
      await scraper.scrapeAndSave()
    }
  }
}
