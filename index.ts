import './src/types/extended'

import { PluginFn } from '@japa/runner'
import { SnapshotPluginOptions } from './src/types/main'
import { PluginContext } from './src/plugin_context'
import { isModuleInstalled } from './src/utils'

/**
 * Snapshot plugin for Japa
 */
export function snapshot(options: SnapshotPluginOptions = {}) {
  PluginContext.init(options)

  if (isModuleInstalled('@japa/assert')) {
    require('./src/integrations/assert')
  }

  if (isModuleInstalled('@japa/expect')) {
    require('./src/integrations/expect')
  }

  const snapshotPlugin: PluginFn = function (config, _, { TestContext }) {
    TestContext.created((ctx) => {
      PluginContext.setCurrentTestContext(ctx)
    })

    /**
     * Save snapshots after all tests are done
     */
    config.teardown.push(async () => {
      await PluginContext.snapshotManager.saveSnapshots()
    })
  }

  return snapshotPlugin
}
