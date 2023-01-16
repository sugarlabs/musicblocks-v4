import { loadServiceWorker } from './utils';
loadServiceWorker();

// =================================================================================================

import { setView } from '@/core/view';

setView('main');

requestAnimationFrame(() => import('@/core/config'));
