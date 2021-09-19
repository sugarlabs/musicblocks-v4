import { createContext } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IAppConfig, IConfigContext, IProjectConfig } from '../@types/context';

// -- defaults -------------------------------------------------------------------------------------

import { blockSize, horizontalScroll, language, masterVolume, theme, turtleWrap } from '../config';

/**
 * Default values for global app configurations
 */
export const appConfigDefaults: IAppConfig = {
    theme,
    language,
    horizontalScroll,
    turtleWrap,
    blockSize,
};

/**
 * Default values for global project configurations
 */
export const projectConfigDefaults: IProjectConfig = {
    masterVolume,
};

/**
 * Default values for global configurations context
 */
const configContextDefaults: IConfigContext = {
    appConfig: appConfigDefaults,
    setAppConfig: (appConfig: IAppConfig) => appConfig, // dummy
    projectConfig: projectConfigDefaults,
    setProjectConfig: (projectConfig: IProjectConfig) => projectConfig, // dummy
};

// -- instance -------------------------------------------------------------------------------------

/**
 * Context instance for global configurations.
 */
export const ConfigContext = createContext<IConfigContext>(configContextDefaults);
