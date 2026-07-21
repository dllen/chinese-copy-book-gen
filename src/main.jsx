import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

window.__copybook__ = window.__copybook__ || {};

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
