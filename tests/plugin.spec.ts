import { test } from '@japa/runner'
import got from 'got'

test.group('Using plugin', () => {
  test('simple string', async ({ snapshot }) => {
    snapshot.expect('foddo').toMatchSnapshot()
  })

  test('string with double quotes', ({ snapshot }) => {
    snapshot.expect('foo "bar"').toMatchSnapshot()
  })

  test('string with backticks', ({ snapshot }) => {
    snapshot.expect('foo `bar`').toMatchSnapshot()
  })

  test('simple number', ({ snapshot }) => {
    snapshot.expect(42).toMatchSnapshot()
  })

  test('simple object', ({ snapshot }) => {
    snapshot.expect({ foo: 'bar' }).toMatchSnapshot()
  })

  test('complex object', ({ snapshot }) => {
    snapshot
      .expect({
        foo: 'bar',
        bar: 42,
        regex: /foo/g,
        specialCharactersRegex: /foo\//g,
        set: new Set(['foo', 'bar']),
        baz: {
          foo: 'bar',
          bar: 42,
          fn: () => {},
          fn2: function () {},
          fn3: async () => {},
          fn4: async function () {},
          fn5: function (foo: any) {
            return foo
          },
        },
      })
      .toMatchSnapshot()
  })

  test('html', ({ snapshot }) => {
    snapshot
      .expect(
        `
        <div>
          <p>foo</p>
          <p>bar</p>
        </div>
      `
      )
      .toMatchSnapshot()
  })

  test('inline', ({ snapshot }) => {
    snapshot.expect({
      foo: 'bar',
      fn: () => {},
    }).toMatchInlineSnapshot(`
      {
        "fn": [Function],
        "foo": "bar",
      }
    `)
  })

  test('inline with double quotes', ({ snapshot }) => {
    snapshot.expect({ foo: 'fodsdsdo "`bar`"' }).toMatchInlineSnapshot(`
      {
        "foo": "fodsdsdo \\"\`bar\`\\"",
      }
    `)
  })

  test('complex object inline', ({ snapshot }) => {
    snapshot.expect({
      foo: 'bar',
      bar: 42,
      regex: /foo/g,
      set: new Set(['foo', 'bar']),
      baz: {
        foo: 'basdsdsdsdsdr',
        bar: 42,
        fn: () => {},
        fn2: function () {},
        fn5: function (foo: any) {
          return foo
        },
      },
    }).toMatchInlineSnapshot(`
      {
        "bar": 42,
        "baz": {
          "bar": 42,
          "fn": [Function],
          "fn2": [Function],
          "fn5": [Function],
          "foo": "basdsdsdsdsdr",
        },
        "foo": "bar",
        "regex": /foo/g,
        "set": Set {
          "foo",
          "bar",
        },
      }
    `)
  })

  test('multiple inline snapshots', ({ snapshot }) => {
    snapshot.expect('foo').toMatchInlineSnapshot('"foo"')
    snapshot.expect('bar').toMatchInlineSnapshot('"bar"')
    snapshot.expect('baz').toMatchInlineSnapshot('"baz"')
    snapshot.expect('blabla').toMatchInlineSnapshot('"blabla"')
  })

  test('http request', async ({ snapshot }) => {
    const result = await got.get('https://jsonplaceholder.typicode.com/todos/1').json<any>()

    snapshot.expect(result).toMatchSnapshot()
  })

  test('http request inline', async ({ snapshot }) => {
    const result = await got.get('https://jsonplaceholder.typicode.com/todos/1').json<any>()
    snapshot.expect(result).toMatchInlineSnapshot(`
      {
        "completed": false,
        "id": 1,
        "title": "delectus aut autem",
        "userId": 1,
      }
    `)

    const result2 = await got.get('https://jsonplaceholder.typicode.com/todos/2').json<any>()
    snapshot.expect(result2).toMatchInlineSnapshot(`
      {
        "completed": false,
        "id": 2,
        "title": "quis ut nam facilis et officia qui",
        "userId": 1,
      }
    `)
  })
})
