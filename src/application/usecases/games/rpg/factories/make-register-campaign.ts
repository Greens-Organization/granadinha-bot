import { DrizzleRPGCampaignMembersRepository } from '@/repositories/drizzle-sqlite/drizzle-rpg-campaign-members-repository'
import { DrizzleRPGCampaignsRepository } from '@/repositories/drizzle-sqlite/drizzle-rpg-campaigns-repository'
import { DrizzleTransaction } from '@/repositories/drizzle-sqlite/drizzle-transaction'
import { RegisterCampaignUseCase } from '../register-campaign'

export function makeRegisterCampaign() {
  const rpgCampaignsRepository = new DrizzleRPGCampaignsRepository()
  const rpgCampaignMembersRepository = new DrizzleRPGCampaignMembersRepository()
  const transaction = new DrizzleTransaction()

  return new RegisterCampaignUseCase(
    rpgCampaignsRepository,
    rpgCampaignMembersRepository,
    transaction
  )
}
