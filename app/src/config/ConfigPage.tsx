import type { JSX } from 'react';
import type { IAppConfig } from '#/@types/app';
import type { IComponentDefinitionExtended, TComponentId } from '#/@types/components';

import Config from './Config';

// -- Stylesheet -----------------------------------------------------------------------------------
import './index.scss';

// -- Component Definition -------------------------------------------------------------------------

/**
 * Configuration Page Component
 * 
 * Renders the application configuration interface and handles updates to app settings.
 */
export default function ConfigPage({
  config,
  definitions,
  handlerUpdate,
}: {
  /** App configurations. */
  config: IAppConfig;
  /** Map of component definitions. */
  definitions: Partial<Record<TComponentId, IComponentDefinitionExtended>>;
  /** Callback for when configurations are updated. */
  handlerUpdate: (config: IAppConfig) => unknown;
}): JSX.Element {
  return (
    <div id="config-page">
      <div id="config-page-content-wrapper">
        <Config
          definitions={definitions}
          config={config}
          handlerUpdate={handlerUpdate}
        />
      </div>
    </div>
  );
}
