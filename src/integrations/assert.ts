import { Assert } from '@japa/assert'
import { PluginContext } from '../plugin_context.js'

/**
 * assert.snapshot method
 */
Assert.macro('snapshot', function (this: Assert, value: any) {
  return {
    match: () => {
      const snapshotManager = PluginContext.snapshotManager
      const testContext = PluginContext.currentTestContext

      if (
        snapshotManager.hasSnapshotInFile(testContext!.test) ||
        PluginContext.shouldUpdateSnapshots()
      ) {
        snapshotManager.updateFileSnapshot(testContext!.test, value)
        return
      }

      const testData = snapshotManager.getFileSnapshotTestData(testContext!.test, value)

      this.incrementAssertionsCount()
      this.evaluate(testData.pass, `'${testData.snapshotName}' snapshot comparison failed`, {
        actual: testData.received,
        showDiff: true,
        operator: 'matchSnapshot',
        expected: testData.expected,
      })
    },

    matchInline: (inlineSnapshot?: string) => {
      const snapshotManager = PluginContext.snapshotManager
      const testContext = PluginContext.currentTestContext

      if (!inlineSnapshot || PluginContext.shouldUpdateSnapshots()) {
        snapshotManager.updateInlineSnapshot(testContext!.test, value, 'assert')
        return
      }

      const testData = snapshotManager.getInlineSnapshotTestData(
        testContext!.test,
        value,
        inlineSnapshot
      )

      this.incrementAssertionsCount()
      this.evaluate(testData.pass, `'${testData.snapshotName}' snapshot comparison failed`, {
        actual: testData.received,
        showDiff: true,
        operator: 'matchInlineSnapshot',
        expected: testData.expected,
      })
    },
  }
})
