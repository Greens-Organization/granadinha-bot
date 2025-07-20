import type * as cheerio from 'cheerio'
import type { OverwatchHeroesDTO } from '@/core/dtos/overwatch-heroes-dto'
import { WebScrapingBase } from '@/core/structures/web/web-scraping/web-scraping-base'
import { constants } from '@/infra/common'

// @RegisterScraper('overwatch') // NO USAGE YET
export class OverwatchScraping extends WebScrapingBase<OverwatchHeroesDTO> {
  protected url = constants.URIS.OVERWATCH_HEROES_URL
  protected scrapingType = 'overwatch_heroes'

  protected parse($: cheerio.CheerioAPI): OverwatchHeroesDTO[] {
    const heroes: OverwatchHeroesDTO[] = []
    $('.heroCard').each((_, element) => {
      const name = $(element).attr('hero-name') || ''
      const role = $(element).attr('data-role') || ''
      const icon = $(element).attr('icon') || ''
      const img = $(element).find('.heroCardPortrait').attr('src') || ''
      heroes.push({ name, icon, img, role })
    })
    return heroes
  }
}
