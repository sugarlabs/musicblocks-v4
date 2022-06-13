import * as webpack from 'webpack';
import 'webpack-dev-server';

const devConfig: webpack.Configuration = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    devServer: {
        hot: true,
        open: true,
    },
    plugins: [],
};

export default devConfig;
