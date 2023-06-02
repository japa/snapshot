import expect, { MatcherFunction } from 'expect'
import { PluginContext } from '../plugin_context'

/**
 * expect('foo').toMatchInlineSnapshot() method
 */
const expectMatchInlineSnapshot: MatcherFunction<any> = function (
  value: any,
  inlineSnapshot?: string
) {
  const snapshotManager = PluginContext.snapshotManager
  const testContext = PluginContext.currentTestContext

  if (!inlineSnapshot || PluginContext.shouldUpdateSnapshots()) {
    snapshotManager.updateInlineSnapshot(testContext!.test, value, 'expect')
    return { pass: true, message: () => '' }
  }

  const testData = snapshotManager.getInlineSnapshotTestData(
    testContext!.test,
    value,
    inlineSnapshot
  )

  return {
    pass: testData.pass,
    message: () =>
      !testData.pass
        ? `Inline snapshot does not match:\n\n${this.utils.diff(
            testData.expected,
            testData.received
          )}`
        : ``,
  }
}

/**
 * expect('foo').toMatchSnapshot() method
 */
const expectMatchSnapshot: MatcherFunction<any> = function (value: any) {
  const snapshotManager = PluginContext.snapshotManager
  const testContext = PluginContext.currentTestContext

  if (
    snapshotManager.hasSnapshotInFile(testContext!.test) ||
    PluginContext.shouldUpdateSnapshots()
  ) {
    snapshotManager.updateFileSnapshot(testContext!.test, value)
    return { pass: true, message: () => '' }
  }

  const testData = snapshotManager.getFileSnapshotTestData(testContext!.test, value)

  return {
    pass: testData.pass,
    message: () =>
      !testData.pass
        ? `Snapshot does not match:\n\n${this.utils.diff(testData.expected, testData.received)}`
        : ``,
  }
}

/**
 * Extends jest-expect with toMatchSnapshot and toMatchInlineSnapshot
 */
expect.extend({
  toMatchSnapshot: expectMatchSnapshot,
  toMatchInlineSnapshot: expectMatchInlineSnapshot,
})
