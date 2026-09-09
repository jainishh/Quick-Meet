import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';

axios.defaults.withCredentials = true;

import { SocketProvider } from './context/SocketContext';
import { SettingsProvider } from './context/SettingsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="633648839736-ssff3lp73su4pjgg9ubfo35vobp9ve2e.apps.googleusercontent.com">
    <SettingsProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </SettingsProvider>
  </GoogleOAuthProvider>
);
