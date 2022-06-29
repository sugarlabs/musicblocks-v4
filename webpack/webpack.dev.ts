import { Configuration } from 'webpack';
import ESLintPlugin from 'eslint-webpack-plugin';
import 'webpack-dev-server'; // for devServer key to not error out

const devConfig: Configuration = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    devServer: {
        hot: true,
        open: true,
    },
    plugins: [
        new ESLintPlugin({
            extensions: ['tsx', 'ts', 'jsx', 'js'],
            failOnWarning: true,
        }),
    ],
};

export { devConfig };
