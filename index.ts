import './src/types/extended'

import { PluginFn } from '@japa/runner'
import { expectSnapshot } from './src/snapshot'
import { SnapshotPluginOptions } from './src/types/main'
import { SnapshotManager } from './src/snapshot_manager'

/**
 * Snapshot plugin for Japa
 */
export function snapshot(options: SnapshotPluginOptions = {}) {
  const snapshotManager = new SnapshotManager(options)

  const snapshotPlugin: PluginFn = function (config, _, { TestContext }) {
    TestContext.getter('snapshot', function () {
      return expectSnapshot(this, snapshotManager)
    })

    /**
     * Save snapshots after all tests are done
     */
    config.teardown.push(async () => {
      await snapshotManager.saveSnapshots()
    })
  }

  return snapshotPlugin
}
