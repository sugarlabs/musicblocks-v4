export type SizeKey = 'renderedLength' | 'gzipLength' | 'brotliLength';

export type ModuleUID = string;
export type BundleId = string;

export interface ModuleTreeLeaf {
    name: string;
    uid: ModuleUID;
}

export interface ModuleTree {
    name: string;
    children: Array<ModuleTree | ModuleTreeLeaf>;
}

export type ModulePart = {
    metaUid: ModuleUID;
} & ModuleLengths;

export type ModuleImport = {
    uid: ModuleUID;
    dynamic?: boolean;
};

export type ModuleMeta = {
    moduleParts: Record<BundleId, ModuleUID>;
    importedBy: ModuleImport[];
    imported: ModuleImport[];
    isEntry?: boolean;
    isExternal?: boolean;
    id: string;
};

export interface ModuleLengths {
    renderedLength: number;
    gzipLength: number;
    brotliLength: number;
}

export interface VisualizerData {
    version: number;
    tree: ModuleTree;
    nodeParts: Record<ModuleUID, ModulePart>;
    nodeMetas: Record<ModuleUID, ModuleMeta>;
    env: {
        [key: string]: unknown;
    };
    options: {
        gzip: boolean;
        brotli: boolean;
        sourcemap: boolean;
    };
}

// -------------------------------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import process from 'process';

export function getStats(data: VisualizerData): {
    i18n: Record<string, number>;
    assets: Record<string, number>;
    modules: Record<string, number>;
} {
    function _getSizeModules() {
        const modules = data.tree.children
            .filter(({ name }) => name.indexOf('assets/module.') !== -1)
            .map(({ name }) => name);

        const mapPart: {
            [module: string]: string[];
        } = Object.fromEntries(modules.map((module) => [module, []]));

        modules.forEach((module) => {
            mapPart[module] = Object.values(data.nodeMetas)
                .filter(({ moduleParts }) => module in moduleParts)
                .map(({ moduleParts }) => moduleParts)
                .map((item) => Object.values(item)[0]);
        });

        const mapPartSize: {
            [module: string]: number[];
        } = Object.fromEntries(
            Object.entries(mapPart).map(([module, parts]) => [
                module,
                parts.map(
                    (part) => Object.fromEntries(Object.entries(data.nodeParts))[part].gzipLength,
                ),
            ]),
        );

        const mapSize: {
            [module: string]: number;
        } = Object.fromEntries(
            Object.entries(mapPartSize).map(([module, sizes]) => [
                module,
                sizes.reduce((a, b) => a + b),
            ]),
        );

        return Object.fromEntries(
            Object.entries(mapSize).map(([module, size]) => [
                module.split('-')[0].replace('assets/module.', ''),
                size,
            ]),
        );
    }

    const _getSizeFiles = (prefix: string): [string, number][] => {
        return Object.values(data.nodeMetas)
            .filter(({ id }) => id.startsWith(prefix))
            .map<[string, number]>(({ id, moduleParts }) => [
                id.replace(new RegExp(`${prefix}`, 'g'), ''),
                Object.values(moduleParts)
                    .map((moduleId) => data.nodeParts[moduleId].gzipLength)
                    .reduce((a, b) => a + b),
            ]);
    };

    const _getSizeI18n = (): Record<string, number> => {
        return Object.fromEntries(
            _getSizeFiles('/src/core/i18n/lang/').map(([file, size]) => [
                file.replace('.ts', ''),
                size,
            ]),
        );
    };

    const _getSizeAssets = (): Record<string, number> => {
        return Object.fromEntries(
            _getSizeFiles('/src/assets/').filter(([file]) => !file.endsWith('.ts')),
        );
    };

    return {
        i18n: _getSizeI18n(),
        assets: _getSizeAssets(),
        modules: _getSizeModules(),
    };
}

// -------------------------------------------------------------------------------------------------

{
    const root = process.cwd();

    fs.writeFileSync(
        path.resolve(root, 'dist', 'stats.json'),
        JSON.stringify(
            getStats(
                JSON.parse(fs.readFileSync(path.resolve(root, 'dist', 'stats.json'), 'utf-8')),
            ),
        ),
    );
}
