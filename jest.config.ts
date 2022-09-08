import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.paths.json';

import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
    return {
        preset: 'ts-jest',
        testEnvironment: 'node',
        verbose: true,
        rootDir: './tests',
        testPathIgnorePatterns: [`node_modules`],
        moduleNameMapper: {
            ...pathsToModuleNameMapper(compilerOptions.paths),
        },
    };
};
