/*
 * @japa/snapshot
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Test } from '@japa/runner/core'
import type { PluginFn } from '@japa/runner/types'

import { PluginContext } from './src/plugin_context.js'
import { isModuleInstalled } from './src/utils/index.js'
import { SnapshotPluginOptions } from './src/types/main.js'

/**
 * Snapshot plugin for Japa
 */
export function snapshot(options: SnapshotPluginOptions = {}) {
  if (isModuleInstalled('@japa/assert')) {
    import('./src/integrations/assert.js')
  }

  if (isModuleInstalled('@japa/expect')) {
    import('./src/integrations/expect.js')
  }

  const snapshotPlugin: PluginFn = function ({ config, cliArgs }) {
    PluginContext.init(options, cliArgs)

    Test.executing((test) => {
      PluginContext.setCurrentTestContext(test.context)
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
