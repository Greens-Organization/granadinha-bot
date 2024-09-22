export interface ScrapingDataRepository {
  save(): Promise<void>
}
