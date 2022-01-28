const path = require(`path`);
const CracoAlias = require('craco-alias');

module.exports = {
    webpack: {
        alias: {
            '@/': path.resolve(__dirname, 'src/'),
        },
    },
    plugins: [
        {
            plugin: CracoAlias,
            options: {
                source: 'tsconfig',
                // baseUrl SHOULD be specified
                // plugin does not take it from tsconfig
                baseUrl: './src',
                // tsConfigPath should point to the file where "baseUrl" and "paths" are specified
                tsConfigPath: './tsconfig.paths.json',
            },
        },
    ],
};
