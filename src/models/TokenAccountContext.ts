import { AccountInfo } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export class TokenAccountContext {
  private static readonly SPL_ACCOUNT_CONTEXT_EMPTY = TokenAccountContext.index(
    [],
  );

  private readonly accounts: AccountInfo[];
  private readonly bySplAccountId: Map<string, AccountInfo>;

  private constructor(
    accounts: AccountInfo[],
    bySplAccountId: Map<string, AccountInfo>,
  ) {
    this.accounts = accounts;
    this.bySplAccountId = bySplAccountId;
  }

  public static empty() {
    return TokenAccountContext.SPL_ACCOUNT_CONTEXT_EMPTY;
  }

  public static index(accounts: AccountInfo[]): TokenAccountContext {
    const bySplAccountId = new Map<string, AccountInfo>();
    accounts.forEach(a =>
      bySplAccountId.set(a.address.toString(), a),
    );
    return new TokenAccountContext(accounts, bySplAccountId);
  }

  public isReady() {
    return this.accounts.length > 0;
  }

  public getAllTokenAccounts(): AccountInfo[] {
    return this.accounts;
  }

  public getSplAccount(splAccountId: PublicKey): AccountInfo {
    const result = this.findSplAccount(splAccountId);
    if (!result) {
      throw new Error(`No account for ${splAccountId}`);
    }

    return result;
  }

  public findSplAccount(splAccountId: PublicKey): AccountInfo | undefined {
    const key = splAccountId.toString();
    return this.bySplAccountId.get(key);
  }

  public getSplAccountByMintId(mintId: PublicKey): AccountInfo {
    const result = this.findSplAccountByMintId(mintId);
    if (!result) {
      throw new Error(`No account for mint ${mintId}`);
    }

    return result;
  }

  public findSplAccountByMintId(mintId: PublicKey): AccountInfo | undefined {
    const accounts = this.accounts
      .filter(account => account.mint.equals(mintId))
      .sort((a, b) => -a.amount.cmp(b.amount));
    return accounts[0];
  }
}