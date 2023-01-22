import type { IAppConfig } from '@/@types/app';
import type { IComponent, IComponentDefinition, TComponentId } from '@/@types/components';
import type { TAsset } from '@/@types/core/assets';

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
    const componentManifest = (await import('@/components')).default;

    const componentIdsEnabled: TComponentId[] =
        config === undefined
            ? (Object.keys(componentManifest) as TComponentId[])
            : config.components.map(({ id }) => id);

    /** List of 2-tuples of component identifier and component definition. */
    let componentDefinitions: Record<TComponentId, IComponentDefinition> = Object.fromEntries(
        Object.entries(componentManifest)
            .filter(([componentId]) => componentIdsEnabled.includes(componentId as TComponentId))
            .map(([componentId, { definition }]) => [componentId, definition]),
    ) as Record<TComponentId, IComponentDefinition>;

    /** Map of component identifier and corresponding component module. */
    let components: Partial<Record<TComponentId, IComponent>>;

    {
        const componentIds = (
            config !== undefined
                ? Object.entries(componentManifest)
                      .filter(([id]) =>
                          config.components.map(({ id }) => id).includes(id as TComponentId),
                      )
                      .map(([id]) => id)
                : Object.keys(componentManifest)
        ) as TComponentId[];

        const callback =
            config !== undefined
                ? (componentId: TComponentId) =>
                      updateImportMap('import', 'components', componentId)
                : () => 1;

        const { importComponents } = await import('@/core/config');
        components = await importComponents(componentIds, componentManifest, callback);
    }

    return {
        components,
        componentDefinitions,
    };
}

// -------------------------------------------------------------------------------------------------

async function init(config?: IAppConfig) {
    if (config === undefined) {
        config = await loadConfig(import.meta.env.VITE_CONFIG_PRESET);
    }

    const { importStrings, getStrings } = await import('@/core/i18n');
    const { importAssets, getAssets } = await import('@/core/assets');
    const assetManifest = (await import('@/assets')).default;

    /*
     * Import and load i18n strings for the configured language asynchronously.
     */

    {
        await importStrings(config.env.lang);
        updateImportMap('import', 'lang');
    }

    /*
     * Initializes the application view.
     */

    {
        const { initView, mountSplash, setView, definition, injected } = await import(
            '@/core/view'
        );

        await importAssets(
            Object.entries(assetManifest)
                .filter(([identifier]) => (definition.assets as string[]).includes(identifier))
                .map(([identifier, manifest]) => ({ identifier, manifest })),
            () => undefined,
        );

        // @ts-ignore
        injected.assets = getAssets(definition.assets);

        // Initialize view toolkit
        await initView();
        await mountSplash();
        await setView('main');
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
                (components[componentId]!.injected.flags = config!.components.find(
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
     * Complete the application initialization
     */

    {
        const {
            mountComponents,
            setupComponents,
            registerElements,
            serializeComponentDependencies,
        } = await import('@/core/config');

        // Generate serialized list of component identifiers
        componentsOrdered = serializeComponentDependencies(
            componentDefinitionEntries
                .map<[TComponentId, TComponentId[]]>(([id, { dependencies }]) => [
                    id,
                    [...new Set([...dependencies.optional, ...dependencies.required])],
                ])
                .map(([id, dependencies]) => ({ id, dependencies })),
        );

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

        const { unmountSplash } = await import('@/core/view');
        await unmountSplash();
    }

    if (import.meta.env.PROD) {
        const { loadServiceWorker } = await import('./utils/misc');
        loadServiceWorker();
    }
}

// =================================================================================================

(async function () {
    /**
     * if PRODUCTION mode, proceed initializing with configuration preset.
     */

    if (import.meta.env.PROD) {
        await init();
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
        const config = await loadConfig(import.meta.env.VITE_CONFIG_PRESET);

        const { initView, setView, mountConfigPage, updateConfigPage } = await import(
            '@/core/view'
        );
        await initView();
        await setView('main');

        window.sessionStorage.setItem('appConfig', JSON.stringify(config));

        const { components, componentDefinitions } = await _importComponents();

        await mountConfigPage(
            { ...config },
            Object.fromEntries(
                (
                    Object.entries(componentDefinitions) as [TComponentId, IComponentDefinition][]
                ).map(([componentId, definition]) => [
                    componentId,
                    {
                        ...definition,
                        elements: components[componentId]?.elements,
                    },
                ]),
            ),
            (config: IAppConfig) =>
                requestAnimationFrame(() => {
                    window.sessionStorage.setItem('appConfig', JSON.stringify(config));
                    updateConfigPage(config);
                }),
        );
    }
})();
