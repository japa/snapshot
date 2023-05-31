import { test } from '@japa/runner'
import { fsJoin, importUncached, testFactory } from '../tests_helpers'
import { SnapshotFile } from '../src/snapshot_file'

test.group('Snapshot file', () => {
  test('should create new file with snapshot', async ({ assert, fs }) => {
    const test1 = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })

    const file = new SnapshotFile(fsJoin('foo.spec.ts'))
    await file.updateSnapshot(test1, 'foo')

    await file.saveSnapshots()

    await assert.fileExists('__snapshots__/foo.spec.ts.cjs')
    const content = await importUncached(file.getSnapshotPath())
    assert.deepEqual(content.default, { foo: '"foo"' })
  })

  test('should append snapshot to existing file', async ({ assert, fs }) => {
    const test1 = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })
    const test2 = testFactory({ title: 'bar', fileName: 'foo.spec.ts' })

    const file = new SnapshotFile(fsJoin('foo.spec.ts'))
    await file.updateSnapshot(test1, 'foo')
    await file.updateSnapshot(test2, 42)

    await file.saveSnapshots()

    await assert.fileExists('__snapshots__/foo.spec.ts.cjs')
    const content = await importUncached(file.getSnapshotPath())
    assert.deepEqual(content.default, { foo: '"foo"', bar: '42' })
  })

  test('should escape backticks in snapshot', async ({ assert, fs }) => {
    const test1 = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })

    const file = new SnapshotFile(fsJoin('foo.spec.ts'))
    await file.updateSnapshot(test1, 'foo `bar`')

    await file.saveSnapshots()

    await assert.fileExists('__snapshots__/foo.spec.ts.cjs')
    await assert.fileContains('__snapshots__/foo.spec.ts.cjs', 'foo \\`bar\\`')
  })

  test('should surround string with double quotes and escape quotes', async ({ assert, fs }) => {
    const test1 = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })

    const file = new SnapshotFile(fsJoin('foo.spec.ts'))
    await file.updateSnapshot(test1, 'foo "bar"')

    await file.saveSnapshots()

    await assert.fileExists('__snapshots__/foo.spec.ts.cjs')
    await assert.fileContains('__snapshots__/foo.spec.ts.cjs', '"foo \\\\"bar\\\\""')
  })

  test('with custom prettyFormat options', async ({ assert, fs }) => {
    const test1 = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })

    const file = new SnapshotFile(fsJoin('foo.spec.ts'), {
      prettyFormatOptions: { printFunctionName: true, printBasicPrototype: true },
    })

    await file.updateSnapshot(test1, { fn: async function hello() {} })
    await file.saveSnapshots()

    await assert.fileContains(
      '__snapshots__/foo.spec.ts.cjs',
      'exports[`foo`] = `Object {\n  "fn": [Function hello],\n}`'
    )
  })

  test('with custom snapshot resolver', async ({ assert, snapshot }) => {
    const test1 = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })

    const file = new SnapshotFile(fsJoin('foo.spec.ts'), {
      resolveSnapshotPath: (testPath) => testPath.replace('.spec.ts', '.snap'),
    })

    await file.updateSnapshot(test1, 'foo')
    await file.saveSnapshots()

    await assert.fileExists('foo.snap')

    const content = await importUncached(file.getSnapshotPath())
    snapshot.expect(content.default).toMatchInlineSnapshot(`
      {
        "foo": "\\"foo\\"",
      }
    `)
  })
})
