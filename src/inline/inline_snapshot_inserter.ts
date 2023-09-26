import BaseMagicString from 'magic-string'
import { FilePosition, InlineSnapshotData } from '../types/main.js'

const MagicString = BaseMagicString

export class InlineSnapshotInserter {
  /**
   * Given the frame column and line, returns the index in the `code` string
   * to access the character at that position.
   */
  static #getFrameIndex(frame: FilePosition, code: string) {
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
   * Given a string and an index, returns the line number in
   * the string where the index is located.
   */
  static #indexToLineNumber(source: string, index: number) {
    const lines = source.split('\n')
    let line = 0
    let count = 0

    while (line < lines.length && count + lines[line].length < index) {
      count += lines[line].length + 1
      line++
    }

    return line + 1
  }

  static #getSnapshotStart(frame: FilePosition, code: string, matcher: 'expect' | 'assert') {
    const startExpectRegex =
      /(?:toMatchInlineSnapshot)\s*\(\s*(?:\/\*[\S\s]*\*\/\s*|\/\/.*\s+)*\s*[\w_$]*(['"`\)])/m
    const startAssertRegex =
      /(?:matchInline)\s*\(\s*(?:\/\*[\S\s]*\*\/\s*|\/\/.*\s+)*\s*[\w_$]*(['"`\)])/m

    const index = this.#getFrameIndex(frame, code)

    const startMatch = code
      .slice(index)
      .match(matcher === 'expect' ? startExpectRegex : startAssertRegex)

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
   * Generate a snapshot string before inserting them. Try to keep the
   * indentation of the code clean
   */
  static #generateSnapString(snap: string, source: string, index: number) {
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
   * Overwrites the snapshot in the code with the new snapshot
   */
  static #overwriteSnapshot(
    quote: string,
    startIndex: number,
    magicString: BaseMagicString,
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
   * Insert the given snapshot in the code. Returns the modified code
   */
  static insert(code: string, snapshots: InlineSnapshotData[]) {
    const magicString = new MagicString(code)

    for (const snapshot of snapshots) {
      const { frame, value, matcher } = snapshot
      const { frameIndex, startIndex, isEmpty, quote } = this.#getSnapshotStart(
        frame,
        code,
        matcher
      )

      const snapString = this.#generateSnapString(value, code, frameIndex)

      if (isEmpty) {
        magicString.appendRight(startIndex - 1, snapString)
      } else {
        this.#overwriteSnapshot(quote, startIndex, magicString, snapString)
      }
    }

    return {
      hasChanged: magicString.hasChanged(),
      newCode: magicString.toString(),
    }
  }
}
