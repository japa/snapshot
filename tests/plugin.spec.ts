import { test } from '@japa/runner'

test.group('assert.matchSnapshot', () => {
  test('simple string', async ({ assert }) => {
    assert.snapshot('foo').match()
  })

  test('string with double quotes', ({ assert }) => {
    assert.snapshot('foo "bar"').match()
  })

  test('string with backticks', ({ assert }) => {
    assert.snapshot('foo `bar`').match()
  })

  test('simple number', ({ assert }) => {
    assert.snapshot(34).match()
  })

  test('simple object', ({ assert }) => {
    assert.snapshot('foo').match()
  })
})

test.group('assert.matchInlineSnapshot', () => {
  test('assert inline | simple string', async ({ assert }) => {
    assert.snapshot('foo').matchInline('"foo"')
  })

  test('assert inline | string with double quotes', ({ assert }) => {
    assert.snapshot('foo "bar"').matchInline('"foo \\"bar\\""')
  })

  test('assert inline | string with backticks', ({ assert }) => {
    assert.snapshot('foo `bar`').matchInline('"foo `bar`"')
  })

  test('assert inline | simple number', ({ assert }) => {
    assert.snapshot(42).matchInline('42')
  })

  test('assert inline | simple object', ({ assert }) => {
    assert.snapshot({ foo: 'bar' }).matchInline(`
      {
        "foo": "bar",
      }
    `)
  })
})

test.group('expect.toMatchInlineSnapshot', () => {
  test('expect inline | simple string', async ({ expect }) => {
    expect('foo').toMatchInlineSnapshot('"foo"')
  })

  test('expect inline | string with double quotes', ({ expect }) => {
    expect('foo "bar"').toMatchInlineSnapshot('"foo \\"bar\\""')
  })

  test('expect inline | string with backticks', ({ expect }) => {
    expect('foo `bar`').toMatchInlineSnapshot('"foo `bar`"')
  })

  test('expect inline | simple number', ({ expect }) => {
    expect(42).toMatchInlineSnapshot('42')
  })

  test('expect inline | simple object', ({ expect }) => {
    expect({ foo: 'bar' }).toMatchInlineSnapshot(`
      {
        "foo": "bar",
      }
    `)
  })
})
