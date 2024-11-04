import { DrizzleBaseRepository } from './base/drizzle-repository-base'
import {
  rpgCampaignMembers,
  type RpgCampaignMember
} from '@/infra/db/drizzle/migrations/rpg-campaign-members'

export class DrizzleRPGCampaignMembersRepository extends DrizzleBaseRepository<RpgCampaignMember> {
  constructor() {
    super(rpgCampaignMembers)
  }
}
