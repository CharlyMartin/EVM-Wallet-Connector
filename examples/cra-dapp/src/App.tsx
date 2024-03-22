import {
  useAccounts,
  useDisconnect,
  useConnectUI,
  useIsConnected
} from '@fuel-wallet/react';
import { useEffect } from 'react';

import Counter, { COUNTER_CONTRACT_ID } from './components/counter';
import Account from './components/account';
import Balance from './components/balance';
import Transfer from './components/transfer';

export default function App() {
  const { connect, theme, setTheme, isConnecting } = useConnectUI();
  const { disconnect } = useDisconnect();
  const { isConnected, refetch, isFetching } = useIsConnected();
  const { accounts } = useAccounts();

  const lightTheme = theme === 'light';

  useEffect(() => {
    refetch();
  }, [refetch, isConnected, isFetching]);

  return (
    <main
      data-theme={theme}
      className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900"
    >
      {/* Top */}
      <nav id="nav" className="flex items-center justify-between px-12 py-6">
        <img
          src={lightTheme ? './logo_black.png' : './logo_white.png'}
          alt="Fuel Logo"
          className="w-32"
        />
        <button
          onClick={() => setTheme(lightTheme ? 'dark' : 'light')}
          className="size-12 rounded-full bg-gray-100 dark:bg-gray-800"
        >
          {lightTheme ? '🌙' : '☀️'}
        </button>
      </nav>

      {/* Main */}
      <div className="flex h-full min-w-full items-center justify-center text-gray-900 dark:text-gray-50">
        <div id="container" className="w-[56rem]">
          <div id="grid" className="grid grid-cols-2 grid-rows-1">
            <div id="text" className="p-8 pr-16">
              <h1 className="pb-1 text-4xl font-semibold">Metamask Demo</h1>
              <p>
                Fuel enables developers to build integrations with any wallet.
              </p>
              <br />
              <ul className="list-inside list-disc">
                <li>Reduce friction for users</li>
                <li>Build using any signature scheme</li>
                <li>Use predicates, a new type of stateless smart contract</li>
              </ul>
              <br />
              <a href="#" className="text-emerald-500 hover:underline">
                Build your own wallet integration
              </a>
            </div>

            <div className="rounded bg-white shadow-sm dark:bg-gray-800">
              {!isConnected && (
                <section className="flex h-full flex-col items-center justify-center p-8">
                  <h2 className="mb-4 text-lg font-medium">
                    Test the Metamask connector
                  </h2>
                  <button className="btn btn-primary" onClick={() => connect()}>
                    {isConnecting ? 'Connecting' : 'Connect Metamask'}
                  </button>
                  {isConnected && (
                    <button onClick={() => disconnect()}>Disconnect</button>
                  )}
                </section>
              )}

              {isConnected && (
                <section className="space-y-3 p-8">
                  <Account address={accounts[0]} />
                  <Balance address={accounts[0]} />
                  <Counter address={accounts[0]} />
                  <Transfer address={accounts[0]} />
                </section>
              )}
            </div>
          </div>
          <div className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400">
            {isConnected && (
              <p>
                The counter contract is deployed to the address below:
                <br />
                <code>{COUNTER_CONTRACT_ID}</code>.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
