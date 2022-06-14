import path from 'path';
import { Configuration } from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';

const prodConfig: Configuration = {
    mode: 'production',
    devtool: 'source-map',
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
    ],
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: '[name].[contenthash].js',
    },
};

export { prodConfig };
