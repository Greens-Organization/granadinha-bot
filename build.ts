import { logger } from '@/utils'
import { rm } from 'node:fs/promises'

const outDir = './dist'

async function build() {
  const entrypoints = ['./src/bot.ts']

  logger.debug('Building with entrypoints:', entrypoints)

  const result = await Bun.build({
    entrypoints: entrypoints,
    outdir: outDir,
    minify: true,
    target: 'bun',
    root: '.',
    sourcemap: 'external',
    external: ['discord.js']
  })

  if (!result.success) {
    logger.error(result)
    process.exit(1)
  }

  logger.debug('Build completed successfully!')
  logger.debug('Output files:')
  for (const output of result.outputs) {
    logger.debug(output.path)
  }
}

async function cleanOutdir() {
  try {
    await rm(outDir, { recursive: true, force: true })
    logger.debug(`Cleaned ${outDir}`)
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error
  }
}

cleanOutdir().then(build).catch(console.error)
