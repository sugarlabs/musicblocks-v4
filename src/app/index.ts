import type { IAppConfig, TAppImportMap } from '@/@types/app';
import type {
    IComponent,
    IComponentDefinition,
    IComponentDefinitionExtended,
    TComponentId,
} from '@/@types/components';
import type { TAsset } from '@/@types/core/assets';
import type { TI18nLang } from '@/@types/core/i18n';

// -------------------------------------------------------------------------------------------------

const _importMap: TAppImportMap = {
    lang: {},
    assets: {},
    components: {},
};

// -------------------------------------------------------------------------------------------------

async function _loadConfig(preset: number): Promise<IAppConfig> {
    return (await import(`./config/preset-${preset}.ts`)).default;
}

function _updateImportMap(item: 'lang', subitem: TI18nLang): TAppImportMap;
function _updateImportMap(item: 'assets', subitem: string): TAppImportMap;
function _updateImportMap(item: 'components', subitem: TComponentId): TAppImportMap;
function _updateImportMap(item: keyof TAppImportMap, subitem?: string): TAppImportMap {
    if (item === 'lang') {
        _importMap.lang[subitem as TI18nLang] = true;
    } else if (item === 'assets') {
        const assets = { ..._importMap.assets };
        assets[subitem as string] = true;
        _importMap.assets = { ...assets };
    } else if (item === 'components') {
        const components = { ..._importMap.components };
        components[subitem as TComponentId] = true;
        _importMap.components = { ...components };
    }

    // if (import.meta.env.DEV) console.log(`${item}${subitem ? ` > ${subitem}` : ''}`);

    return _importMap;
}

// -------------------------------------------------------------------------------------------------

async function init(config?: IAppConfig) {
    if (config === undefined) {
        config = await _loadConfig(import.meta.env.VITE_CONFIG_PRESET);
    }

    const componentManifest = (await import('@/components')).default;
    const assetManifest = (await import('@/assets')).default;

    const { importAssets, getAssets } = await import('@/core/assets');

    let splashTimeStart: number;

    /*
     * Initialize the application view and mount the spalsh screen.
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
        splashTimeStart = Date.now();
        await setView('main');
    }

    /*
     * Dynamically import components, strings, and assets asynchronously.
     */

    {
        const { updateSplash } = await import('@/core/view');

        const stats = import.meta.env.PROD
            ? await fetch('stats.json').then((res) => res.json())
            : undefined;

        const updateSplashData = (data: TAppImportMap) => {
            if (import.meta.env.DEV) {
                const total =
                    1 + Object.keys(data.assets).length + Object.keys(data.components).length;
                const items =
                    (data.lang !== undefined ? 1 : 0) +
                    Object.values(data.assets).filter((flag) => flag).length +
                    Object.values(data.components).filter((flag) => flag).length;
                updateSplash((items / total) * 100);
            } else {
                const getAssetsSize = (all = true): number => {
                    return Object.entries(data.assets)
                        .filter(([, val]) => all || val)
                        .map(
                            ([key]) =>
                                stats.assets[assetManifest[key].path.split('assets/').slice(-1)[0]],
                        )
                        .reduce((a, b) => a + b, 0);
                };

                const getComponentsSize = (all = true): number => {
                    return Object.entries(data.components)
                        .filter(([, val]) => all || val)
                        .map(([key]) => stats.modules[key])
                        .reduce((a, b) => a + b, 0);
                };

                const allAssetsSize = getAssetsSize();
                const loadedAssetsSize = getAssetsSize(false);

                const allComponentsSize = getComponentsSize();
                const loadedComponentsSize = getComponentsSize(false);

                const langName = Object.keys(data.lang)[0] as TI18nLang;
                const allLangSize = stats.i18n[langName];
                const loadedLangSize = data.lang[langName] ? allLangSize : 0;

                const totalSize = allAssetsSize + allComponentsSize + allLangSize;
                const loadedSize = loadedAssetsSize + loadedComponentsSize + loadedLangSize;

                updateSplash((loadedSize / totalSize) * 100);
            }
        };

        const importItemLang = config.env.lang;
        /** List to component Ids to import. */
        const importListComponents = config.components.map(({ id }) => id);
        /** List to asset Ids to import. */
        const importListAssets = (() => {
            try {
                return Object.entries(componentManifest)
                    .map(
                        ([
                            _,
                            {
                                definition: { assets },
                            },
                        ]) => assets,
                    )
                    .reduce((a, b) => [...new Set([...a, ...b])]);
            } catch (e) {
                return [];
            }
        })();

        _importMap.lang = Object.fromEntries([[importItemLang, false]]);
        _importMap.assets = Object.fromEntries(importListAssets.map((assetId) => [assetId, false]));
        _importMap.components = Object.fromEntries(
            importListComponents.map((componentId) => [componentId, false]),
        );

        const { importStrings } = await import('@/core/i18n');
        const { importComponent } = await import('@/core/config');
        const { importAsset } = await import('@/core/assets');

        await Promise.all([
            // import ES module for i18n and load strings
            importStrings(importItemLang).then(() =>
                updateSplashData(_updateImportMap('lang', importItemLang)),
            ),
            // import ES modules for components
            ...importListComponents.map(
                (componentId) =>
                    new Promise<void>((resolve) => {
                        importComponent(componentId, componentManifest[componentId].path).then(
                            () => {
                                updateSplashData(_updateImportMap('components', componentId));
                                resolve();
                            },
                        );
                    }),
            ),
            // import asset files and load data
            ...importListAssets.map(
                (assetId) =>
                    new Promise<void>((resolve) => {
                        importAsset(assetId, assetManifest[assetId]).then(() => {
                            updateSplashData(_updateImportMap('assets', assetId));
                            resolve();
                        });
                    }),
            ),
        ]);
    }

    /*
     * Collect imported components.
     */

    const { getComponent } = await import('@/core/config');
    const componentIds = config.components.map(({ id }) => id);

    /** Map of component identifier and corresponding component module. */
    const components: Partial<Record<TComponentId, IComponent>> = Object.fromEntries(
        componentIds.map((componentId) => [componentId, getComponent(componentId)]),
    );
    /** List of 2-tuples of component identifier and component definition. */
    const componentDefinitionEntries: [TComponentId, IComponentDefinition][] = componentIds.map(
        (componentId) => [componentId, componentManifest[componentId].definition],
    );

    /**
     * Inject items into component modules.
     */

    {
        const { getStrings } = await import('@/core/i18n');

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
        await mountComponents(componentsOrdered);

        // Initialize components in serialized order
        await setupComponents(componentsOrdered);

        // Unmount the splash screen.
        const { unmountSplash } = await import('@/core/view');
        const splashTimeEnd = Date.now();
        const splashTime = splashTimeEnd - splashTimeStart;
        const splashBuffer = Math.max(import.meta.env.VITE_APP_SPLASH_MIN_DELAY - splashTime, 0);
        setTimeout(() => unmountSplash(), splashBuffer);
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
        const config = await _loadConfig(import.meta.env.VITE_CONFIG_PRESET);

        const { initView, mountConfigPage, updateConfigPage } = await import('@/core/view');
        await initView();

        window.sessionStorage.setItem('appConfig', JSON.stringify(config));

        const componentManifest = (await import('@/components')).default;
        const { importComponent } = await import('@/core/config');
        const components = Object.fromEntries(
            await Promise.all(
                (Object.keys(componentManifest) as TComponentId[]).map((componentId) =>
                    importComponent(componentId, componentManifest[componentId].path).then(
                        (component) => [componentId, component],
                    ),
                ),
            ),
        ) as Record<TComponentId, IComponent>;
        const componentDefinitions = Object.fromEntries(
            Object.entries(componentManifest).map<[TComponentId, IComponentDefinitionExtended]>(
                ([componentId, { definition }]) => [
                    componentId as TComponentId,
                    { ...definition, elements: components[componentId as TComponentId].elements },
                ],
            ),
        ) as Record<TComponentId, IComponentDefinition>;

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
