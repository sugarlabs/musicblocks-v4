/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const ESLintPlugin = require('eslint-webpack-plugin');
const { merge } = require('webpack-merge');

const common = require('./webpack.common');

module.exports = merge(common, {
    mode: 'development',
    plugins: [new ESLintPlugin()],
    devtool: 'source-map',
    devServer: {
        hot: true,
        port: 3000,
        client: {
            overlay: true,
            progress: true,
        },
    },
});
