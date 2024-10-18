import 'reflect-metadata'

export function NeedsCache() {
  return (target: any) => {
    Reflect.defineMetadata('needsCache', true, target)
  }
}
