module.exports = {
    root: true,
    env: {
        node: true,
        es2021: true,
    },

    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },

    plugins: ['react-refresh', 'prettier'],

    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'prettier',
    ],

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
        'no-trailing-spaces': [
            'warn',
            {
                skipBlankLines: true,
                ignoreComments: true,
            },
        ],
        'no-unused-vars': 'off',

        'prefer-const': ['off'],
        'semi': ['error', 'always'],

        'prettier/prettier': 'warn',
    },

    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            rules: {
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

        {
            files: ['**/*.json'],

            extends: ['plugin:json/recommended'],

            rules: {
                'prettier/prettier': 'off',
            },
        },

        {
            files: ['**/*.spec.ts', '**/*.test.ts'],

            globals: {
                suite: true,
                test: true,
                describe: true,
                it: true,
                expectTypeOf: true,
                assertType: true,
                expect: true,
                assert: true,
                vitest: true,
                vi: true,
                beforeAll: true,
                afterAll: true,
                beforeEach: true,
                afterEach: true,
            },
        },
    ],
};
