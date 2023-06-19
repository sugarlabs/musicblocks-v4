import type { IAppConfig } from '@/@types/app';
import type { IComponentDefinitionExtended, TComponentId } from '@/@types/components';

import { getConfigCache, updateConfigCache } from '.';
import { default as componentManifest } from '@/components';

// -- ui items -------------------------------------------------------------------------------------

import { WToggleSwitch } from '@/common/components';

import './index.scss';

// -- component definition -------------------------------------------------------------------------

/**
 * React component definition for the feature configurator component.
 */
export default function (props: {
  /** App configurations. */
  config: IAppConfig;
  /** Map of component definitions. */
  definitions: Partial<Record<TComponentId, IComponentDefinitionExtended>>;
  /** Callback for when configurations are updated. */
  handlerUpdate: (config: IAppConfig) => unknown;
}): JSX.Element {
  // ---------------------------------------------------------------------------

  function _isActive(componentId: TComponentId): boolean {
    return props.config.components.findIndex(({ id }) => id === componentId) !== -1;
  }

  function _getElements(componentId: TComponentId): Record<string, boolean> | null {
    const componentConfig = props.config.components.find(({ id }) => id === componentId);

    if (componentConfig === undefined) return null;

    if (!('elements' in componentConfig) || componentConfig['elements'] === undefined) return null;

    const componentDefintion = props.definitions[componentId]!;
    const elements = Object.keys(componentDefintion.elements!);

    return componentConfig.elements === true
      ? Object.fromEntries(elements.map((elementName) => [elementName, true]))
      : Object.fromEntries(
          elements.map((elementName) => [
            elementName,
            (componentConfig.elements! as string[]).includes(elementName),
          ]),
        );
  }

  function _getFlags(componentId: TComponentId): Record<string, boolean> | null {
    const componentConfig = props.config.components.find(({ id }) => id === componentId);

    if (componentConfig === undefined) return null;

    return 'flags' in componentConfig ? componentConfig.flags : null;
  }

  const modules = Object.fromEntries(
    Object.entries(componentManifest)
      .map(
        ([componentId, { name, desc }]) =>
          ({
            id: componentId,
            name,
            desc,
          } as {
            id: TComponentId;
            name: string;
            desc: string;
          }),
      )
      .map(
        (data) =>
          ({
            ...data,
            active: _isActive(data.id),
          } as {
            id: TComponentId;
            name: string;
            desc: string;
            active: boolean;
          }),
      )
      .map(
        (data) =>
          ({
            ...data,
            elements: _getElements(data.id),
          } as {
            id: TComponentId;
            name: string;
            desc: string;
            active: boolean;
            elements: Record<string, boolean> | null;
          }),
      )
      .map(
        (data) =>
          ({
            ...data,
            flags: _getFlags(data.id),
          } as {
            id: TComponentId;
            name: string;
            desc: string;
            active: boolean;
            elements: Record<string, boolean> | null;
            flags: Record<string, boolean> | null;
          }),
      )
      .map((data) => [data.id, data]),
  );

  function _update(callback: (config: IAppConfig) => IAppConfig) {
    props.handlerUpdate(callback({ ...props.config }));
  }

  // ---------------------------------------------------------------------------

  function toggleModule(componentId: TComponentId) {
    _update((config: IAppConfig) => {
      const configCache = getConfigCache();

      if (!modules[componentId].active) {
        const newComponentConfig: {
          id: TComponentId;
          elements?: string[];
          flags?: Record<string, boolean>;
        } = {
          id: componentId,
        };

        const configCacheComponentIndex = configCache.components.findIndex(
          ({ id }) => id === componentId,
        );

        if ('elements' in props.definitions[componentId]!) {
          newComponentConfig['elements'] =
            configCacheComponentIndex !== -1
              ? // @ts-ignore
                configCache.components[configCacheComponentIndex].elements
              : Object.keys(props.definitions[componentId]!.elements!);
        }

        if ('flags' in props.definitions[componentId]!) {
          newComponentConfig['flags'] =
            configCacheComponentIndex !== -1
              ? // @ts-ignore
                configCache.components[configCacheComponentIndex].flags
              : Object.fromEntries(
                  Object.keys(props.definitions[componentId]!.flags!).map((flag) => [flag, false]),
                );
        }

        // @ts-ignore
        config = { ...config, components: [...config.components, newComponentConfig] };
      } /** if (modules[componentId].active) */ else {
        let configCacheComponentIndex = configCache!.components.findIndex(
          ({ id }) => id === componentId,
        );

        const configComponentIndex = config.components.findIndex(({ id }) => id === componentId);

        if (configCacheComponentIndex === -1) {
          updateConfigCache((configCache) => {
            const newConfigCache = { ...configCache };
            // @ts-ignore
            newConfigCache.components.push({ id: componentId });
            configCacheComponentIndex = newConfigCache.components!.length - 1;
            return newConfigCache;
          });
        }

        if ('flags' in config.components[configComponentIndex]) {
          updateConfigCache((configCache) => {
            const newConfigCache = { ...configCache };
            // @ts-ignore
            newConfigCache.components[configCacheComponentIndex].flags =
              //@ts-ignore
              config.components[configComponentIndex].flags;
            return newConfigCache;
          });
        }

        if ('elements' in config.components[configComponentIndex]) {
          updateConfigCache((configCache) => {
            const newConfigCache = { ...configCache };
            // @ts-ignore
            newConfigCache.components[configCacheComponentIndex].elements =
              //@ts-ignore
              config.components[configComponentIndex].elements;
            return newConfigCache;
          });
        }

        config.components.splice(configComponentIndex, 1);
      }

      return { ...config };
    });
  }

  function toggleModuleElement(componentId: TComponentId, elementName: string) {
    _update((config: IAppConfig) => {
      const componentIndex = config.components.findIndex(({ id }) => id === componentId);

      // @ts-ignore
      if (config.components[componentIndex].elements === true) {
        // @ts-ignore
        config.components[componentIndex].elements = Object.entries(_getElements(componentId))
          .filter(([_, active]) => active)
          .map(([elementName]) => elementName);
      }

      // @ts-ignore
      if (config.components[componentIndex].elements.includes(elementName)) {
        // @ts-ignore
        const elementIndex = (config.components[componentIndex].elements as string[]).findIndex(
          (_elementName) => _elementName === elementName,
        );
        // @ts-ignore
        config.components[componentIndex].elements.splice(elementIndex, 1);
      } else {
        // @ts-ignore
        config.components[componentIndex].elements.push(elementName);
      }

      return config;
    });
  }

  function toggleModuleFlag(componentId: TComponentId, flag: string) {
    _update((config: IAppConfig) => {
      const componentIndex = config.components.findIndex(({ id }) => id === componentId);
      // @ts-ignore
      config.components[componentIndex].flags[flag] =
        // @ts-ignore
        !config.components[componentIndex].flags[flag];

      return config;
    });
  }

  // ---------------------------------------------------------------------------

  return (
    <div id="config-wrapper">
      <p id="config-disclaimer">refresh webpage to go to main application page</p>

      <ul id="config-module-list">
        {Object.entries(modules).map(([id, { name, desc, active, elements, flags }], i) => (
          <li className="config-module-list-item" key={`config-module-list-item-${i}`}>
            <div className="config-module-list-item-header">
              <div className="config-module-list-item-header-left">
                <h2 className="config-module-list-item-name">{name}</h2>
                <p className="config-module-list-item-desc">{desc}</p>
              </div>
              <div className="config-module-list-item-header-right">
                <WToggleSwitch
                  active={active}
                  handlerClick={() => toggleModule(id as TComponentId)}
                />
              </div>
            </div>

            {((elements && Object.keys(elements).length > 0) ||
              (flags && Object.keys(flags).length > 0)) && (
              <div
                className={`config-module-list-item-body ${
                  !active ? 'config-module-list-item-body-inactive' : ''
                }`}
              >
                {elements && Object.keys(elements).length > 0 && (
                  <div className="config-module-list-item-subitems config-module-list-item-elements">
                    <h3 className="config-module-list-item-subitems-label config-module-list-item-elements-label">
                      Elements
                    </h3>

                    <ul className="config-module-list-item-subitem-list config-module-list-item-element-list">
                      {Object.keys(elements).map((element, i) => (
                        <li
                          className="config-module-list-item-subitem config-module-list-item-element"
                          key={`config-module-list-item-element-${i}`}
                        >
                          <p className="config-module-list-item-subitem-name config-module-list-item-element-name">
                            <code>{element}</code>
                          </p>
                          <WToggleSwitch
                            active={elements[element]}
                            handlerClick={() => toggleModuleElement(id as TComponentId, element)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {flags && Object.keys(flags).length > 0 && (
                  <div className="config-module-list-item-subitems config-module-list-item-flags">
                    <h3 className="config-module-list-item-subitems-label config-module-list-item-flags-label">
                      Feature Flags
                    </h3>

                    <ul className="config-module-list-item-subitem-list config-module-list-item-flag-list">
                      {Object.keys(flags).map((flag, i) => (
                        <li
                          className="config-module-list-item-subitem config-module-list-item-flag"
                          key={`config-module-list-item-flag-${i}`}
                        >
                          <p className="config-module-list-item-subitem-name config-module-list-item-flag-name">
                            <code>{flag}</code>
                          </p>
                          <WToggleSwitch
                            active={flags[flag]}
                            handlerClick={() => toggleModuleFlag(id as TComponentId, flag)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
