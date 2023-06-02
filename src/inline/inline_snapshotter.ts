import { Frame, getStackTraceLines } from 'jest-message-util'
import { getTopFrame, prepareExpected, serializeSnapshotValue } from '../utils'
import { Test } from '@japa/runner'
import { readFile, writeFile } from 'fs/promises'
import dedent from 'dedent'
import { InlineSnapshotData } from '../types/main'
import { InlineSnapshotInserter } from './inline_snapshot_inserter'

export class InlineSnaphotter {
  #snapshotsToSave: InlineSnapshotData[] = []

  /**
   * Get all the files that have snapshots to save
   */
  #getFilesToSave() {
    return new Set(this.#snapshotsToSave.map(({ filePath }) => filePath))
  }

  /**
   * Update a snapshot by saving the new serialized value
   * in memory.
   *
   * Will be persisted to disk when the tests are done.
   */
  updateSnapshot(test: Test, value: string, matcher: 'expect' | 'assert') {
    const error = new Error()
    const lines = getStackTraceLines(error.stack ?? '')

    const frame = getTopFrame(lines)
    if (!frame || !frame.column || !frame.line) {
      throw new Error('Could not find top frame')
    }

    frame.column -= 1

    this.#snapshotsToSave.push({
      frame: frame as Required<Frame>,
      filePath: test.options.meta.fileName,
      value: serializeSnapshotValue(value),
      matcher,
    })
  }

  /**
   * Check if the received value matches the expected snapshot
   */
  compareSnapshot(test: Test, received: any, expected: string) {
    return this.getSnapshotTestData(test, received, expected).pass
  }

  /**
   * Returns the data needed for a future assertion
   */
  getSnapshotTestData(test: Test, received: any, expected: string) {
    const serializedExpected = prepareExpected(dedent(expected))
    const serializedReceived = serializeSnapshotValue(received)

    return {
      snapshotName: test.title,
      expected: serializedExpected,
      received: serializedReceived,
      pass: serializedExpected === serializedReceived,
      inline: true,
    }
  }

  /**
   * Saves all the inline snapshots that were updated during the run.
   * Reads the file contents, updates inline snapshots, then writes the
   * changes back to the file
   *
   * This method should be called after all tests have finished running.
   */
  async saveSnapshots() {
    const files = this.#getFilesToSave()

    for (const filePath of files) {
      const snaps = this.#snapshotsToSave.filter((snapshot) => snapshot.filePath === filePath)
      const code = await readFile(filePath, 'utf-8')

      const { newCode, hasChanged } = InlineSnapshotInserter.insert(code, snaps)

      if (hasChanged) await writeFile(filePath, newCode)
    }
  }
}
