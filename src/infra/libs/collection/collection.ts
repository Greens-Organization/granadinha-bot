/**
 * @internal
 */
export interface CollectionConstructor {
  new (): Collection<unknown, unknown>
  new <Key, Value>(
    entries?: readonly (readonly [Key, Value])[] | null
  ): Collection<Key, Value>
  new <Key, Value>(
    iterable: Iterable<readonly [Key, Value]>
  ): Collection<Key, Value>
  readonly prototype: Collection<unknown, unknown>
  readonly [Symbol.species]: CollectionConstructor
}

/**
 * Separate interface for the constructor so that emitted js does not have a constructor that overwrites itself
 * @internal
 */
export interface Collection<Key, Value> extends Map<Key, Value> {
  constructor: CollectionConstructor
}

export class Collection<Key, Value> extends Map<Key, Value> {
  /**
   * Maps each item to another value into an array. Identical in behavior to
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map | Array.map()}.
   *
   * @param fn - Function that produces an element of the new array, taking three arguments
   * @param thisArg - Value to use as `this` when executing the function
   * @example
   * ```ts
   * collection.map(user => user.tag);
   * ```
   */
  public map<NewValue>(
    fn: (value: Value, key: Key, collection: this) => NewValue
  ): NewValue[]
  public map<This, NewValue>(
    fn: (this: This, value: Value, key: Key, collection: this) => NewValue,
    thisArg: This
  ): NewValue[]
  public map<NewValue>(
    fn: (value: Value, key: Key, collection: this) => NewValue,
    thisArg?: unknown
  ): NewValue[] {
    if (typeof fn !== 'function') throw new TypeError(`${fn} is not a function`)
    if (thisArg !== undefined) fn = fn.bind(thisArg)
    const iter = this.entries()
    return Array.from({ length: this.size }, (): NewValue => {
      const next = iter.next()
      if (next.done) throw new Error('Unexpected end of collection')
      const [key, value] = next.value
      return fn(value, key, this)
    })
  }
}
