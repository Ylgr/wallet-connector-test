import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import SignClient from "@walletconnect/sign-client";
import QRCodeModal from "@walletconnect/qrcode-modal";


function App() {
  let signClient: SignClient

  useEffect(() => {
    SignClient.init({
      projectId: "67d2e678cb52cc8bebb115206180b1ac",
      metadata: {
        name: "Example Dapp",
        description: "Example Dapp",
        url: "#",
        icons: ["https://walletconnect.com/walletconnect-logo.png"],
      },
    }).then((_signClient) => {
      signClient = _signClient;
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
  }

  const connect = async () => {
    try {
      if(!signClient) return
      const { uri, approval } = await signClient.connect({
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
            chains: ["eip155:1"],
            events: ["chainChanged", "accountsChanged"],
          },
        },
      });

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

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a onClick={() => connect()}>
          Connect Wallet connector
        </a>
      </header>
    </div>
  );
}

export default App;
