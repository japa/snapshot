import { test } from '@japa/runner'
import { SnapshotFile } from '../src/snapshot_file'
import { FileSnapshotter } from '../src/file_snapshotter'
import { testFactory } from '../tests_helpers'

test.group('File Snapshotter', () => {
  test('should returns a snapshot file', async ({ assert }) => {
    const test = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })

    const store = new FileSnapshotter()
    const result = await store.getSnapshotFileForTest(test)
    assert.instanceOf(result, SnapshotFile)
  })

  test('should returns the same snapshot file for the same test', async ({ assert }) => {
    const test = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })

    const store = new FileSnapshotter()

    const result1 = await store.getSnapshotFileForTest(test)
    const result2 = await store.getSnapshotFileForTest(test)

    assert.instanceOf(result1, SnapshotFile)
    assert.instanceOf(result2, SnapshotFile)
    assert.equal(result1, result2)
  })

  test('should returns same snapshot file for same filename', async ({ assert }) => {
    const test1 = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })
    const test2 = testFactory({ title: 'bar', fileName: 'foo.spec.ts' })

    const store = new FileSnapshotter()

    const result1 = await store.getSnapshotFileForTest(test1)
    const result2 = await store.getSnapshotFileForTest(test2)

    assert.equal(result1, result2)
  })

  test('should returns different snapshot file for different filename', async ({ assert }) => {
    const test1 = testFactory({ title: 'foo', fileName: 'foo.spec.ts' })
    const test2 = testFactory({ title: 'bar', fileName: 'bar.spec.ts' })

    const store = new FileSnapshotter()

    const result1 = await store.getSnapshotFileForTest(test1)
    const result2 = await store.getSnapshotFileForTest(test2)

    assert.notEqual(result1, result2)
  })
})
