import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { UVerifyThemeProvider } from './utils/UVerifyThemeContext';
import { UVerifyConfigProvider } from './utils/UVerifyConfigProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UVerifyConfigProvider>
      <UVerifyThemeProvider>
        <App />
      </UVerifyThemeProvider>
    </UVerifyConfigProvider>
  </React.StrictMode>
);
