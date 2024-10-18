import { Client, GatewayIntentBits, Partials } from 'discord.js'
import { EventHandler } from './core/structures/bot/events/event-handler'
import { DiscordJSAdapter } from './core/structures/bot/discord-js-adapter'

function bot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
  })
  const eventHandler = new EventHandler(client)
  return new DiscordJSAdapter(client, eventHandler)
}

bot().init()
