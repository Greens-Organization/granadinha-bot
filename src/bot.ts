import fs from 'node:fs'
import path from 'node:path'
import {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
  type Interaction,
  REST,
  Routes,
  type ApplicationCommandData
} from 'discord.js'
import { env } from './infra/env'

interface Command {
  data: ApplicationCommandData
  execute: (interaction: Interaction) => Promise<void>
}

class DiscordBot extends Client {
  commands: Collection<string, Command>

  constructor() {
    super({ intents: [GatewayIntentBits.Guilds] })
    this.commands = new Collection()
  }

  async loadCommands(
    dir: string = path.join(__dirname, 'commands')
  ): Promise<void> {
    const files = fs.readdirSync(dir, { withFileTypes: true })

    for (const file of files) {
      const filePath = path.join(dir, file.name)

      if (file.isDirectory()) {
        await this.loadCommands(filePath)
      } else if (file.name.endsWith('.ts') || file.name.endsWith('.js')) {
        try {
          const command = (await import(filePath)) as Command
          if ('data' in command && 'execute' in command) {
            this.commands.set(command.data.name, command)
            console.log(`Comando carregado: ${command.data.name}`)
          } else {
            console.log(
              `[AVISO] O comando em ${filePath} está faltando uma propriedade "data" ou "execute" obrigatória.`
            )
          }
        } catch (error) {
          console.error(`Erro ao carregar o comando em ${filePath}:`, error)
        }
      }
    }
  }

  async registerCommands(): Promise<void> {
    const rest = new REST({ version: '10' }).setToken(env.BOT_TOKEN)
    const commandsData = Array.from(this.commands.values()).map(
      (command) => command.data
    )

    try {
      console.log(
        `Iniciando a atualização de ${commandsData.length} comandos de aplicação (/).`
      )

      const data = await rest.put(
        Routes.applicationCommands(env.APPLICATION_ID),
        {
          body: commandsData
        }
      )

      console.log(
        `Atualização bem-sucedida de ${(data as any[]).length} comandos de aplicação (/).`
      )
    } catch (error) {
      console.error('Erro ao registrar comandos slash:', error)
    }
  }

  async handleInteraction(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return

    const command = this.commands.get(interaction.commandName)

    if (!command) {
      console.error(
        `Nenhum comando correspondente ${interaction.commandName} foi encontrado.`
      )
      return
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'Ocorreu um erro ao executar este comando!',
          ephemeral: true
        })
      } else {
        await interaction.reply({
          content: 'Ocorreu um erro ao executar este comando!',
          ephemeral: true
        })
      }
    }
  }

  async start() {
    await this.loadCommands()
    await this.registerCommands()

    this.once(Events.ClientReady, () => {
      console.log('Bot está online!')
    })

    this.on(Events.InteractionCreate, this.handleInteraction.bind(this))

    await this.login(env.BOT_TOKEN)
  }
}

const bot = new DiscordBot()
bot.start().catch(console.error)
