import eslintReact from '@eslint-react/eslint-plugin';
import eslintJs from '@eslint/js';
import eslintJson from '@eslint/json';
import eslintMarkdown from '@eslint/markdown';
import eslintPrettierConfig from 'eslint-config-prettier';
import eslintPrettierPlugin from 'eslint-plugin-prettier';
import eslintReactHooks from 'eslint-plugin-react-hooks';
import eslintReactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import eslintTs from 'typescript-eslint';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig([
    {
        ignores: [
            'src/archive/**/*',
            'src/components/editor-next/**/*',
            '**/dist/**',
            '**/build/**',
            '**/coverage/**',
            '**/.cache/**',
        ],
    },

    {
        files: ['**/*.{js,jsx}'],
        extends: [eslintJs.configs.recommended],
    },

    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            prettier: eslintPrettierPlugin,
        },
        extends: [
            eslintJs.configs.recommended,
            eslintTs.configs.recommended,
            eslintReact.configs['recommended-typescript'],
            eslintReactHooks.configs.flat['recommended-latest'],
        ],
        languageOptions: {
            parser: eslintTs.parser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.browser,
                ...globals.es2025,
                process: 'readonly',
            },
        },
        rules: {
            '@eslint-react/no-missing-key': 'warn',

            'max-len': [
                'warn',
                {
                    code: 100,
                    ignoreTrailingComments: true,
                    ignoreComments: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                },
            ],
            'no-console': isProduction ? 'warn' : 'off',
            'no-debugger': isProduction ? 'warn' : 'off',
            'no-duplicate-case': 'error',
            'no-irregular-whitespace': 'warn',
            'no-mixed-spaces-and-tabs': 'warn',
            'no-trailing-spaces': ['warn', { skipBlankLines: true, ignoreComments: true }],
            'no-unused-vars': 'off',
            'prefer-const': 'off',
            'semi': ['error', 'always'],
            'prettier/prettier': 'warn',

            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            'no-use-before-define': 'off',
            '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
        },
    },

    {
        files: ['**/*.tsx'],
        plugins: {
            'react-refresh': eslintReactRefresh,
        },
        rules: {
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
    },

    // Node.js globals for config and build scripts
    {
        files: ['*.config.{js,ts,tsx}', '*.config.*.{js,ts,tsx}', 'scripts/**/*.{js,ts,tsx}'],
        languageOptions: {
            globals: globals.node,
        },
    },

    // Test files — Vitest globals
    {
        files: ['**/*.spec.{ts,tsx}', '**/*.test.{ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.node,
                suite: 'writable',
                test: 'writable',
                describe: 'writable',
                it: 'writable',
                expectTypeOf: 'writable',
                assertType: 'writable',
                expect: 'writable',
                assert: 'writable',
                vi: 'writable',
                beforeAll: 'writable',
                afterAll: 'writable',
                beforeEach: 'writable',
                afterEach: 'writable',
            },
        },
    },

    {
        files: ['**/*.json'],
        ignores: ['**/package-lock.json'],
        plugins: {
            json: eslintJson,
        },
        language: 'json/json',
        extends: ['json/recommended'],
    },

    {
        files: ['**/*.jsonc', '**/tsconfig.json', '.vscode/*.json'],
        plugins: {
            json: eslintJson,
        },
        language: 'json/jsonc',
        languageOptions: { allowTrailingCommas: true },
        extends: ['json/recommended'],
    },

    {
        files: ['**/*.md'],
        plugins: {
            markdown: eslintMarkdown,
        },
        language: 'markdown/commonmark',
        extends: ['markdown/recommended'],
    },

    // Must be last — disables rules that conflict with Prettier formatting
    eslintPrettierConfig,
]);
