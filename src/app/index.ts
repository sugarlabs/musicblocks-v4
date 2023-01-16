import { loadServiceWorker } from './utils';
loadServiceWorker();

// =================================================================================================

import { setView } from '@/view';

setView('main');

requestAnimationFrame(() => import('@/core/config'));
