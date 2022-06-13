import path from 'path';
import * as webpack from 'webpack';

const prodConfig: webpack.Configuration = {
    mode: 'production',
    devtool: 'source-map',
    plugins: [],
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: '[name].[contenthash].js',
    },
};

export default prodConfig;
