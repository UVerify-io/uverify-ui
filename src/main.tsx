import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { UVerifyThemeProvider } from './utils/UVerifyThemeContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UVerifyThemeProvider>
      <App />
    </UVerifyThemeProvider>
  </React.StrictMode>
);
