import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'node',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules', '.next', '**/*.config.*', '**/*.d.ts'],
    },
  },
})
