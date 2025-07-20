import type { RpgCampaignMember } from '@/infra/db/drizzle/migrations/rpg-campaign-members'
import type { IRepositoryBase } from './base/interface-repository-base'

export interface RPGCampaignMembersRepository
  extends IRepositoryBase<RpgCampaignMember> {}
