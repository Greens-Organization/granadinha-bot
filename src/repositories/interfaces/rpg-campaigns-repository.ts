import type { RpgCampaign } from '@/infra/db/drizzle/migrations/rpg-campaigns'
import type { IRepositoryBase } from './base/interface-repository-base'

export interface RPGCampaignsRepository extends IRepositoryBase<RpgCampaign> {}
