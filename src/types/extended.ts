import { expectSnapshot } from '../snapshot'

declare module '@japa/runner' {
  interface TestContext {
    snapshot: ReturnType<typeof expectSnapshot>
  }
}
