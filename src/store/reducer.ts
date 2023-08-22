import { PublicKey } from "@solana/web3.js";

export type Action = {
  type: ActionType;
  item: any;
};

export enum ActionType {
  CommonTriggerShutdown,
  CommonDidShutdown,
  CommonWalletDidConnect,
  CommonWalletDidDisconnect,
  CommonWalletSetProvider,
  CommonSetNetwork,
}

export default function reducer(
  state: State = initialState,
  action: Action
): State {
  let newState = {
    common: { ...state.common },
  };
  switch (action.type) {
    case ActionType.CommonWalletSetProvider:
      newState.common.walletProvider = action.item.walletProvider;
      return newState;
    case ActionType.CommonWalletDidConnect:
      newState.common.isWalletConnected = true;
      return newState;
    case ActionType.CommonWalletDidDisconnect:
      newState.common.isWalletConnected = false;
      return newState;
    case ActionType.CommonSetNetwork:
      if (newState.common.network.label !== action.item.network.label) {
        newState.common.network = action.item.network;
      }
      return newState;
    default:
      return newState;
  }
}

export type State = {
  common: CommonState;
};

export type CommonState = {
  walletProvider?: string;
  isWalletConnected: boolean;
  network: Network;
};

export const networks: Networks = {
  mainnet: {
    // Cluster.
    label: "Mainnet Beta",
    url:
      "https://solana-mainnet.g.alchemy.com/v2/ZT3c4pYf1inIrB0GVDNR7nx4LwyED5Ci",
    explorerClusterSuffix: "",
    multisigProgramId: new PublicKey(
      "BLg8mSPvEjzSkbGdE9mRJfTSm7EauYgzFsWhERKn1gRm"
    ),
    multisigUpgradeAuthority: new PublicKey(
      "3w62UDPYVicBxUGVdEHqPobkqQJDtq3yJS2PFapug5F3"
    ),
  },
  mainnet2: {
    // Cluster.
    label: "Mainnet Beta 2",
    url: "https://rpc.helius.xyz/?api-key=96d88c32-e147-4ef8-88b0-18c758ca69df",
    explorerClusterSuffix: "",
    multisigProgramId: new PublicKey(
      "BLg8mSPvEjzSkbGdE9mRJfTSm7EauYgzFsWhERKn1gRm"
    ),
    multisigUpgradeAuthority: new PublicKey(
      "3w62UDPYVicBxUGVdEHqPobkqQJDtq3yJS2PFapug5F3"
    ),
  },
  devnet: {
    // Cluster.
    label: "Devnet",
    url: "https://api.devnet.solana.com",
    explorerClusterSuffix: "devnet",
    multisigProgramId: new PublicKey(
      "5FRWTCJqEz1LmXT3p5kyJPm5erfYPoYaJcDpt6BWPrmy"
    ),
  },
  // Fill in with your local cluster addresses.
  localhost: {
    // Cluster.
    label: "Localhost",
    url: "http://localhost:8899",
    explorerClusterSuffix: "localhost",
    multisigProgramId: new PublicKey(
      "9z7Pq56To96qbVLzuBcf47Lc7u8uUWZh6k5rhcaTsDjz"
    ),
  },
};

export const initialState: State = {
  common: {
    isWalletConnected: false,
    walletProvider: "https://www.sollet.io",
    network: networks.mainnet,
  },
};

type Networks = { [label: string]: Network };

export type Network = {
  // Cluster.
  label: string;
  url: string;
  explorerClusterSuffix: string;
  multisigProgramId: PublicKey;
  multisigUpgradeAuthority?: PublicKey;
};
