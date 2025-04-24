import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // 👈 enables `describe`, `it`, `expect` globally
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
