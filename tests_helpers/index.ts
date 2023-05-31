import { join } from 'node:path'
import { Emitter, Refiner } from '@japa/core'
import { Test } from '@japa/runner'

export const BASE_URL = join(__dirname, '..', 'tests', '__app')

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

/**
 * Require a fresh module by deleting it from the cache first
 *
 * Will not works after ESM migration
 * But keeping it for now for simplicity
 */
export function importUncached(module: string) {
  delete require.cache[require.resolve(module)]

  return import(module)
}
