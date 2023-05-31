import { TestContext } from '@japa/runner'
import { Asserter } from './asserter'
import { SnapshotManager } from './snapshot_manager'

export function expectSnapshot(ctx: TestContext, snapshotManager: SnapshotManager) {
  // TODO: seems a bit hacky. We need to pass Japa cli args to plugins
  const shouldUpdateSnapshots =
    process.argv.includes('-u') || process.argv.includes('--update-snapshots')

  const asserter = new Asserter(ctx.assert, ctx.expect)

  return {
    expect: (value: any) => {
      return {
        toMatchSnapshot: async () => {
          if (snapshotManager.hasSnapshotInFile(ctx.test) || shouldUpdateSnapshots) {
            snapshotManager.updateFileSnapshot(ctx.test, value)
            return
          }

          snapshotManager.compareFileSnapshot(ctx.test, value)
          asserter.assertSnapshotMatch(snapshotManager.getFileSnapshotTestData(ctx.test, value))
        },

        toMatchInlineSnapshot: async (inlineSnapshot?: string) => {
          if (!inlineSnapshot || shouldUpdateSnapshots) {
            snapshotManager.updateInlineSnapshot(ctx.test, value)
            return
          }

          snapshotManager.compareInlineSnapshot(ctx.test, value, inlineSnapshot)
          asserter.assertSnapshotMatch(
            snapshotManager.getInlineSnapshotTestData(ctx.test, value, inlineSnapshot)
          )
        },
      }
    },
  }
}
