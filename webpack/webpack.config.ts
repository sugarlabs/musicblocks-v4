import { merge } from 'webpack-merge';
import { Configuration } from 'webpack';
import { commonConfig } from './webpack.common';
import { devConfig } from './webpack.dev';
import { prodConfig } from './webpack.prod';

/**
 * webpack config
 * @param envVars - the environment passed with --env flag in npm script
 * @returns final merged webpack config
 */
const config = (envVars: { env: string }): Configuration => {
    const { env } = envVars;
    switch (env) {
        case 'dev':
            return merge(commonConfig, devConfig);
        case 'prod':
            return merge(commonConfig, prodConfig);
        default:
            throw new Error('No matching environment');
    }
};

export default config;
