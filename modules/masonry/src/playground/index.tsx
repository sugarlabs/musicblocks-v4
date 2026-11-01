import React from 'react';
import ReactDOM from 'react-dom/client';

import '@/index.css';
import { useThemeStore } from '@/stores/theme';

import App from './App';

// Apply the saved theme preference before first paint (and follow system theme changes)
useThemeStore.getState().initTheme();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
