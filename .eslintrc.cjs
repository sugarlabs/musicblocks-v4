/* eslint-env node */

module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:jsonc/recommended-with-jsonc',
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
        'no-console': 'off',
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
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            },
        ],
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
        '@typescript-eslint/no-non-null-assertion': 'off',
        'prefer-const': 'off',
        'semi': ['error', 'always'],
    },
    overrides: [
        {
            files: ['*.json', '*.json5', '*.jsonc'],
            parser: 'jsonc-eslint-parser',
        },
        {
            files: ['*.vue'],
            env: {
                'vue/setup-compiler-macros': true,
            },
            parser: 'vue-eslint-parser',
            parserOptions: {
                vueFeatures: {
                    filter: true,
                    interpolationAsNonHTML: false,
                },
            },
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended',
                'plugin:vue/vue3-essential',
                '@vue/eslint-config-typescript/recommended',
                '@vue/eslint-config-prettier',
                'plugin:prettier-vue/recommended',
            ],
            rules: {
                'vue/max-len': [
                    'warn',
                    {
                        code: 100,
                        template: 100,
                        tabWidth: 2,
                        comments: 100,
                        ignorePattern: '',
                        ignoreComments: true,
                        ignoreTrailingComments: true,
                        ignoreUrls: true,
                        ignoreStrings: true,
                        ignoreTemplateLiterals: true,
                        ignoreRegExpLiterals: true,
                        ignoreHTMLAttributeValues: true,
                        ignoreHTMLTextContents: true,
                    },
                ],
                'semi': 'error',

                'prettier/prettier': 'off',
                'prettier-vue/prettier': [
                    'warn',
                    {
                        printWidth: 100,
                        tabWidth: 2,
                    },
                ],
            },
            settings: {
                'prettier-vue': {
                    SFCBlocks: {
                        template: false,
                        script: true,
                        style: false,
                    },
                    usePrettierrc: true,
                },
            },
        },
    ],
};
