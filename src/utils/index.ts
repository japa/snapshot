import { Frame } from 'jest-message-util'
import { sep } from 'path'
import { PrettyFormatOptions } from 'pretty-format'
import StackUtils from 'stack-utils'
import { format as prettyFormat } from 'pretty-format'

/**
 * stack utils tries to create pretty stack by making paths relative,
 * so we provide it a fake cwd to avoid that
 */
const stackUtils = new StackUtils({ cwd: 'something which does not exist' })

/**
 * Prepares the expected string by removing unnecessary indentation and whitespace.
 */
export function prepareExpected(expected?: string) {
  function findStartIndent() {
    /**
     * Attempts to find indentation for objects.
     * Matches the ending tag of the object.
     */
    const matchObject = /^( +)}\s+$/m.exec(expected || '')
    const objectIndent = matchObject?.[1]?.length

    if (objectIndent) return objectIndent

    /**
     * Attempts to find indentation for texts.
     * Matches the quote of first line.
     */
    const matchText = /^\n( +)"/.exec(expected || '')
    return matchText?.[1]?.length || 0
  }

  const startIndent = findStartIndent()
  let expectedTrimmed = expected?.trim()

  if (startIndent) {
    expectedTrimmed = expectedTrimmed
      ?.replace(new RegExp(`^${' '.repeat(startIndent)}`, 'gm'), '')
      .replace(/ +}$/, '}')
  }

  return expectedTrimmed
}

/**
 * Escapes backticks in the string
 */
export function escapeBackticks(str: string) {
  return str.replace(/`|\\|\${/g, '\\$&')
}

/**
 * Wraps the string in backticks
 */
export function backticked(str: string) {
  return `\`${escapeBackticks(str)}\``
}

/**
 * Serialize the given snapshot value to a string using pretty-format
 */
export function serializeSnapshotValue(value: any, options: PrettyFormatOptions = {}) {
  return prettyFormat(value, {
    printBasicPrototype: false,
    printFunctionName: false,
    ...options,
  })
}

/**
 * Returns the top frame from the stack trace,
 * ignoring the frames from node_modules and expect-snapshot
 */
const IGNORED_FRAMES = [
  `${sep}node_modules${sep}`,
  `${sep}expect-snapshot${sep}src`,
  `${sep}expect-snapshot${sep}index.ts`,
  `${sep}expect-snapshot${sep}index.js`,
  `${sep}expect-snapshot${sep}build`,
]
export function getTopFrame(lines: string[]) {
  for (const line of lines) {
    if (IGNORED_FRAMES.some((frame) => line.includes(frame))) continue

    const parsedFrame = stackUtils.parseLine(line.trim())
    if (parsedFrame && parsedFrame.file) {
      return parsedFrame as Frame
    }
  }

  return null
}

export function isModuleInstalled(name: string) {
  try {
    require.resolve(name)
    return true
  } catch (e) {
    return false
  }
}
