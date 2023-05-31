import { Test } from '@japa/runner'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { backticked, prepareExpected, serializeSnapshotValue } from './utils'
import { SnapshotPluginOptions } from './types/main'

export class SnapshotFile {
  /**
   * List of snapshots that will be saved/updated at the end of the tests
   */
  #snapshotsToSave: {
    key: string
    value: string
  }[] = []

  /**
   * Path to the snapshot file
   */
  #snapshotPath: string

  /**
   * Path to the test file linked to this snapshot file
   */
  #testPath: string

  /**
   * Cached content of the snapshot file.
   */
  #cachedContent: Record<string, any> | null = null

  /**
   * Snapshot plugin options
   */
  #options: SnapshotPluginOptions

  constructor(testPath: string, options: SnapshotPluginOptions = {}) {
    this.#testPath = testPath
    this.#options = options
    this.#snapshotPath = this.#resolveSnapshotPath()
    this.#readSnapshotFile()
  }

  /**
   * Resolve the snapshot path for the given test
   */
  #resolveSnapshotPath() {
    if (this.#options.resolveSnapshotPath) {
      return this.#options.resolveSnapshotPath(this.#testPath)
    }

    const testDir = dirname(this.#testPath)
    const snapshotFileName = `${basename(this.#testPath)}.cjs`

    return join(testDir, '__snapshots__', snapshotFileName)
  }

  /**
   * Create the directory where the snapshot file will be saved
   */
  async #prepareDirectory() {
    if (!existsSync(dirname(this.#snapshotPath))) {
      await mkdir(dirname(this.#snapshotPath), { recursive: true })
    }
  }

  /**
   * Read the snapshot file from disk
   */
  #readSnapshotFile() {
    const isFileExist = existsSync(this.#snapshotPath)
    if (!isFileExist) {
      return null
    }

    const fileContent = readFileSync(this.#snapshotPath, 'utf-8')

    const data = Object.create(null)
    let snapshotContents = ''

    try {
      snapshotContents = fileContent
      const populate = new Function('exports', snapshotContents)
      populate(data)
    } catch {}

    this.#cachedContent = data
    return data
  }

  /**
   * Path to the test file linked to this snapshot file
   */
  getTestPath() {
    return this.#testPath
  }

  /**
   * Path to the snapshot file
   */
  getSnapshotPath() {
    return this.#snapshotPath
  }

  /**
   * Generate a name for the named export for the given test
   */
  getSnapshotName(test: Test) {
    let exportName: string = ''

    if (test.parent) {
      exportName += test.parent?.title
    }

    exportName += exportName ? ` > ${test.title}` : test.title
    return exportName
  }

  /**
   * Check if the given test hasn't a snapshot saved yet
   */
  hasSnapshot(test: Test) {
    const exportName = this.getSnapshotName(test)

    if (!this.#cachedContent) {
      return true
    }

    return this.#cachedContent[exportName] === undefined
  }

  /**
   * Update a snapshot by saving the new serialized value
   * in memory.
   *
   * Will be persisted to disk when the tests are done.
   */
  async updateSnapshot(test: Test, value: any) {
    const exportName = this.getSnapshotName(test)

    const key = exportName
    const serializedValue = serializeSnapshotValue(value, this.#options.prettyFormatOptions)

    this.#snapshotsToSave.push({
      key: key,
      value: serializedValue,
    })
  }

  /**
   * Compare the value with the snapshot of the given test
   */
  compareSnapshot(test: Test, value: any) {
    return this.getSnapshotTestData(test, value).pass
  }

  /**
   * Returns the data needed for a future assertion
   */
  getSnapshotTestData(test: Test, value: any) {
    const snapshotName = this.getSnapshotName(test)

    if (!this.#cachedContent) {
      throw new Error(`Snapshot file ${this.#snapshotPath} not found`)
    }

    const expected = prepareExpected(this.#cachedContent[snapshotName])
    const received = serializeSnapshotValue(value, this.#options.prettyFormatOptions)

    return {
      snapshotName,
      expected: prepareExpected(this.#cachedContent[snapshotName]),
      received: serializeSnapshotValue(received, this.#options.prettyFormatOptions),
      pass: expected === received,
    }
  }

  /**
   * Save the snapshot file to disk
   */
  async saveSnapshots() {
    const content = this.#cachedContent || {}

    for (const snapshot of this.#snapshotsToSave) {
      content[snapshot.key] = snapshot.value
    }

    let finalFile = ''
    for (const values of Object.entries(content)) {
      const key = backticked(values[0])
      const value = backticked(values[1])

      let serializedExport = `exports[${key}] = ${value}`
      finalFile += serializedExport + '\n\n'
    }

    await this.#prepareDirectory()
    await writeFile(this.#snapshotPath, finalFile)
  }
}
