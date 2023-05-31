import type { Assert } from '@japa/assert'
import type { Expect } from '@japa/expect'

export class Asserter {
  #assert?: Assert
  #expect?: Expect

  constructor(assert?: Assert, expect?: Expect) {
    this.#assert = assert
    this.#expect = expect
  }

  #ensureAtLeastOneAsserterSet() {
    if (!this.#assert && !this.#expect) {
      throw new Error('You must either install @japa/assert or @japa/expect')
    }
  }

  assertSnapshotMatch(options: {
    snapshotName: string
    expected: any
    received: any
    pass: boolean
    inline?: boolean
  }) {
    this.#ensureAtLeastOneAsserterSet()

    if (this.#assert) {
      this.#assert.incrementAssertionsCount()
      this.#assert.evaluate(options.pass, `'${options.snapshotName}' snapshot comparison failed`, {
        actual: options.received,
        showDiff: true,
        operator: options.inline ? 'toMatchInlineSnapshot' : 'toMatchSnapshot',
        expected: options.expected,
      })

      return
    }

    if (this.#expect) {
      this.#expect(options.received).toEqual(options.expected)

      return
    }
  }
}
