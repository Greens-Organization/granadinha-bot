import type { TimestampDTO } from '@/core/dtos/timestamp-dto'
import { db } from '@/infra/db/drizzle/drizzle-connect'
import { scrapingData } from '@/infra/db/drizzle/migrations/scraping-data'
import { http } from '@/infra/libs/fetch'
import { logger } from '@/utils'
import * as cheerio from 'cheerio'
import { desc, eq } from 'drizzle-orm'

export type ScraperConstructor = new () => WebScrapingBase<any>

export abstract class WebScrapingBase<T> {
  protected abstract url: string
  protected abstract scrapingType: string
  protected scrapingInterval = 3600000 // 1 hora em milissegundos (padrão)
  private currentTime = new Date()

  protected async fetchHtml(): Promise<string> {
    return await http.fetch<string>(this.url)
  }

  protected abstract parse($: cheerio.CheerioAPI): T[]

  // TODO: Remover esse db daqui e colocar em um repository para ter mais controle
  protected async saveOrUpdateDatabase(data: T[]): Promise<void> {
    const existingRecord = await this.getLastRecord()
    if (existingRecord) {
      await db
        .update(scrapingData)
        .set({
          data: JSON.stringify(data),
          timestamp_updated_at: new Date()
        })
        .where(eq(scrapingData.id, existingRecord.id))
    } else {
      await db.insert(scrapingData).values({
        source: this.url,
        timestamp_created_at: new Date(),
        timestamp_updated_at: new Date(),
        type: this.scrapingType,
        data: JSON.stringify(data)
      })
    }
  }

  private shouldScrape(
    lastRecord: Pick<TimestampDTO, 'timestamp_created_at'> | undefined
  ): boolean {
    if (!lastRecord) return true
    const timeDifference =
      this.currentTime.getTime() - lastRecord.timestamp_created_at.getTime()
    return timeDifference >= this.scrapingInterval
  }

  // TODO: Remover esse db daqui e colocar em um repository para ter mais controle
  private async getLastRecord() {
    const result = await db
      .select()
      .from(scrapingData)
      .where(eq(scrapingData.type, this.scrapingType))
      .orderBy(desc(scrapingData.timestamp_created_at))
      .limit(1)

    return result[0]
  }

  public async scrape(): Promise<T[]> {
    const html = await this.fetchHtml()
    const $ = cheerio.load(html)
    return this.parse($)
  }

  public async scrapeAndSave(): Promise<void> {
    const lastScrapingRecord = await this.getLastRecord()

    if (this.shouldScrape(lastScrapingRecord)) {
      const data = await this.scrape()
      await this.saveOrUpdateDatabase(data)
      logger.debug(
        `Scraping performed and data ${lastScrapingRecord ? 'updated' : 'saved'} for ${this.scrapingType} at ${this.currentTime}`
      )
    } else {
      logger.debug(
        `Skipping scraping for ${this.scrapingType}. Last scraped at ${lastScrapingRecord?.timestamp_updated_at}`
      )
    }
  }

  public async getLatestDataFromDatabase(): Promise<T[] | null> {
    const result = await this.getLastRecord()

    if (result) {
      return JSON.parse(result.data) as T[]
    }
    return null
  }

  public async getOrScrapeData(): Promise<T[]> {
    const lastRecord = await this.getLastRecord()

    if (!lastRecord || this.shouldScrape(lastRecord)) {
      const scrapedData = await this.scrape()

      /* 
        TODO: Tem um problema esse código. Pois, caso aconteça um problema
        com o banco de dados, ou coisa parecida, ele pode acabar parando o sistema.
        O correto seria escapsular isso em um local que seja a prova do erro.
        E caso ele tenha esse erro, ele deve tentar fazer novamente.
      */
      this.saveOrUpdateDatabase(scrapedData).catch(logger.error)
      return scrapedData
    }
    return JSON.parse(lastRecord.data) as T[]
  }
}
