import {
  type RpgCampaignMember,
  rpgCampaignMembers
} from '@/infra/db/drizzle/migrations/rpg-campaign-members'
import { DrizzleBaseRepository } from './base/drizzle-repository-base'

export class DrizzleRPGCampaignMembersRepository extends DrizzleBaseRepository<RpgCampaignMember> {
  constructor() {
    super(rpgCampaignMembers)
  }
}
