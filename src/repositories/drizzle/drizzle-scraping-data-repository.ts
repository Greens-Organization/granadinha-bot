import type { ScrapingDataRepository } from '../interfaces'

export class DrizzleScrapingDataRepository implements ScrapingDataRepository {
  async save(): Promise<void> {}
}
