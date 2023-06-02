import { test } from '@japa/runner'
import dedent from 'dedent'
import { InlineSnapshotInserter } from '../src/inline/inline_snapshot_inserter'
import { serializeSnapshotValue } from '../src/utils'

test.group('Inline snapshot inserter | Regexes', () => {
  test('expect | simple string', async ({ expect }) => {
    const code = dedent`
      expect('foo').toMatchInlineSnapshot()
    `

    const { newCode } = InlineSnapshotInserter.insert(code, [
      {
        filePath: '',
        frame: { line: 1, column: 8 },
        matcher: 'expect',
        value: '"foo"',
      },
    ])

    expect(newCode).toEqual(`expect('foo').toMatchInlineSnapshot('"foo"')`)
  })

  test('assert | simple string', async ({ expect }) => {
    const code = dedent`
      assert.snapshot('foo').matchInline()
    `

    const { newCode } = InlineSnapshotInserter.insert(code, [
      {
        filePath: '',
        frame: { line: 1, column: 8 },
        matcher: 'assert',
        value: '"foo"',
      },
    ])

    expect(newCode).toEqual(`assert.snapshot('foo').matchInline('"foo"')`)
  })

  test('expect | replace simple string', async ({ expect }) => {
    const code = dedent`
      expect('foo').toMatchInlineSnapshot('"bar"')
    `

    const { newCode } = InlineSnapshotInserter.insert(code, [
      {
        filePath: '',
        frame: { line: 1, column: 8 },
        matcher: 'expect',
        value: '"foo"',
      },
    ])

    expect(newCode).toEqual(`expect('foo').toMatchInlineSnapshot('"foo"')`)
  })

  test('assert | replace simple string', async ({ expect }) => {
    const code = dedent`
      assert.snapshot('foo').matchInline('"bar"')
    `

    const { newCode } = InlineSnapshotInserter.insert(code, [
      {
        filePath: '',
        frame: { line: 1, column: 8 },
        matcher: 'assert',
        value: '"foo"',
      },
    ])

    expect(newCode).toEqual(`assert.snapshot('foo').matchInline('"foo"')`)
  })
})

test.group('Inline snapshot inserter | Indentation', () => {
  test('object should keep indentation of context', ({ assert }) => {
    const code = dedent`
      test('foo', ({ assert }) => {
        assert
          .snapshot({
            foo: 'bar',
            test: 42,
            test2: 'test',
            bar: {
              foo: 'bar',
              test: 42,
            }
          })
          .matchInline()
      })
    `

    const { newCode } = InlineSnapshotInserter.insert(code, [
      {
        filePath: '',
        frame: { line: 2, column: 8 },
        matcher: 'assert',
        value: serializeSnapshotValue({
          foo: 'bar',
          test: 42,
          test2: 'test',
          bar: {
            foo: 'bar',
            test: 42,
          },
        }),
      },
    ])

    assert.snapshot(newCode).matchInline(`
      "test('foo', ({ assert }) => {
        assert
          .snapshot({
            foo: 'bar',
            test: 42,
            test2: 'test',
            bar: {
              foo: 'bar',
              test: 42,
            }
          })
          .matchInline(\`
          {
            \\"bar\\": {
              \\"foo\\": \\"bar\\",
              \\"test\\": 42,
            },
            \\"foo\\": \\"bar\\",
            \\"test\\": 42,
            \\"test2\\": \\"test\\",
          }
        \`)
      })"
    `)
  })
})
