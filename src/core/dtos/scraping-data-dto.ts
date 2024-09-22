import type { TimestampDTO } from './timestamp-dto'

export interface ScrapingDataDTO extends TimestampDTO {
  id?: string
  source: string
  type: string
  data: string
}
