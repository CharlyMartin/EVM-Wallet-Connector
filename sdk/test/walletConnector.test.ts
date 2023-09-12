import chai, { assert, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { ethers } from 'hardhat';
import { EVMWalletConnector } from '../src/index';
import {
  FuelWalletConnection,
  FuelWalletLocked,
  FuelWalletProvider
} from '@fuel-wallet/sdk';
import { JsonRpcProvider } from 'ethers';
import { readFileSync } from 'fs';
import { hexlify } from '@ethersproject/bytes';
import { InputValue, Predicate } from 'fuels';

chai.use(chaiAsPromised);

describe('EVM Wallet Connector', () => {
  // Providers used to interact with wallets
  let ethProvider: JsonRpcProvider;
  let fuelProvider: FuelWalletProvider;

  // Our connector bridging MetaMask and predicate accounts
  let connector: EVMWalletConnector;

  // Accounts from hardhat used to determine predicate accounts
  let ethAccount1: string;
  let ethAccount2: string;

  // Predicate accounts associated with the ethereum accounts
  let predicateAccount1: string;
  let predicateAccount2: string;

  async function createPredicate(): Promise<Predicate<InputValue[]>> {
    let filePathBin = '../simple-predicate/out/debug/simple-predicate.bin';
    let filePathABI = '../simple-predicate/out/debug/simple-predicate-abi.json';
    let predicateBinary = hexlify(readFileSync(filePathBin));
    let predicateABI = JSON.parse(readFileSync(filePathABI, 'utf-8'));

    const chainId = await fuelProvider.getChainId();
    const predicate = new Predicate(
      predicateBinary,
      chainId,
      predicateABI,
      fuelProvider
    );

    return predicate;
  }

  async function setPredicateAccount(
    predicate: Predicate<InputValue[]>,
    ethAccount: string,
    predicateAccount: string
  ) {
    let configurable = { SIGNER: ethAccount };
    predicate.setData(configurable.SIGNER);
    predicateAccount = predicate.address.toAddress();
  }

  before(async () => {
    // Fetch the signing accounts from hardhat
    let signers = await ethers.getSigners();
    ethAccount1 = signers.pop()!.address;
    ethAccount2 = signers.pop()!.address;

    // Setting the providers once should not cause issues
    // Create the Ethereum provider
    ethProvider = new ethers.JsonRpcProvider();

    // Create the Fuel provider
    let walletConnection = new FuelWalletConnection({
      name: 'EVM-Wallet-Connector'
    });
    fuelProvider = new FuelWalletProvider(
      'https://beta-4.fuel.network/graphql',
      walletConnection
    );

    // Create the predicate and calculate the address for each Ethereum account
    let predicate = await createPredicate();
    await setPredicateAccount(predicate, ethAccount1, predicateAccount1);
    await setPredicateAccount(predicate, ethAccount2, predicateAccount2);
  });

  beforeEach(() => {
    // Class contains state, reset the state for each test
    connector = new EVMWalletConnector(ethProvider, fuelProvider);
  });

  describe('connect()', () => {
    it('connects to ethers signer', async () => {
      let isNull = connector.ethSigner;
      let connected = await connector.connect();
      let isNotNull = connector.ethSigner;

      expect(isNull).to.be.null;
      expect(connected).to.be.true;
      expect(isNotNull).to.not.be.null;
    });
  });

  describe('isConnected()', () => {
    it('false when not connected', async () => {
      let connected = await connector.isConnected();

      expect(connected).to.be.false;
    });

    it('true when connected', async () => {
      await connector.connect();
      let connected = await connector.isConnected();

      expect(connected).to.be.true;
    });
  });

  describe('disconnect()', () => {
    it('disconnects from ethers signer', async () => {
      await connector.connect();

      let isNotNull = connector.ethSigner;
      let connected = await connector.disconnect();
      let isNull = connector.ethSigner;

      expect(isNotNull).to.not.be.null;
      expect(connected).to.be.true;
      expect(isNull).to.be.null;
    });
  });

  describe('accounts()', () => {
    it('returns the predicate accounts associated with the wallet', async () => {
      await connector.connect();

      let predicateAccounts = await connector.accounts();
      let acc1 = predicateAccounts.pop();
      let acc2 = predicateAccounts.pop();

      expect(acc1).to.be.equal(predicateAccount1);
      expect(acc2).to.be.equal(predicateAccount2);
    });
  });

  describe('currentAccount()', () => {
    it('returns the predicate account associated with the current signer account', async () => {
      await connector.connect();

      let account = await connector.currentAccount();

      expect(account).to.be.equal(predicateAccount1);
    });
  });

  describe('signMessage()', () => {
    it('throws error', async () => {
      await expect(
        connector.signMessage('address', 'message')
      ).to.be.rejectedWith('Not Implemented.');
    });
  });

  xit('sendTransaction()', () => {
    assert.equal(true, false);
  });

  describe('assets()', () => {
    it('returns an empty array', async () => {
      expect(await connector.assets()).to.deep.equal([]);
    });
  });

  describe('addAsset()', () => {
    it('returns false', async () => {
      expect(await connector.addAsset({ assetId: '' })).to.be.false;
    });
  });

  describe('addAssets()', () => {
    it('returns false', async () => {
      expect(await connector.addAssets([])).to.be.false;
    });
  });

  describe('getWallet()', () => {
    it('returns a predicate wallet', async () => {
      let wallet = await connector.getWallet(ethAccount1);

      expect(wallet).to.be.equal(
        new FuelWalletLocked(predicateAccount1, fuelProvider)
      );
    });

    it('throws error for invalid address', async () => {
      await expect(connector.getWallet('0x123')).to.be.rejectedWith(
        'Invalid account'
      );
    });
  });

  describe('getProvider()', () => {
    it('returns the fuel provider', async () => {
      expect(await connector.getProvider()).to.be.equal(fuelProvider);
    });
  });

  describe('addAbi()', () => {
    it('returns false', async () => {
      expect(await connector.addAbi({})).to.be.false;
    });
  });

  describe('getAbi()', () => {
    it('throws error', async () => {
      await expect(connector.getAbi('contractId')).to.be.rejectedWith(
        'Cannot get ABI'
      );
    });
  });

  describe('hasAbi()', () => {
    it('returns false', async () => {
      expect(await connector.hasAbi('contractId')).to.be.false;
    });
  });

  describe('network()', () => {
    it('returns the fuel network info', async () => {
      let network = await connector.network();

      expect(network.id).to.be.equal(
        (await fuelProvider.getNetwork()).chainId.toString()
      );
      expect(network.url).to.be.equal(fuelProvider.url);
    });
  });

  describe('networks()', () => {
    it('returns an array of fuel network info', async () => {
      let networks = await connector.networks();
      let network = networks.pop();

      expect(network!.id).to.be.equal(
        (await connector.fuelProvider.getNetwork()).chainId.toString()
      );
      expect(network!.url).to.be.equal(fuelProvider.url);
    });
  });

  describe('addNetwork()', () => {
    it('throws error', async () => {
      await expect(
        connector.addNetwork({ name: '', url: '' })
      ).to.be.rejectedWith('Not Implemented.');
    });
  });
});
