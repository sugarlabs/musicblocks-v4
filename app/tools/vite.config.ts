import path from 'path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteEjsPlugin as ejs } from 'vite-plugin-ejs';
import { VitePWA as pwa } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';
import eslint from 'vite-plugin-eslint';
import { visualizer } from 'rollup-plugin-visualizer';

import { parse as parseJsonc } from 'jsonc-parser';

function resolve(rootPath: string) {
    return path.resolve(__dirname, '..', rootPath);
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        {
            name: 'plugin-jsonc',
            transform(src, id) {
                if (/\.(jsonc)$/.test(id)) {
                    const json = JSON.stringify(parseJsonc(src));
                    return {
                        code: `const content = ${json}; export default content;`,
                        map: null,
                    };
                }
            },
        },

        ejs({
            title: 'Music Blocks',
            description: 'A Musical Microworld',
        }),
        react(),

        pwa({
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            manifest: require(resolve('public/manifest.json')),
            manifestFilename: 'manifest.json',
            registerType: 'autoUpdate',
            workbox: {
                clientsClaim: true,
                skipWaiting: true,
            },
        }),
        compression({
            algorithm: 'gzip',
        }),

        eslint(),
        // this emits bundle data as HTML (required for bundle visualisation)
        visualizer({
            emitFile: true,
            gzipSize: true,
            filename: 'stats.html',
        }),
        // this emits bundle data as JSON (required for bundle assessment)
        visualizer({
            emitFile: true,
            gzipSize: true,
            template: 'raw-data',
        }),
    ],

    resolve: {
        alias: {
            '@': resolve('src'),
            '@res': resolve('../res'),
        },
        extensions: ['.tsx', '.ts', '.js', '.scss', '.sass', '.json'],
    },

    envDir: resolve('env'),

    build: {
        chunkSizeWarningLimit: 1024,
        sourcemap: true,
        rollupOptions: {
            input: {
                'index': resolve('index.html'),
                'lang.en': resolve('../lib/i18n/lang/en.ts'),
                'lang.es': resolve('../lib/i18n/lang/es.ts'),
                'module.menu': resolve('../modules/menu/src/index.ts'),
                'module.editor': resolve('../modules/editor/src/index.ts'),
                'module.painter': resolve('../modules/painter/src/index.ts'),
                'module.singer': resolve('../modules/singer/src/index.ts'),
                'lib.assets': resolve('../lib/assets/index.ts'),
                'lib.config': resolve('../lib/config/index.ts'),
                'lib.i18n': resolve('../lib/i18n/index.ts'),
                'lib.view': resolve('../lib/view/index.ts'),
            },
        },
    },
});
