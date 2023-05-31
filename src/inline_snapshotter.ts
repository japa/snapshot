import { Frame, getStackTraceLines } from 'jest-message-util'
import { getTopFrame, prepareExpected, serializeSnapshotValue } from './utils'
import MagicString from 'magic-string'
import { Test } from '@japa/runner'
import { readFile, writeFile } from 'fs/promises'
import dedent from 'dedent'

export class InlineSnaphotter {
  #snapshotsToSave: {
    frame: Frame
    filePath: string
    value: string
  }[] = []

  /**
   * Convert an index from the source code to a line number
   */
  #indexToLineNumber(source: string, index: number) {
    const lines = source.split('\n')
    let line = 0
    let count = 0

    while (line < lines.length && count + lines[line].length < index) {
      count += lines[line].length + 1
      line++
    }

    return line + 1
  }

  /**
   * Generate the inline snapshot before inserting it into the file
   */
  #generateSnapString(snap: string, source: string, index: number) {
    const lineNumber = this.#indexToLineNumber(source, index)
    const line = source.split('\n')[lineNumber - 1]

    const indent = line.match(/^\s*/)![0] || ''
    const indentNext = indent.includes('\t') ? `${indent}\t` : `${indent}  `

    const lines = snap.trim().replace(/\\/g, '\\\\').split(/\n/g)

    const isOneline = lines.length <= 1
    const quote = isOneline ? "'" : '`'
    if (isOneline) return `'${lines.join('\n').replace(/'/g, "\\'")}'`

    return `${quote}\n${lines
      .map((i) => (i ? indentNext + i : ''))
      .join('\n')
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${')}\n${indent}${quote}`
  }

  /**
   * Given the frame column and line, returns the index in the `code` string
   * to access the character at that position.
   */
  #getFrameIndex(frame: { column: number; line: number }, code: string) {
    const lines = code.split('\n')
    let start = 0

    if (frame.line > lines.length) {
      return code.length
    }

    for (let i = 0; i < frame.line - 1; i++) {
      start += lines[i].length + 1
    }

    return start + frame.column
  }

  /**
   * Get all the files that have snapshots to save
   */
  #getFilesToSave() {
    return new Set(this.#snapshotsToSave.map(({ filePath }) => filePath))
  }

  /**
   * Overwrites the existing snapshot with the new snapshot string.
   */
  #overwriteSnapshot(
    quote: string,
    startIndex: number,
    magicString: MagicString,
    snapString: string
  ) {
    const quoteEndRE = new RegExp(`(?:^|[^\\\\])${quote}`)
    const endMatch = magicString.original.slice(startIndex).match(quoteEndRE)
    if (!endMatch) {
      throw new Error('Could not find end of snapshot')
    }

    const endIndex = startIndex + endMatch.index! + endMatch[0].length
    magicString.overwrite(startIndex - 1, endIndex, snapString)
  }

  /**
   * Given a frame and the source code, returns information about the start of the snapshot.
   */
  #getSnapshotStartInfo(frame: Frame, code: string) {
    const startRegex =
      /(?:toMatchInlineSnapshot)\s*\(\s*(?:\/\*[\S\s]*\*\/\s*|\/\/.*\s+)*\s*[\w_$]*(['"`\)])/m
    const index = this.#getFrameIndex(frame as Required<Frame>, code)

    const startMatch = code.slice(index).match(startRegex)
    if (!startMatch) {
      throw new Error('Could not find start of snapshot')
    }

    return {
      frameIndex: index,
      startIndex: index + startMatch.index! + startMatch[0].length,
      isEmpty: startMatch[1] === ')',
      quote: startMatch[1],
    }
  }

  /**
   * Update a snapshot by saving the new serialized value
   * in memory.
   *
   * Will be persisted to disk when the tests are done.
   */
  updateSnapshot(test: Test, value: string) {
    const error = new Error()
    const lines = getStackTraceLines(error.stack ?? '')

    const frame = getTopFrame(lines)
    if (!frame || !frame.column || !frame.line) {
      throw new Error('Could not find top frame')
    }

    frame.column -= 1

    this.#snapshotsToSave.push({
      frame,
      filePath: test.options.meta.fileName,
      value: serializeSnapshotValue(value),
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
      const magicString = new MagicString(code)

      for (const { value, frame } of snaps) {
        const { frameIndex, startIndex, isEmpty, quote } = this.#getSnapshotStartInfo(frame, code)
        const snapString = this.#generateSnapString(value, code, frameIndex)

        if (isEmpty) {
          magicString.appendRight(startIndex - 1, snapString)
        } else {
          this.#overwriteSnapshot(quote, startIndex, magicString, snapString)
        }
      }

      if (magicString.hasChanged()) {
        await writeFile(filePath, magicString.toString())
      }
    }
  }
}
