import {
  type ScrapingData,
  scrapingData
} from '@/infra/db/drizzle/migrations/scraping-data'
import { DrizzleBaseRepository } from './base/drizzle-repository-base'

export class DrizzleScrapingDataRepository extends DrizzleBaseRepository<ScrapingData> {
  constructor() {
    super(scrapingData)
  }
}
