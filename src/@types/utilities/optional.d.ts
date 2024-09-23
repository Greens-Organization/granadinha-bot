/**
 * Make some property optional on type
 *
 * @example
 * ```typescript
 * type User {
 *  id: string
 *  name: string
 *  email: string
 *  createdAt: Date
 * }
 *
 * Optional<User, 'id' | 'createdAt'>
 * // Result:
 * type User {
 *  id?: string
 *  name: string
 *  email: string
 *  createdAt?: Date
 * }
 * ```
 */
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
