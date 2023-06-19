import { pathsToModuleNameMapper } from 'ts-jest';

import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
    return {
        preset: 'ts-jest',
        testEnvironment: 'node',
        verbose: true,
        rootDir: './src',
        testPathIgnorePatterns: [`node_modules`],
        moduleNameMapper: {
            ...pathsToModuleNameMapper({
                '@/*': ['./*'],
            }),
        },
    };
};
