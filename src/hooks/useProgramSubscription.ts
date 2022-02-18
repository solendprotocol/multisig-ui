import { Provider } from '@project-serum/anchor';
import { KeyedAccountInfo } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { GetProgramAccountsFilter } from '@solana/web3.js';
import { useEffect, useState } from 'react';

export function useProgramSubscription<T>(
  getProgramId: (context: Provider) => PublicKey,
  getFilters: (provider: Provider) => GetProgramAccountsFilter[],
  parse: (raw: KeyedAccountInfo) => T,
  provider: Provider,
): [T[], () => Promise<T[]>, boolean] {
  const [results, setResults] = useState<T[]>([]);
  const [reload, setReload] = useState<() => Promise<T[]>>(
    () => () => Promise.resolve([]),
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const programId = getProgramId(provider);
    const filters = getFilters(provider);
    const connection = provider.connection;
    const cache = new Map<string, T>();

    if (!programId) {
      return;
    }

    const onLoad = () => {
      setIsLoading(true);
      return connection
        .getProgramAccounts(programId, { filters })
        .then(rawAccounts => {
          for (const raw of rawAccounts) {
            const parsed = parse({
              accountId: raw.pubkey,
              accountInfo: raw.account
            });
            cache.set(raw.pubkey.toBase58(), parsed);
          }
          const values = Array.from(cache.values());
          setResults(values);
          return values;
        })
        .finally(() => setIsLoading(false));
    };
    setReload(() => onLoad);
    onLoad()
      .then(values => {
        console.log(
          `Fetched ${values.length} accounts for program ${programId}.`,
        );
      })
      .catch(() => {
        console.error(
          'Connection Failed',
          `Failed to fetch accounts for program ${programId}`,
        );
      });

    const sub = connection.onProgramAccountChange(
      programId,
      info => {
        const parsed = parse(info);
        cache.set(info.accountId.toBase58(), parsed);
        setResults(Array.from(cache.values()));
      },
      'singleGossip',
      filters,
    );

    return () => {
      cache.clear();
      setResults([]);
      setReload(() => () => Promise.resolve([]));

      connection.removeProgramAccountChangeListener(sub).then(() => {
        console.log(`Subscription ${programId} terminated.`);
      });
    };
  }, [getFilters, getProgramId, parse, provider]);

  return [results, reload, isLoading];
}