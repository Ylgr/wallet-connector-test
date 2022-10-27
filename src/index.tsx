import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Web3Modal} from "@web3modal/react";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const config = {
    projectId: "67d2e678cb52cc8bebb115206180b1ac",
    theme: 'light' as "light",
    accentColor: "default" as "default",
    ethereum: {
        appName: 'web3Modal',
        autoConnect: true
    }
};
root.render(
  <React.StrictMode>
    <App />
      <Web3Modal config={config} />

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
