const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map', /** generate source map for easy debugging */
    devServer: {
        port: 3000,
        open: true,
        compress: true,
        client: {   /** reconnect to client infinitely */
            reconnect: true,
        }
    },
});