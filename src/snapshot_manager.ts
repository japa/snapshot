import { Test } from '@japa/runner'
import { FileSnapshotter } from './file_snapshotter.js'
import { InlineSnaphotter } from './inline/inline_snapshotter.js'
import { SnapshotPluginOptions } from './types/main.js'

export class SnapshotManager {
  #inlineSnapshotter: InlineSnaphotter
  #fileSnapshotter: FileSnapshotter

  /**
   * Keep track of the different snapshot results/updates
   */
  summary: {
    passed: number
    failed: number
    updated: number
  } = {
    passed: 0,
    failed: 0,
    updated: 0,
  }

  constructor(options: SnapshotPluginOptions = {}) {
    this.#inlineSnapshotter = new InlineSnaphotter()
    this.#fileSnapshotter = new FileSnapshotter(options)
  }

  /**
   * Check if the test has an inline snapshot
   */
  hasSnapshotInFile(test: Test) {
    return this.#fileSnapshotter.hasSnapshot(test)
  }

  /**
   * Update an inline snapshot
   */
  updateInlineSnapshot(test: Test, value: any, matcher: 'expect' | 'assert') {
    this.#inlineSnapshotter.updateSnapshot(test, value, matcher)
    this.summary.updated++
  }

  /**
   * Update a snapshot in the file
   */
  updateFileSnapshot(test: Test, value: any) {
    this.#fileSnapshotter.updateSnapshot(test, value)
    this.summary.updated++
  }

  /**
   * Returns the data needed for a future assertion
   */
  getInlineSnapshotTestData(test: Test, received: any, expected: string) {
    return this.#inlineSnapshotter.getSnapshotTestData(test, received, expected)
  }

  /**
   * Returns the data needed for a future assertion
   */
  getFileSnapshotTestData(test: Test, received: any) {
    return this.#fileSnapshotter.getSnapshotTestData(test, received)
  }

  /**
   * Save both inline and file snapshots to disk
   */
  saveSnapshots() {
    return Promise.all([
      this.#fileSnapshotter.saveSnapshots(),
      this.#inlineSnapshotter.saveSnapshots(),
    ])
  }
}
