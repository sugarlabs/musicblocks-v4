import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],

        watch: false,
        globals: true,
        reporters: ['verbose'],

        coverage: {
            provider: 'v8',
            reporter: ['html', 'text', 'text-summary', 'json', 'cobertura'],
            reportsDirectory: './coverage',
        },
    },
});
