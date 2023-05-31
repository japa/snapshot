import { PrettyFormatOptions } from 'pretty-format'

/**
 * Options accepted by the snapshot plugin
 */
export interface SnapshotPluginOptions {
  prettyFormatOptions?: PrettyFormatOptions
  resolveSnapshotPath?: (testPath: string) => string
}
