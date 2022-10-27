import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Web3Modal} from "@web3modal/react";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
      <Web3Modal config={{
          projectId: process.env.REACT_APP_WALLET_CONNECTOR_PROJECT_ID as string,
          theme: 'light' as "light",
          accentColor: "default" as "default",
          ethereum: {
              appName: 'web3Modal',
              autoConnect: true,
              chains: [
                  {
                      id: 97,
                      testnet: true,
                      name: "BNB chain testnet",
                      network: "",
                      rpcUrls: {default: "https://data-seed-prebsc-1-s1.binance.org:8545"}
                  }
              ]
          }
      }} />

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
