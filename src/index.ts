import { loadServiceWorker } from './utils';
loadServiceWorker();

// =================================================================================================

import { setView } from './view';

setView('main');

requestAnimationFrame(() => import('./config'));

// =================================================================================================

// import './archive/index';
