import { connect, keyStores, WalletConnection } from 'near-api-js';

export const nearConfig = {
  networkId: process.env.NEXT_PUBLIC_NEAR_NETWORK || 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  contractName: process.env.NEXT_PUBLIC_NEAR_CONTRACT_NAME || 'yasn.testnet',
  explorerUrl: 'https://explorer.testnet.near.org',
  GAS: '300000000000000', // 300 TGas
  attachedDeposit: '0' // Amount of NEAR to attach (if needed)
};

export async function initNear() {
  // Initialize connection to the NEAR testnet
  const near = await connect({
    deps: {
      keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    },
    headers: {},
    ...nearConfig,
  });

  // Initialize wallet connection
  const wallet = new WalletConnection(near, 'vote-app');
  
  return { near, wallet };
}

export function getErrorMessage(error: any): string {
  try {
    if (typeof error === 'string') return error;
    if (error.kind?.ExecutionError) return error.kind.ExecutionError;
    if (error.message) return error.message;
    return 'Something went wrong';
  } catch (e) {
    return 'Something went wrong';
  }
} 