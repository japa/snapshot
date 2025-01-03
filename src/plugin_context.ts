/*
 * @japa/snapshot
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { CLIArgs } from '@japa/runner/types'
import type { TestContext } from '@japa/runner/core'

import type { SnapshotPluginOptions } from './types.js'
import { SnapshotManager } from './snapshot_manager.js'

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
