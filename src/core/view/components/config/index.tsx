import type { IAppConfig } from '@/@types/app';
import type { IComponentDefinition, TComponentId } from '@/@types/components';

import { createRoot } from 'react-dom/client';

import { setView } from '..';

// -- ui items -------------------------------------------------------------------------------------

import Config from './Config';
import ConfigPage from './ConfigPage';

// -- private variables ----------------------------------------------------------------------------

let _data: {
  definitions: Partial<Record<TComponentId, IComponentDefinition>>;
  config: IAppConfig;
  handlerUpdate: (config: IAppConfig) => unknown;
};

let _configCache: IAppConfig;

// -- private functions ----------------------------------------------------------------------------

async function _mount(
  container: HTMLElement,
  component: 'config' | 'config-page',
  data: {
    definitions: Partial<Record<TComponentId, IComponentDefinition>>;
    config: IAppConfig;
    handlerUpdate: (config: IAppConfig) => unknown;
  },
): Promise<void> {
  return new Promise((resolve) => {
    const rootContainer = createRoot(container);
    rootContainer.render(
      component === 'config' ? (
        <Config
          definitions={data.definitions}
          config={data.config}
          handlerUpdate={data.handlerUpdate}
        />
      ) : (
        <ConfigPage
          definitions={data.definitions}
          config={data.config}
          handlerUpdate={data.handlerUpdate}
        />
      ),
    );

    requestAnimationFrame(() => resolve());
  });
}

async function _setup(component: 'config' | 'config-page'): Promise<void> {
  return new Promise((resolve) => {
    setView('setup', async (container: HTMLElement) => {
      await _mount(container, component, _data);
    });

    requestAnimationFrame(() => resolve());
  });
}

// -- public functions -----------------------------------------------------------------------------

export function getConfigCache(): IAppConfig {
  return { ..._configCache };
}

export function updateConfigCache(callback: (newConfig: IAppConfig) => IAppConfig): void {
  _configCache = JSON.parse(JSON.stringify(callback(_configCache)));
}

// -------------------------------------------------------------------------------------------------

/**
 * Mounts the configurator page in the view.
 * @param config app configurations
 * @param definitions map of component definitions
 * @param handlerUpdate callback for when configurations are updated
 */
export async function mountConfigPage(
  config: IAppConfig,
  definitions: Partial<Record<TComponentId, IComponentDefinition>>,
  handlerUpdate: (config: IAppConfig) => unknown,
) {
  _data = { definitions, config, handlerUpdate };
  _configCache = JSON.parse(JSON.stringify({ ...config }));
  await _setup('config-page');
}

/**
 * Updates the mounted configurator page.
 * @param config app configurations
 */
export async function updateConfigPage(config: IAppConfig) {
  _data = { ..._data, config };
  await _setup('config-page');
}
