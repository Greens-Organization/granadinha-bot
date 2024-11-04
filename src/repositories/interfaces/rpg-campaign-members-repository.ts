import type { IRepositoryBase } from './base/interface-repository-base'
import type { RpgCampaignMember } from '@/infra/db/drizzle/migrations/rpg-campaign-members'

export interface RPGCampaignMembersRepository
  extends IRepositoryBase<RpgCampaignMember> {}
