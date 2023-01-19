import type { IAppConfig } from '@/@types/app';
import type { IComponentDefinition, TComponentId } from '@/@types/components';

import Config from './Config';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

export default function (props: {
  /** App configurations. */
  config: IAppConfig;
  /** Map of component definitions. */
  definitions: Partial<Record<TComponentId, IComponentDefinition>>;
  /** Callback for when configurations are updated. */
  handlerUpdate: (config: IAppConfig) => unknown;
}): JSX.Element {
  // ---------------------------------------------------------------------------

  return (
    <div id="config-page">
      <div id="config-page-content-wrapper">
        <Config
          definitions={props.definitions}
          config={props.config}
          handlerUpdate={props.handlerUpdate}
        />
      </div>
    </div>
  );
}
