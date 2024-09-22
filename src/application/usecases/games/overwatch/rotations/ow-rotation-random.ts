import type { OverwatchScraping } from '@/infra/libs/web-scraping/overwatch'

interface PlayerAssignment {
  player: string
  hero: string
  role: string
}

export class OWRotationRandom {
  constructor(private readonly overwatchScraper: OverwatchScraping) {}

  async assignHeroesToPlayers(
    playerNames: string[]
  ): Promise<PlayerAssignment[]> {
    if (playerNames.length < 1 || playerNames.length > 5) {
      throw new Error('A quantidade de jogadores deve ser entre 1 e 5.')
    }

    const heroes = await this.overwatchScraper.getOrScrapeData()
    const selectedHeroes: PlayerAssignment[] = []
    const assignedPlayers = new Set<string>()
    let tankCount = 0
    let supportCount = 0
    let dpsCount = 0
    const availableHeroes = [...heroes]

    while (selectedHeroes.length < playerNames.length) {
      const randomHeroIndex = Math.floor(Math.random() * availableHeroes.length)
      const randomHero = availableHeroes[randomHeroIndex]
      const randomPlayerIndex = Math.floor(Math.random() * playerNames.length)
      const randomPlayer = playerNames[randomPlayerIndex]

      if (assignedPlayers.has(randomPlayer)) continue

      if (
        (randomHero.role.toUpperCase() === 'TANK' && tankCount < 1) ||
        (randomHero.role.toUpperCase() === 'SUPPORT' && supportCount < 2) ||
        (randomHero.role.toUpperCase() === 'DAMAGE' && dpsCount < 2)
      ) {
        selectedHeroes.push({
          player: randomPlayer,
          hero: randomHero.name,
          role: randomHero.role
        })
        assignedPlayers.add(randomPlayer)
        availableHeroes.splice(randomHeroIndex, 1)

        if (randomHero.role.toUpperCase() === 'TANK') tankCount++
        else if (randomHero.role.toUpperCase() === 'SUPPORT') supportCount++
        else if (randomHero.role.toUpperCase() === 'DAMAGE') dpsCount++
      }
    }

    return selectedHeroes
  }
}
