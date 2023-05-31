# @japa/snapshot

> Snapshot testing plugin for Japa

[![gh-workflow-image]][gh-workflow-url] [![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url] [![snyk-image]][snyk-url]

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

Once done, you will be able to access the `snapshot` property on the test context.

```ts
test('test title', ({ snapshot }) => {
  snapshot.expect('hello').toMatchSnapshot()
})
```

[gh-workflow-image]: https://img.shields.io/github/workflow/status/japa/snapshot/test?style=for-the-badge
[gh-workflow-url]: https://github.com/japa/snapshot/actions/workflows/test.yml 'Github action'
[npm-image]: https://img.shields.io/npm/v/@japa/snapshot/latest.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/@japa/snapshot/v/latest 'npm'
[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/japa/snapshot?style=for-the-badge
[snyk-image]: https://img.shields.io/snyk/vulnerabilities/github/japa/snapshot?label=Snyk%20Vulnerabilities&style=for-the-badge
[snyk-url]: https://snyk.io/test/github/japa/snapshot?targetFile=package.json 'snyk'
