exports[`Using plugin > simple string`] = `"foddo"`

exports[`Using plugin > string with double quotes`] = `"foo \\"bar\\""`

exports[`Using plugin > string with backticks`] = `"foo \`bar\`"`

exports[`Using plugin > simple number`] = `42`

exports[`Using plugin > simple object`] = `{
  "foo": "bar",
}`

exports[`Using plugin > complex object`] = `{
  "bar": 42,
  "baz": {
    "bar": 42,
    "fn": [Function],
    "fn2": [Function],
    "fn3": [Function],
    "fn4": [Function],
    "fn5": [Function],
    "foo": "bar",
  },
  "foo": "bar",
  "regex": /foo/g,
  "set": Set {
    "foo",
    "bar",
  },
  "specialCharactersRegex": /foo\\//g,
}`

exports[`Using plugin > html`] = `"
        <div>
          <p>foo</p>
          <p>bar</p>
        </div>
      "`

exports[`Using plugin > http request`] = `{
  "completed": false,
  "id": 1,
  "title": "delectus aut autem",
  "userId": 1,
}`

exports[`Using plugin > multiple snapshots in one test`] = `"foo"`

