import path from 'path';
import fs from 'fs';

import { build } from 'vite';

import { getStats } from './stats';

export default async function (root: string, config: string, base: string) {
    await build({
        root,
        configFile: config,
        base,
    });

    fs.writeFileSync(
        path.resolve(root, 'dist', 'stats.json'),
        JSON.stringify(
            getStats(
                JSON.parse(fs.readFileSync(path.resolve(root, 'dist', 'stats.json'), 'utf-8')),
            ),
        ),
    );
}
