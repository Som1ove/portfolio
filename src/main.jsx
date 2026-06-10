import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';

function renderBootError(error) {
  const root = document.getElementById('root');
  root.innerHTML = `
    <section class="boot-error">
      <p>React boot error</p>
      <pre>${String(error?.stack || error?.message || error)}</pre>
    </section>
  `;
}

window.addEventListener('error', (event) => {
  if (String(event.message).includes('ResizeObserver loop')) return;

  renderBootError(event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  renderBootError(event.reason);
});

import('./App.jsx')
  .then(({ default: App }) => {
    createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    );
  })
  .catch(renderBootError);
