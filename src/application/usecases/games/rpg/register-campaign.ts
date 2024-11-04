import type {
  RPGCampaignMembersRepository,
  RPGCampaignsRepository
} from '@/repositories/interfaces'
import type { ITransactionBase } from '@/repositories/interfaces/base/interface-transaction-base'

interface RegisterCampaignDTO {
  name: string
  platform: string
  channelId: number
  voiceId: number
  defaultSchedule: string
  userId: string
  username: string
}

interface RegisterCampaignResult {
  campaignId: number
  name: string
  channelId: number
  voiceId: number
  platform: string
  defaultSchedule: string
}

type Response = RegisterCampaignResult

export class RegisterCampaignUseCase {
  constructor(
    private readonly rpgCampaignsRepository: RPGCampaignsRepository,
    private readonly rpgCampaignMembersRepository: RPGCampaignMembersRepository,
    private readonly transaction: ITransactionBase
  ) {}
  async execute(data: RegisterCampaignDTO): Promise<void> {
    // Verifica se já existe uma campanha neste canal
    const existingCampaign = await this.rpgCampaignsRepository.findById(
      data.channelId
    )

    if (existingCampaign) {
      throw new Error('CHANNEL_ALREADY_HAS_CAMPAIGN')
    }

    // TODO: usar dayjs para fazer melhoria na hora manipulação de tempo
    const currentTimestamp = new Date()

    await this.transaction.runInTransaction(async () => {
      // Cria a campanha
      const createCampaign = await this.rpgCampaignsRepository.create({
        name: data.name,
        gamePlatform: data.platform,
        discordVoiceId: data.voiceId,
        discordChannelId: data.channelId,
        defaultSchedule: data.defaultSchedule,
        timestampCreatedAt: currentTimestamp,
        timestampUpdatedAt: currentTimestamp
      })

      // Registra o criador como mestre
      const createCampaignMembers =
        await this.rpgCampaignMembersRepository.create({
          campaignId: createCampaign.id,
          userId: data.userId,
          username: data.username,
          role: 'MASTER',
          timestampCreatedAt: currentTimestamp,
          timestampUpdatedAt: currentTimestamp
        })
    })
  }
}
