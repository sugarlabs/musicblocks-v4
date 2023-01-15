import type { VisualizerData } from './stats';

import path from 'path';
import fs from 'fs';

import { build } from 'vite';
import { parse } from 'node-html-parser';

import { getStats } from './stats';

export default async function (root: string, config: string, base: string) {
    await build({
        root,
        configFile: config,
        base,
    });

    const statsPath = path.resolve(root, 'dist', 'stats.html');

    const data = eval(`
        (
            function () {
                ${
                    parse(fs.readFileSync(statsPath, 'utf-8'))
                        .getElementsByTagName('script')[1]
                        .innerHTML.match(/const data = {(.+)};/g)
                        ?.toString() as string
                }
                return data;
            }
        )()
    `) as VisualizerData;

    const stats = getStats(data, ['lang', 'module']);

    fs.writeFileSync(path.resolve(root, 'dist', 'stats.json'), JSON.stringify(stats));
}
