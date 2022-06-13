import path from 'path';
import { Configuration } from 'webpack';

const prodConfig: Configuration = {
    mode: 'production',
    devtool: 'source-map',
    plugins: [],
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: '[name].[contenthash].js',
    },
};

export { prodConfig };
