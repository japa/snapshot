import { assert } from '@japa/assert'
import { expect } from '@japa/expect'
import { configure, processCLIArgs, run } from '@japa/runner'
import { fileSystem } from '@japa/file-system'
import { snapshot } from '../index.js'
import { BASE_URL } from '../tests_helpers/index.js'

/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/
processCLIArgs(process.argv.slice(2))
configure({
  files: ['tests/**/*.spec.ts'],
  plugins: [
    snapshot(),
    assert(),
    expect(),
    fileSystem({
      basePath: BASE_URL,
      autoClean: true,
    }),
  ],
})

/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/
run()
