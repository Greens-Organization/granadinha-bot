import { OverwatchScraping } from '@/infra/libs/web-scraping/overwatch'
import { OWRotationRandom } from '../ow-rotation-random'

export async function makeOWRotationRandom() {
  const overwatchScraper = new OverwatchScraping()
  return new OWRotationRandom(overwatchScraper)
}
