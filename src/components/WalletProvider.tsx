import React, {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useMemo,
  useContext,
} from "react";
import { useSelector } from "react-redux";
import { Connection, ConfirmOptions } from "@solana/web3.js";
// @ts-ignore
// import Wallet from "@project-serum/sol-wallet-adapter";
import { PhantomWalletAdapter, WalletAdapter } from '../utils/phantom'
import { Program, Provider } from "@project-serum/anchor";
import { State as StoreState } from "../store/reducer";
import MultisigIdl from "../idl";

export function useWallet(): WalletContextValues {
  const w = useContext(WalletContext);
  if (!w) {
    throw new Error("Missing wallet context");
  }
  // @ts-ignore
  return w;
}

const WalletContext = React.createContext<null | WalletContextValues>(null);

type WalletContextValues = {
  wallet: WalletAdapter;
  multisigClient: Program;
};

export default function WalletProvider(
  props: PropsWithChildren<ReactNode>
): ReactElement {
  const { network } = useSelector((state: StoreState) => {
    return {
      network: state.common.network,
    };
  });

  const { wallet, multisigClient } = useMemo(() => {
    const opts: ConfirmOptions = {
      preflightCommitment: "recent",
      commitment: "recent",
    };
    const connection = new Connection(network.url, opts.preflightCommitment);
    
    const wallet = new PhantomWalletAdapter();
  // @ts-ignore
    const provider = new Provider(connection, wallet, opts);


    const multisigClient = new Program(
      MultisigIdl,
      network.multisigProgramId,
      provider
    );

    return {
      wallet,
      multisigClient,
    };
  }, [network]);

  return (
    <WalletContext.Provider value={{ wallet, multisigClient }}>
      {props.children}
    </WalletContext.Provider>
  );
}
