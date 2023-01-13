import type { VisualizerData } from './types';
export type { VisualizerData } from './types';

export function getStats(data: VisualizerData, extract: string[]) {
    const modules = data.tree.children
        .filter(
            ({ name }) =>
                extract
                    .map((prefix) => `assets/${prefix}.`)
                    .map((partial) => name.indexOf(partial))
                    .filter((index) => index !== -1).length !== 0,
        )
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
            module.split('-')[0].replace('assets/', ''),
            size,
        ]),
    );
}
