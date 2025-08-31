import React from 'react';
import ReactDOM from 'react-dom/client';
import CasinoApp from './CasinoApp';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <CasinoApp />
  </React.StrictMode>
);