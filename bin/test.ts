import { assert } from '@japa/assert'
import { specReporter } from '@japa/spec-reporter'
import { runFailedTests } from '@japa/run-failed-tests'
import { processCliArgs, configure, run } from '@japa/runner'
import { fileSystem } from '@japa/file-system'
import { snapshot } from '../index'
import { BASE_URL } from '../tests_helpers'

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
configure({
  ...processCliArgs(process.argv.slice(2)),
  files: ['tests/**/*.spec.ts'],
  plugins: [
    snapshot(),
    assert(),
    // runFailedTests(),
    fileSystem({
      basePath: BASE_URL,
      autoClean: true,
    }),
  ],
  reporters: [specReporter()],
  importer: (filePath) => import(filePath),
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
