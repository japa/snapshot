import { test } from '@japa/runner'

import { SnapshotFile } from '../src/snapshot_file.js'
import { testFactory } from '../tests_helpers/index.js'
import { FileSnapshotter } from '../src/file_snapshotter.js'

test.group('File Snapshotter', () => {
  test('should returns a snapshot file', async ({ assert }) => {
    const test1 = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })

    const store = new FileSnapshotter()
    const result = store.getSnapshotFileForTest(test1)
    assert.instanceOf(result, SnapshotFile)
  })

  test('should returns the same snapshot file for the same test', async ({ assert }) => {
    const test1 = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })

    const store = new FileSnapshotter()

    const result1 = store.getSnapshotFileForTest(test1)
    const result2 = store.getSnapshotFileForTest(test1)

    assert.instanceOf(result1, SnapshotFile)
    assert.instanceOf(result2, SnapshotFile)
    assert.equal(result1, result2)
  })

  test('should returns same snapshot file for same filename', async ({ assert }) => {
    const test1 = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })
    const test2 = testFactory({ title: 'bar', fileName: 'foo.spec.ts' })

    const store = new FileSnapshotter()

    const result1 = store.getSnapshotFileForTest(test1)
    const result2 = store.getSnapshotFileForTest(test2)

    assert.equal(result1, result2)
  })

  test('should returns different snapshot file for different filename', async ({ assert }) => {
    const test1 = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })
    const test2 = testFactory({ title: 'bar', fileName: 'bar.spec.ts' })

    const store = new FileSnapshotter()

    const result1 = store.getSnapshotFileForTest(test1)
    const result2 = store.getSnapshotFileForTest(test2)

    assert.notEqual(result1, result2)
  })
})
