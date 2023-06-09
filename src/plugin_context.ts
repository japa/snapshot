import { TestContext } from '@japa/runner'
import { SnapshotManager } from './snapshot_manager'
import { SnapshotPluginOptions } from './types/main'

export class PluginContext {
  static currentTestContext: TestContext | null
  static snapshotManager: SnapshotManager

  static init(options: SnapshotPluginOptions = {}) {
    this.snapshotManager = new SnapshotManager(options)
  }

  static setCurrentTestContext(testContext: TestContext) {
    this.currentTestContext = testContext
  }

  static shouldUpdateSnapshots() {
    return process.argv.includes('-u') || process.argv.includes('--update-snapshots')
  }
}
