import { CommandHandler } from './command-handler'

// Smell Code 💩
// TODO: Dá um jeito de não precisar fazer isso. Se bem que envolvendo evento e
// loop event isso é algo bem comum em alguns códigos.
export class CommandHandlerManager {
  private static instance: CommandHandlerManager
  private commandHandler: CommandHandler | null = null

  static getInstance(): CommandHandlerManager {
    if (!CommandHandlerManager.instance) {
      CommandHandlerManager.instance = new CommandHandlerManager()
    }
    return CommandHandlerManager.instance
  }

  async initCommandHandler(): Promise<void> {
    if (!this.commandHandler) {
      this.commandHandler = new CommandHandler()
      await this.commandHandler.init()
    }
  }

  getCommandHandler(): CommandHandler {
    if (!this.commandHandler) {
      throw new Error(
        'CommandHandler não foi inicializado. Chame initializeCommandHandler primeiro.'
      )
    }
    return this.commandHandler
  }
}
