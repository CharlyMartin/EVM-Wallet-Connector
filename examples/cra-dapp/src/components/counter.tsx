import { useBalance, useWallet } from '@fuel-wallet/react';
import { useEffect, useState } from 'react';
import { useLogEvents } from '../hooks/use-log-events';
import { CounterContractAbi__factory } from '../contracts';
import { DEFAULT_AMOUNT } from './balance';

export const COUNTER_CONTRACT_ID =
  '0x0a46aafb83b387155222893b52ed12e5a4b9d6cd06770786f2b5e4307a63b65c';

type Props = { address: string };

export default function ContractCounter(props: Props) {
  const { address } = props;

  const { wallet } = useWallet(address);

  const { balance } = useBalance({ address: wallet?.address.toString() });
  const [isLoading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);

  const shouldShowCounter = wallet && balance?.gt(0);
  const hasBalance = balance && balance.gte(DEFAULT_AMOUNT);

  useLogEvents();

  useEffect(() => {
    if (!shouldShowCounter) return;
    getCount();
    const interval = setInterval(getCount, 5000);
    return () => clearInterval(interval);
  }, [shouldShowCounter]);

  if (!shouldShowCounter) return null;

  return (
    <div id="counter">
      <h3 className="text-sm font-medium text-gray-400/80">Counter Contract</h3>

      <div className="flex items-center justify-between">
        <code>{counter}</code>
        <button
          className="btn btn-primary"
          onClick={() => increment()}
          disabled={isLoading || !hasBalance}
        >
          {isLoading ? 'Incrementing...' : 'Increment '}
        </button>
      </div>
    </div>
  );

  async function increment() {
    if (wallet) {
      setLoading(true);
      const contract = CounterContractAbi__factory.connect(
        COUNTER_CONTRACT_ID,
        wallet
      );
      try {
        await contract.functions
          .increment()
          .txParams({ gasPrice: 1, gasLimit: 100_000 })
          .call();
      } catch (err) {
        console.log('error sending transaction...', err);
      } finally {
        setLoading(false);
      }
    }
  }

  async function getCount() {
    if (!wallet) return;

    const counterContract = CounterContractAbi__factory.connect(
      COUNTER_CONTRACT_ID,
      wallet!
    );
    try {
      const { value } = await counterContract.functions
        .count()
        .txParams({
          gasPrice: 1,
          gasLimit: 100_000
        })
        .simulate();
      setCounter(value.toNumber());
    } catch (error) {
      console.error(error);
    }
  }
}