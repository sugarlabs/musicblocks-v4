import path from 'path';
import { Configuration } from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import WorkboxPlugin from 'workbox-webpack-plugin';

const BASE_PATH = process.env?.BASE_PATH ?? '/';
const prodConfig: Configuration = {
    mode: 'production',
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    // context prevents the entire `public` folder to be copied
                    // and copies only the contents
                    context: 'public',
                    from: path.join(path.resolve(__dirname, '..', 'public'), '**/*'),
                    globOptions: {
                        ignore: [
                            // Ignore `index.html` as html-webpack-plugin generates one for us
                            '**/*.html',
                        ],
                    },
                },
            ],
        }),
        // gzip compression
        new CompressionPlugin({
            algorithm: 'gzip',
            compressionOptions: {
                level: 9,
            },
            test: /\.js$|\.css$|\.html$/,
            threshold: 50 * 1024,
        }),
        new WorkboxPlugin.GenerateSW({
            // these options encourage the ServiceWorkers to get in there fast
            // and not allow any straggling "old" SWs to hang around
            clientsClaim: true,
            skipWaiting: true,
        }),
    ],
    // output bundle naming convention
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: '[name].[contenthash].js',
        publicPath: BASE_PATH,
        clean: true,
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
};

export { prodConfig };
