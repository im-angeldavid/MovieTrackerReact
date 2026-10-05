import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// src/lib/tmdb.ts reads this at call time, so tests can override it per case.
vi.stubEnv('VITE_TMDB_ACCESS_TOKEN', 'test-token')

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})