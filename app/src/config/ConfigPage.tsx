import type { JSX } from 'react';
import type { IAppConfig } from '#/@types/app';
import type { IComponentDefinitionExtended, TComponentId } from '#/@types/components';

import Config from './Config';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

export default function (props: {
  /** App configurations. */
  config: IAppConfig;
  /** Map of component definitions. */
  definitions: Partial<Record<TComponentId, IComponentDefinitionExtended>>;
  /** Callback for when configurations are updated. */
  handlerUpdate: (config: IAppConfig) => unknown;
}): JSX.Element {
  // ---------------------------------------------------------------------------

  return (
    <div id="config-page">
      <div id="config-page-hero">
        <div className="config-page-hero-content">
          <div className="config-page-logo">
            <svg viewBox="0 0 100 100" className="logo-icon">
              <circle cx="50" cy="50" r="45" fill="#1b9cfc" />
              <path d="M35 40 L35 60 L55 50 Z" fill="white" />
              <circle cx="70" cy="35" r="8" fill="#0652dd" />
              <circle cx="70" cy="65" r="8" fill="#0652dd" />
            </svg>
          </div>
          <h1 className="config-page-title">Music Blocks v4</h1>
          <p className="config-page-subtitle">
            Configure your Music Blocks experience by selecting the modules and features you
            want to use
          </p>
          <div className="config-page-badge">
            <span className="badge-icon">⚙️</span>
            <span className="badge-text">Development Configuration</span>
          </div>
        </div>
      </div>

      <div id="config-page-content-wrapper">
        <div className="config-instructions">
          <div className="instruction-card">
            <span className="instruction-icon">1️⃣</span>
            <div className="instruction-content">
              <h3>Select Modules</h3>
              <p>Toggle the modules you want to enable in your Music Blocks application</p>
            </div>
          </div>
          <div className="instruction-card">
            <span className="instruction-icon">2️⃣</span>
            <div className="instruction-content">
              <h3>Configure Features</h3>
              <p>Customize elements and feature flags for each module</p>
            </div>
          </div>
          <div className="instruction-card">
            <span className="instruction-icon">3️⃣</span>
            <div className="instruction-content">
              <h3>Refresh to Apply</h3>
              <p>Reload the page to launch Music Blocks with your configuration</p>
            </div>
          </div>
        </div>

        <Config
          definitions={props.definitions}
          config={props.config}
          handlerUpdate={props.handlerUpdate}
        />
      </div>
    </div>
  );
}
