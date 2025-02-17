import { connect, keyStores, WalletConnection } from 'near-api-js';

export const nearConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  contractName: 'your-contract-name.testnet',
};

export async function initNear() {
  const near = await connect({
    deps: {
      keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    },
    ...nearConfig,
  });

  const wallet = new WalletConnection(near, null);
  return { near, wallet };
} 