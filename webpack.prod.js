const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    optimization: {     /** optimize build plugins */
        runtimeChunk: {
            name: entrypoint => `runtimechunk~${entrypoint.name}`
        },
        splitChunks: {
            cacheGroups: {
                vendor: {
                    name: "node_vendors",
                    test: /[\\/]node_modules[\\/]/,
                    chunks: "all",
                }
            }
        },
        moduleIds: 'deterministic',
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                format: {
                    comments: false,
                },
            },
            extractComments: false,
            parallel: true, /** enable parallel running */
        }),]
    }
});