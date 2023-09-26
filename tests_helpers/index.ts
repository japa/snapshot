import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Test, Emitter, Refiner } from '@japa/runner/core'

export const BASE_URL = join(dirname(fileURLToPath(import.meta.url)), '..', 'tests', '__app')

/**
 * Create a new test instance for testing purposes
 */
export function testFactory({ title, fileName }: { title: string; fileName?: string }) {
  const test = new Test(title, {} as any, new Emitter(), new Refiner())
  if (fileName) {
    test.options.meta.fileName = join(BASE_URL, fileName)
  }

  return test
}

/**
 * Join path from BASE_URL
 */
export function fsJoin(path: string) {
  return join(BASE_URL, path)
}
