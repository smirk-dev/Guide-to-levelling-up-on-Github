/// <reference types="vitest/globals" />

// This file provides global type definitions for test files
// It works with Vitest, Jest, and other test runners

declare global {
  // Test runner globals
  const describe: typeof import('vitest')['describe'];
  const it: typeof import('vitest')['it'];
  const test: typeof import('vitest')['test'];
  const expect: typeof import('vitest')['expect'];
  const beforeAll: typeof import('vitest')['beforeAll'];
  const afterAll: typeof import('vitest')['afterAll'];
  const beforeEach: typeof import('vitest')['beforeEach'];
  const afterEach: typeof import('vitest')['afterEach'];
  const vi: typeof import('vitest')['vi'];
}

export {};
