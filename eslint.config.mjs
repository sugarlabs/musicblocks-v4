import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import jsonPlugin from 'eslint-plugin-json';
import { defineConfig } from 'eslint/config';

export default defineConfig(
    {
        ignores: [
            '**/dist/**',
            'src/archive/**/*',
            'src/components/editor-next/**/*',
        ],
    },

    {
        files: ['**/*.{js,mjs,cjs,ts,tsx}'],
        extends: [js.configs.recommended, prettierConfig],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.es2021,
            },
        },
        plugins: {
            'react-refresh': reactRefreshPlugin,
            prettier: prettierPlugin,
        },
        rules: {
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
            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-duplicate-case': 'error',
            'no-irregular-whitespace': 'warn',
            'no-mixed-spaces-and-tabs': 'warn',
            'no-trailing-spaces': ['warn', { skipBlankLines: true, ignoreComments: true }],
            'no-unused-vars': 'off',
            'prefer-const': 'off',
            semi: ['error', 'always'],
            'prettier/prettier': 'warn',
        },
    },

    reactHooksPlugin.configs.flat['recommended-latest'],

    {
        rules: {
            'react-hooks/set-state-in-effect': 'warn',
        },
    },

    {
        files: ['**/*.ts', '**/*.tsx'],
        extends: [tseslint.configs.recommended],
        rules: {
            'prefer-const': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            'no-use-before-define': 'off',
            '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
        },
    },

    jsonPlugin.configs.recommended,

    {
        files: ['**/*.json'],
        rules: {
            'prettier/prettier': 'off',
        },
    },

    {
        files: ['**/*.spec.ts', '**/*.test.ts'],
        languageOptions: {
            globals: {
                suite: 'writable',
                test: 'writable',
                describe: 'writable',
                it: 'writable',
                expectTypeOf: 'writable',
                assertType: 'writable',
                expect: 'writable',
                assert: 'writable',
                vitest: 'writable',
                vi: 'writable',
                beforeAll: 'writable',
                afterAll: 'writable',
                beforeEach: 'writable',
                afterEach: 'writable',
            },
        },
    },
);
