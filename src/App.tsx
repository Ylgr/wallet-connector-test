import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import SignClient from "@walletconnect/sign-client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { ConnectButton, useAccount } from '@web3modal/react';
import Token from "./Token";
function App() {
  let [signClient, setSighClient] = useState(new SignClient());
  let [session, setSession] = useState(null);
  let [web3, setWeb3] = useState(null);
  const { account: {address, isConnected}, account } = useAccount()
  useEffect(() => {
    SignClient.init({
      projectId: process.env.REACT_APP_WALLET_CONNECTOR_PROJECT_ID,
      metadata: {
        name: "Example Dapp",
        description: "Example Dapp",
        url: "#",
        icons: ["https://walletconnect.com/walletconnect-logo.png"],
      },
    }).then((_signClient) => {
      setSighClient(_signClient);
      // @ts-ignore
      _signClient.on("session_event", ({ event }) => {
        console.log('session_event: ', event)
        // Handle session events, such as "chainChanged", "accountsChanged", etc.
      });

      _signClient.on("session_update", ({ topic, params }) => {
        const { namespaces } = params;
        const _session = _signClient.session.get(topic);
        // Overwrite the `namespaces` of the existing session with the incoming one.
        const updatedSession = { ..._session, namespaces };
        // Integrate the updated session state into your dapp state.
        // onSessionUpdate(updatedSession);
        console.log('updatedSession: ', updatedSession)
      });

      _signClient.on("session_delete", () => {
        console.log('session_delete')
        // Session was deleted -> reset the dapp state, clean up from user session, etc.
      });
    })
  }, []);

  // @ts-ignore
  const onSessionConnected = async (session) => {
    console.log('session: ', session)
    setSession(session)
  }

  const connect = async () => {
    try {
      if(!signClient) return
      const { uri, approval } = await signClient.connect(
          {
        // Optionally: pass a known prior pairing (e.g. from `signClient.core.pairing.getPairings()`) to skip the `uri` step.
        // pairingTopic: pairing?.topic,
        // Provide the namespaces and chains (e.g. `eip155` for EVM-based chains) we want to use in this session.
        requiredNamespaces: {
          eip155: {
            methods: [
              "eth_sendTransaction",
              "eth_signTransaction",
              "eth_sign",
              "personal_sign",
              "eth_signTypedData",
            ],
            chains: ["eip155:1", "eip155:56"],
            events: ["chainChanged", "accountsChanged"],
          },
        },
      }
      );

      // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
      if (uri) {
        QRCodeModal.open(uri, () => {
          console.log("EVENT", "QR Code Modal closed");
        });
      }

      // Await session approval from the wallet.
      const session = await approval();
      // Handle the returned session (e.g. update UI to "connected" state).
      await onSessionConnected(session);
    } catch (e) {
      console.error(e);
    } finally {
      // Close the QRCode modal in case it was open.
      QRCodeModal.close();
    }
  }

  const signMessage = async () => {
    const result = await signClient.request({
      // @ts-ignore
      topic: session.topic,
      chainId: "eip155:56",
      request: {
        method: "personal_sign",
        params: [
          '0x49207265616c6c792077616e7420746f207374617920696e20796f757220686f757365',
          '0x0000000000000000000000000000000000000000'
        ],
      },
    });
    console.log('result: ', result)
  }

  const signTransaction = async () => {
    const result = await signClient.request({
      // @ts-ignore
      topic: session.topic,
      chainId: "eip155:56",
      request: {
        method: "eth_signTransaction",
        params: [
          {
            from: "0x66bF1c3dd467D691132AC9260d6ae3c7cAd0D632",
            to: "0xF4402fE2B09da7c02504DC308DBc307834CE56fE",
            data:
                "0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675",
            value: "0", // 2441406250
          },
        ],
      },
    });
    console.log('result: ', result)
  }

  return (
    <div className="App">
      <header className="App-header">
        <a onClick={() => connect()}>
          Connect Wallet connector
        </a>
        <button disabled={session === null} onClick={() => signMessage()}>Sign message</button>
        <button disabled={session === null} onClick={() => signTransaction()}>Sign transaction</button>
        <h1>{address ? address : 'none'} </h1>
        <ConnectButton />
        {isConnected && <Token />}
      </header>

    </div>
  );
}

export default App;
