import { loadServiceWorker } from './utils';
import reportWebVitals from './reportWebVitals';
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

loadServiceWorker();

// =================================================================================================

import './view';

requestAnimationFrame(() => import('./config'));

// =================================================================================================

// import './archive/index';
