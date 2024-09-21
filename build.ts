const result = await Bun.build({
  entrypoints: ['./src/bot.ts'],
  outdir: './dist',
  minify: true,
  target: 'bun',
  external: [''],
  root: '.'
})

if (result.success) {
  console.log('Build with success!')
} else {
  console.error(result)
}

// Recebe 0 ou 1. Default=0
process.exit(0)

export {}
