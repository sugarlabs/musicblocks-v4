import './react19Polyfill';
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/index.css';
import '@/palette/palette.css';
import App from './App';
import { RecoilRoot } from 'recoil';

ReactDOM.createRoot(document.getElementById('playground-root')!).render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>,
);
