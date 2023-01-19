import type { IAppConfig } from '@/@types/app';
import type { IComponent, IComponentDefinition, TComponentId } from '@/@types/components';
import type { TAsset } from '@/@types/core/assets';

import { loadServiceWorker } from './utils/misc';

import { default as assetManifest } from '@/assets';
import { default as componentMap } from '@/components';

import { getStrings, importStrings } from '@/core/i18n';
import { getAssets, importAssets } from '@/core/assets';
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

async function _importComponents(config?: IAppConfig): Promise<{
    components: Partial<Record<TComponentId, IComponent>>;
    componentDefinitions: Partial<Record<TComponentId, IComponentDefinition>>;
}> {
    /** Map of component identifier and corresponding component module. */
    let components: Partial<Record<TComponentId, IComponent>>;
    /** List of 2-tuples of component identifier and component definition. */
    let componentDefinitions: Partial<Record<TComponentId, IComponentDefinition>>;

    {
        const componentIds = (
            config !== undefined
                ? Object.entries(componentMap)
                      .filter(([id]) =>
                          config.components.map(({ id }) => id).includes(id as TComponentId),
                      )
                      .map(([id]) => id)
                : Object.keys(componentMap)
        ) as TComponentId[];

        const callback =
            config !== undefined
                ? (componentId: TComponentId) =>
                      updateImportMap('import', 'components', componentId)
                : () => 1;

        components = await importComponents(componentIds, callback);

        componentDefinitions = Object.fromEntries(
            (Object.entries(components) as [TComponentId, IComponent][]).map(([id, component]) => [
                id,
                component.definition,
            ]) as [TComponentId, IComponentDefinition][],
        );
    }

    return {
        components,
        componentDefinitions,
    };
}

// -------------------------------------------------------------------------------------------------

async function init(config: IAppConfig) {
    /*
     * Import and load i18n strings for the configured language asynchronously.
     */

    {
        await importStrings(config.env.lang);
        updateImportMap('import', 'lang');
    }

    /** Map of component identifier and corresponding component module. */
    let components: Partial<Record<TComponentId, IComponent>>;
    /** List of 2-tuples of component identifier and component definition. */
    let componentDefinitionEntries: [TComponentId, IComponentDefinition][];

    /*
     * Import components asynchronously.
     */

    {
        const _components = await _importComponents(config);
        components = _components.components;
        componentDefinitionEntries = Object.entries(_components.componentDefinitions) as [
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
     * Inject items into component modules.
     */

    {
        // Inject i18n strings.
        componentDefinitionEntries.forEach(
            ([id, { strings }]) =>
                (components[id]!.injected.i18n =
                    Object.keys(strings).length !== 0
                        ? getStrings(Object.keys(strings))
                        : undefined),
        );

        // Inject asset entries.
        componentDefinitionEntries.forEach(
            ([id, { assets }]) =>
                (components[id]!.injected.assets =
                    assets !== undefined
                        ? (getAssets(assets) as { [identifier: string]: TAsset })
                        : undefined),
        );

        // Inject feature flags.
        componentDefinitionEntries.forEach(
            ([componentId]) =>
                (components[componentId]!.injected.flags = config.components.find(
                    ({ id }) => id === componentId,
                    // @ts-ignore
                )?.flags),
        );
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
                    // @ts-ignore
                    filter: config.components.find(({ id }) => id === componentId)?.elements,
                };
            }),
        );

        // Mount components in serialized order
        await mountComponents(componentsOrdered, (componentId) =>
            updateImportMap('mount', 'components', componentId),
        );

        // Initialize components in serialized order
        await setupComponents(componentsOrdered, (componentId) =>
            updateImportMap('setup', 'components', componentId),
        );
    }

    if (import.meta.env.PROD) {
        loadServiceWorker();
    }
}

// =================================================================================================

(async function () {
    // load configuration preset file
    const config = await loadConfig(import.meta.env.VITE_CONFIG_PRESET);

    /**
     * if PRODUCTION mode, proceed initializing with configuration preset.
     */

    if (import.meta.env.PROD) {
        await init(config);
        return;
    }

    /**
     * if DEVELOPMENT mode, and configuration in session storage,
     * proceed initializing with configuration from session storage.
     */

    {
        const config = window.sessionStorage.getItem('appConfig');

        if (config !== null) {
            await init(JSON.parse(config) as IAppConfig);
            return;
        }
    }

    /**
     * if DEVELOPMENT mode, and configuration not in session storage,
     * open configurator page.
     * @todo currently needs refresh to go to main app page
     */

    {
        const { mountConfigPage, updateConfigPage } = await import('@/core/view');

        requestAnimationFrame(() => {
            (async function () {
                window.sessionStorage.setItem('appConfig', JSON.stringify(config));

                await mountConfigPage(
                    { ...config },
                    (
                        await _importComponents()
                    ).componentDefinitions,
                    (config: IAppConfig) =>
                        requestAnimationFrame(() => {
                            window.sessionStorage.setItem('appConfig', JSON.stringify(config));
                            updateConfigPage(config);
                        }),
                );
            })();
        });
    }
})();
