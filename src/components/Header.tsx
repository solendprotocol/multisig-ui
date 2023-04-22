import React, { useState, useEffect, ReactElement } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Select from "@material-ui/core/Select";
import Menu from "@material-ui/core/Menu";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Button from "@material-ui/core/Button";
import PersonIcon from "@material-ui/icons/Person";
import BubbleChartIcon from "@material-ui/icons/BubbleChart";
import SearchIcon from "@material-ui/icons/Search";
import { PublicKey } from "@solana/web3.js";
import { networks, State as StoreState, ActionType } from "../store/reducer";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Header() {
  const history = useHistory();
  const [multisigAddress, setMultisigAddress] = useState("");
  const disabled = !isValidPubkey(multisigAddress);
  const searchFn = () => {
    history.push(`/${multisigAddress}`);
  };
  return (
    <AppBar
      position="static"
      style={{
        background: "#ffffff",
        color: "#272727",
        boxShadow: "none",
        borderBottom: "solid 1pt #ccc",
      }}
    >
      <Toolbar>
        <div
          style={{
            display: "flex",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flex: 1 }}>
            <BarButton label="Multisig" hrefClient="/" />
            <div
              style={{
                marginLeft: "16px",
                marginRight: "16px",
                borderRadius: "25px",
                display: "flex",
                flex: 1,
                backgroundColor: "rgb(245 245 245)",
              }}
            >
              <input
                style={{
                  flex: 1,
                  background: "none",
                  padding: "16px",
                  border: "none",
                  outlineWidth: 0,
                  color: "inherit",
                }}
                placeholder="Search a multisig address..."
                value={multisigAddress}
                onChange={(e) => setMultisigAddress(e.target.value as string)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    searchFn();
                  }
                }}
              />
              <IconButton disabled={disabled} onClick={searchFn}>
                <SearchIcon />
              </IconButton>
            </div>
          </div>
          <div
            style={{
              display: "flex",
            }}
          >
            <NetworkSelector />
              <WalletConnectButton/>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
}

type BarButtonProps = {
  label: string;
  hrefClient?: string;
  href?: string;
};

function BarButton(props: BarButtonProps) {
  const history = useHistory();
  const { label, href, hrefClient } = props;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      onClick={() => hrefClient && history.push(hrefClient)}
    >
      <Link
        style={{ color: "inherit", textDecoration: "none" }}
        href={href}
        target="_blank"
      >
        <Button color="inherit">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography style={{ fontSize: "15px" }}>{label}</Typography>
          </div>
        </Button>
      </Link>
    </div>
  );
}

function NetworkSelector() {
  const network = useSelector((state: StoreState) => {
    return state.common.network;
  });
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div
      style={{
        marginRight: "10px",
        fontSize: "15px",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Button
        color="inherit"
        onClick={(e) =>
          setAnchorEl(
            // @ts-ignore
            e.currentTarget
          )
        }
      >
        <BubbleChartIcon />
        <Typography style={{ marginLeft: "5px", fontSize: "15px" }}>
          {network.label}
        </Typography>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        style={{
          marginLeft: "12px",
          color: "white",
        }}
      >
        {Object.keys(networks).map((n: string) => (
          <MenuItem
            key={n}
            onClick={() => {
              handleClose();
              dispatch({
                type: ActionType.CommonSetNetwork,
                item: {
                  network: networks[n],
                  networkKey: n,
                },
              });
            }}
          >
            <Typography>{networks[n].label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

type WalletConnectButtonProps = {
  style?: any;
};

export function WalletConnectButton(
  props: WalletConnectButtonProps
): ReactElement {
  const {publicKey} = useWallet();
  return publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />
}

function isValidPubkey(addr: string): boolean {
  try {
    new PublicKey(addr);
    return true;
  } catch (_) {
    return false;
  }
}
