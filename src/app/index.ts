import { loadServiceWorker } from './utils/misc';
loadServiceWorker();

// =================================================================================================

import { setView } from '@/core/view';

setView('main');

requestAnimationFrame(() => import('@/core/config'));
