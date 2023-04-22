import React, {useMemo} from "react";
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { Provider } from "react-redux";
import { useHistory, useLocation } from "react-router";
import { HashRouter, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { MuiThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { unstable_createMuiStrictModeTheme as createMuiTheme } from "@material-ui/core/styles";
import { PublicKey } from "@solana/web3.js";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletProvider as NewWalletProvider } from "@solana/wallet-adapter-react";
import WalletProvider from "./components/WalletProvider";
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { store } from "./store";
import Layout from "./components/Layout";
import Multisig from "./components/Multisig";
import { networks } from "./store/reducer";
import { AccountProvider } from "./context/AccountContext";

require('@solana/wallet-adapter-react-ui/styles.css');

function App() {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);


  const theme = createMuiTheme({
    palette: {
      background: {
        default: "rgb(255,255,255)",
      },
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
    },
    overrides: {},
  });

  const wallets = useMemo(
    () => [
        /**
         * Wallets that implement either of these standards will be available automatically.
         *
         *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
         *     (https://github.com/solana-mobile/mobile-wallet-adapter)
         *   - Solana Wallet Standard
         *     (https://github.com/solana-labs/wallet-standard)
         *
         * If you wish to support a wallet that supports neither of those standards,
         * instantiate its legacy wallet adapter here. Common legacy adapters can be found
         * in the npm package `@solana/wallet-adapter-wallets`.
         */
        new PhantomWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
);

  return (
    <ConnectionProvider endpoint={endpoint}>
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={5} autoHideDuration={8000}>
          <WalletProvider>
          <NewWalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <AccountProvider>
              <HashRouter basename={"/"}>
                <Layout>
                  <Route exact path="/" component={MultisigPage} />
                  <Route
                    exact
                    path="/:address"
                    component={MultisigInstancePage}
                  />
                </Layout>
              </HashRouter>
            </AccountProvider>
            </WalletModalProvider>
          </NewWalletProvider>
          </WalletProvider>
        </SnackbarProvider>
      </MuiThemeProvider>
    </Provider>
    </ConnectionProvider>
  );
}

function MultisigPage() {
  const { hash } = window.location;
  if (hash) {
    window.location.href = `/#/${networks.mainnet.multisigUpgradeAuthority!.toString()}`;
  }
  const multisig = networks.mainnet.multisigUpgradeAuthority;
  return <Multisig multisig={multisig} />;
}

export function MultisigInstancePage() {
  const history = useHistory();
  const location = useLocation();
  const path = location.pathname.split("/");
  if (path.length !== 2) {
    history.push(`/multisig`);
    return <></>;
  } else {
    const multisig = new PublicKey(path[1]);
    return <Multisig multisig={multisig} />;
  }
}

export default App;
