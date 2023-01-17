import type { IAppConfig, IAppComponentConfig } from '@/@types/app';
import type { IComponent, IComponentDefinition, TComponentId } from '@/@types/components';

import { loadServiceWorker } from './utils/misc';

import { default as assetManifest } from '@/assets';
import { default as componentMap } from '@/components';

import { importStrings } from '@/core/i18n';
import { importAssets } from '@/core/assets';
import {
    importComponents,
    mountComponents,
    setupComponents,
    registerElements,
    serializeComponentDependencies,
} from '@/core/config';

// -------------------------------------------------------------------------------------------------

const loadMap: {
    lang: boolean;
    assets: Record<string, boolean>;
    components: Partial<Record<TComponentId, boolean>>;
} = {
    lang: false,
    assets: {},
    components: {},
};

// -------------------------------------------------------------------------------------------------

async function loadConfig(preset: number): Promise<IAppConfig> {
    return (await import(`./config/preset-${preset}.ts`)).default;
}

function updateImportMap(stage: 'import', item: 'lang'): typeof loadMap;
function updateImportMap(stage: 'import', item: 'assets', subitem: string): typeof loadMap;
function updateImportMap(
    stage: 'import' | 'mount' | 'setup',
    item: 'components',
    subitem: TComponentId,
): typeof loadMap;
function updateImportMap(
    stage: 'import' | 'mount' | 'setup',
    item: keyof typeof loadMap,
    subitem?: string,
): typeof loadMap {
    if (item === 'lang') {
        loadMap.lang = true;
    } else if (item === 'assets') {
        loadMap.assets[subitem as string] = true;
    } else if (item === 'components') {
        loadMap.components[subitem as TComponentId] = true;
    }

    // if (import.meta.env.DEV) console.log(`${stage}: ${item}${subitem ? ` > ${subitem}` : ''}`);

    return loadMap;
}

// =================================================================================================

(async () => {
    // load configuration preset file
    const config = await loadConfig(import.meta.env.VITE_CONFIG_PRESET);

    const components = config.components.map((component) =>
        typeof component === 'string' ? { id: component } : component,
    ) as IAppComponentConfig[];

    /*
     * Import and load i18n strings for the configured language asynchronously.
     */

    {
        await importStrings(config.env.lang);
        updateImportMap('import', 'lang');
    }

    /** List of 2-tuples of component identifier and component definition. */
    let componentDefinitionEntries: [TComponentId, IComponentDefinition][];

    /*
     * Import components asynchronously.
     */

    {
        const _components = await importComponents(
            (import.meta.env.PROD
                ? Object.entries(componentMap)
                      .filter(([id]) => components.map(({ id }) => id).includes(id as TComponentId))
                      .map(([id]) => id)
                : Object.keys(componentMap)) as TComponentId[],
            (componentId: TComponentId) => updateImportMap('import', 'components', componentId),
        );

        componentDefinitionEntries = (
            Object.entries(_components) as [TComponentId, IComponent][]
        ).map(([id, component]) => [id, component.definition]) as [
            TComponentId,
            IComponentDefinition,
        ][];
    }

    /**
     * Import assets as defined by each component asynchronously.
     */

    {
        try {
            await importAssets(
                (
                    componentDefinitionEntries
                        .map(([_, { assets }]) => assets)
                        .filter((assets) => assets !== undefined) as string[][]
                )
                    .reduce((a, b) => [...new Set([...a, ...b])])
                    .map((assetId) => ({ identifier: assetId, manifest: assetManifest[assetId] })),
                (assetId: string) => updateImportMap('import', 'assets', assetId),
            );
        } catch (e) {
            // do nothing
        }
    }

    /**
     * Serialized list of component identifiers in which the dependent components take precedence.
     */
    let componentsOrdered: TComponentId[];

    /*
     * Generate serialized list of component identifiers
     */

    {
        componentsOrdered = serializeComponentDependencies(
            componentDefinitionEntries
                .map<[TComponentId, TComponentId[]]>(([id, { dependencies }]) => [
                    id,
                    [...new Set([...dependencies.optional, ...dependencies.required])],
                ])
                .map(([id, dependencies]) => ({ id, dependencies })),
        );
    }

    /**
     * Initializes the application.
     */

    {
        // Initialize view toolkit
        const { setView } = await import('@/core/view');
        setView('main');

        // Register syntax elements as configured for each component
        registerElements(
            componentsOrdered.map((componentId) => {
                return {
                    id: componentId,
                    filter: import.meta.env.PROD
                        ? components.find(({ id }) => id === componentId)?.elements
                        : true,
                };
            }),
        );

        // Mount components in serialized order
        await mountComponents(
            componentsOrdered.map((componentId) => [
                componentId,
                import.meta.env.PROD
                    ? components.find(({ id }) => id === componentId)?.flags
                    : componentDefinitionEntries.find(([id]) => id === 'menu')![1].flags,
            ]),
            (componentId) => updateImportMap('mount', 'components', componentId),
        );

        // Initialize components in serialized order
        await setupComponents(componentsOrdered, (componentId) =>
            updateImportMap('setup', 'components', componentId),
        );
    }

    if (import.meta.env.PROD) {
        loadServiceWorker();
    }
})();
