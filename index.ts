import './src/types/extended.js'

import { PluginFn } from '@japa/runner'
import { SnapshotPluginOptions } from './src/types/main.js'
import { PluginContext } from './src/plugin_context.js'
import { isModuleInstalled } from './src/utils/index.js'

/**
 * Snapshot plugin for Japa
 */
export function snapshot(options: SnapshotPluginOptions = {}) {
  PluginContext.init(options)

  if (isModuleInstalled('@japa/assert')) {
    import('./src/integrations/assert.js')
  }

  if (isModuleInstalled('@japa/expect')) {
    import('./src/integrations/expect.js')
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
