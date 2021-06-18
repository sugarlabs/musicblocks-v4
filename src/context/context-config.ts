import { createContext } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IContextConfig } from '../@types/context';

// -- defaults -------------------------------------------------------------------------------------

export const ContextConfigDefaults: IContextConfig = {
    theme: 'light',
};

// -- instance -------------------------------------------------------------------------------------

export const ContextConfig = createContext<IContextConfig>(ContextConfigDefaults);
