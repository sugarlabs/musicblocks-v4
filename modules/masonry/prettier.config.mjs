import baseConfig from '../../prettier.config.mjs';

/** @type {import("prettier").Config} */
export default {
    ...baseConfig,
    plugins: ['prettier-plugin-tailwindcss'],
};
