import * as path from 'path';
import { Configuration, DefinePlugin } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const BASE_PATH = process.env?.BASE_PATH ?? '/';
const commonConfig: Configuration = {
    entry: path.resolve(__dirname, '..', './src/index.ts'),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '..', 'src'),
        },
        extensions: ['.tsx', '.ts', '.js', '.scss', '.sass'],
        fallback: {
            fs: false,
            path: false,
            crypto: false,
        },
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                ],
            },
            {
                test: /.jsonc$/,
                use: [
                    {
                        loader: `jsonc-loader`,
                    },
                ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                    },
                ],
            },
            {
                test: /\.(?:ico)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(gif|jpg|jpeg|png|svg|mp3|ogg|wav|woff(2)?|eot|ttf|otf)$/,
                type: 'asset/inline',
            },
            {
                test: /\.wasm$/,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        // generate html with script tags pointing to bundles
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '..', 'public', 'index.html'),
            // in development BASE_PATH is '/' which makes sure no icons break
            // since requests will be properly made
            publicPath: BASE_PATH,
        }),
        // code split css
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[id].[contenthash].css',
        }),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true,
                },
                mode: 'write-references',
            },
        }),
        /* whenever 'process.env.X' is encountered in code
         * it is replaced as-is with it's value defined here
         * eg, if 'process.env.NODE_ENV' encountered in code
         * it gets replaced by 'development' defined here
         * when webpack dev server is started
         */
        new DefinePlugin({
            'process.env': JSON.stringify({
                NODE_ENV: process.env.NODE_ENV,
                BASE_PATH,
            }),
        }),
    ],
    experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true,
    },
    stats: 'errors-warnings',
};

export { commonConfig };
