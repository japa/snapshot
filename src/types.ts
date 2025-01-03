/*
 * @japa/snapshot
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { PrettyFormatOptions } from 'pretty-format'

/**
 * Options accepted by the snapshot plugin
 */
export interface SnapshotPluginOptions {
  prettyFormatOptions?: PrettyFormatOptions
  resolveSnapshotPath?: (testPath: string) => string
}

/**
 * Location in a file
 */
export interface FilePosition {
  column: number
  line: number
}

/**
 * Data for an inline snapshot to be inserted
 */
export interface InlineSnapshotData {
  frame: FilePosition
  filePath: string
  value: string
  matcher: 'expect' | 'assert'
}
