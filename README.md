# @japa/snapshot

> Snapshot testing plugin for Japa

[![gh-workflow-image]][gh-workflow-url] [![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url]

Snapshot testing plugin for Japa. This plugin allows you to write snapshot tests for your application.

#### [Complete API documentation](https://japa.dev/docs/plugins/snapshot)

## Installation

Install the package from the npm registry as follows:

```sh
npm i @japa/snapshot

pnpm i @japa/snapshot

yarn add @japa/snapshot
```

## Usage

You can use this package with the `@japa/runner` as follows.

```ts
import { snapshot } from '@japa/snapshot'
import { configure } from '@japa/runner'

configure({
  plugins: [snapshot()],
})
```

Once done, you will be able to use the 2 new matchers added, either on expect or assert

```ts
test('test title', ({ expect, assert }) => {
  // with @japa/assert
  assert.snapshot('1').match()

  // with @japa/expect
  expect('1').toMatchSnapshot()
})
```

[gh-workflow-image]: https://img.shields.io/github/actions/workflow/status/japa/snapshot/checks.yml?branch=main&style=for-the-badge
[gh-workflow-url]: https://github.com/japa/snapshot/actions/workflows/checks.yml 'Github action'

[npm-image]: https://img.shields.io/npm/v/@japa/snapshot/latest.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/@japa/snapshot/v/latest 'npm'

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript

[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/japa/snapshot?style=for-the-badge
