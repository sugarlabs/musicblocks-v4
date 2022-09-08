import { Configuration } from 'webpack';
import 'webpack-dev-server'; // for devServer key to not error out

const devConfig: Configuration = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    devServer: {
        hot: true,
        open: true,
    },
    plugins: [],
};

export { devConfig };
