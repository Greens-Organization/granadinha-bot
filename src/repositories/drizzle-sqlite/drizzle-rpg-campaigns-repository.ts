import {
  rpgCampaigns,
  type RpgCampaign
} from '@/infra/db/drizzle/migrations/rpg-campaigns'
import { DrizzleBaseRepository } from './base/drizzle-repository-base'

export class DrizzleRPGCampaignsRepository extends DrizzleBaseRepository<RpgCampaign> {
  constructor() {
    super(rpgCampaigns)
  }
}
