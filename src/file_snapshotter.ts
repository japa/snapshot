import { Test } from '@japa/runner'
import { basename, dirname, join } from 'node:path'
import { SnapshotFile } from './snapshot_file.js'
import { SnapshotPluginOptions } from './types/main.js'

export class FileSnapshotter {
  #files: Set<SnapshotFile> = new Set()
  #options: SnapshotPluginOptions

  constructor(options: SnapshotPluginOptions = {}) {
    this.#options = options
  }

  /**
   * Resolve the test path from a given test
   */
  #resolveTestPath(test: Test) {
    const testDir = dirname(test.options.meta.fileName)
    const testFileName = basename(test.options.meta.fileName)

    return join(testDir, testFileName)
  }

  /**
   * Return all SnapshotFile instances
   */
  getFiles() {
    return this.#files
  }

  /**
   * Check if a snapshot file exists for a given test path
   * Otherwise, create a new one and return it
   */
  getSnapshotFileForTest(test: Test) {
    const testPath = this.#resolveTestPath(test)

    const existingFile = [...this.#files].find((file) => file.getTestPath() === testPath)
    if (existingFile) {
      return existingFile
    }

    const newFile = new SnapshotFile(testPath, this.#options)

    this.#files.add(newFile)
    return newFile
  }

  /**
   * Check if the test has already a saved snapshot
   */
  hasSnapshot(test: Test) {
    return this.getSnapshotFileForTest(test).hasSnapshot(test)
  }

  /**
   * Update the snapshot for a given test
   */
  updateSnapshot(test: Test, value: any) {
    return this.getSnapshotFileForTest(test).updateSnapshot(test, value)
  }

  /**
   * Compare a snapshot for a given test
   */
  compareSnapshot(test: Test, received: any) {
    return this.getSnapshotFileForTest(test).compareSnapshot(test, received)
  }

  /**
   * Returns the data needed for a future assertion
   */
  getSnapshotTestData(test: Test, received: any) {
    return this.getSnapshotFileForTest(test).getSnapshotTestData(test, received)
  }

  /**
   * Save all snapshot files to disk
   */
  async saveSnapshots() {
    await Promise.all([...this.#files].map((file) => file.saveSnapshots()))
  }
}
