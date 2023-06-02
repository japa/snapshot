/* eslint-disable @typescript-eslint/no-shadow */
// @ts-ignore
import type { Assert } from '@japa/assert'

declare module '@japa/assert' {
  interface Assert {
    snapshot(value: any): {
      matchInline(inlineSnapshot?: string): void
      match(): void
    }
  }
}

declare module 'expect' {
  interface Matchers<R> {
    toMatchSnapshot(): R
    toMatchInlineSnapshot(inlineSnapshot?: string): R
  }
}
