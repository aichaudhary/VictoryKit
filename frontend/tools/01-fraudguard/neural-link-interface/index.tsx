import React from 'react';
import ReactDOM from 'react-dom/client';
import HomePage from './HomePage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
);