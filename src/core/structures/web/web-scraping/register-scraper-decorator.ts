import { ScraperRegistry } from './scraper-registry'
import type { ScraperConstructor } from './web-scraping-base'

// NO USAGE YET
export function RegisterScraper(key: string) {
  return (scraperClass: ScraperConstructor) => {
    ScraperRegistry.getInstance().register(key, scraperClass)
  }
}
