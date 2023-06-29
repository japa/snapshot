import type { TestContext } from '@japa/runner/core'
import { SnapshotManager } from './snapshot_manager.js'
import { SnapshotPluginOptions } from './types/main.js'
import { CLIArgs } from '@japa/runner/types'

export class PluginContext {
  static currentTestContext: TestContext | null
  static snapshotManager: SnapshotManager

  static #cliArgs: CLIArgs

  static init(options: SnapshotPluginOptions = {}, cliArgs: CLIArgs) {
    this.snapshotManager = new SnapshotManager(options)
    this.#cliArgs = cliArgs
  }

  static setCurrentTestContext(testContext: TestContext) {
    this.currentTestContext = testContext
  }

  static shouldUpdateSnapshots() {
    return this.#cliArgs.u || this.#cliArgs['update-snapshots']
  }
}
