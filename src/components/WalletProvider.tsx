import React, {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useMemo,
  useContext,
} from "react";
import { useSelector } from "react-redux";
import { Connection, ConfirmOptions, Keypair } from "@solana/web3.js";
// @ts-ignore
// import Wallet from "@project-serum/sol-wallet-adapter";
import { PhantomWalletAdapter, WalletAdapter } from '../utils/phantom'
import { Program, Provider } from "@project-serum/anchor";
import { State as StoreState } from "../store/reducer";
import MultisigIdl from "../idl";
import { useWallet } from "@solana/wallet-adapter-react";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

const WalletContext = React.createContext<null | WalletContextValues>(null);

type WalletContextValues = {
  wallet: WalletAdapter;
  multisigClient: Program;
};


export function useWallet2(): WalletContextValues {
  const w = useContext(WalletContext);
  if (!w) {
    throw new Error("Missing wallet context");
  }
  // @ts-ignore
  return w;
}

export default function WalletProvider(
  props: PropsWithChildren<ReactNode>
): ReactElement {
  const {wallet} = useWallet();
  const { network } = useSelector((state: StoreState) => {
    return {
      network: state.common.network,
    };
  });

  const { multisigClient, wallet: wallet2 } = useMemo(() => {
    const opts: ConfirmOptions = {
      preflightCommitment: "recent",
      commitment: "recent",
    };
    const connection = new Connection(network.url, opts.preflightCommitment);
    
    const provider = new Provider(connection, (wallet?.adapter as any) ??
    new NodeWallet(Keypair.fromSeed(new Uint8Array(32).fill(1))), opts);

    const multisigClient = new Program(
      MultisigIdl,
      network.multisigProgramId,
      provider
    );

    return {
      wallet,
      multisigClient,
    };
  }, [network, wallet]);

  return (
    <WalletContext.Provider value={{ wallet: wallet2 as any, multisigClient }}>
      {props.children}
    </WalletContext.Provider>
  );
}
