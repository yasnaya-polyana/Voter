import { keyStores, connect, WalletConnection } from 'near-api-js';

export const nearConfig = {
  networkId: process.env.NEXT_PUBLIC_NEAR_NETWORK || 'testnet',
  nodeUrl: process.env.NEXT_PUBLIC_NEAR_NODE_URL || 'https://rpc.testnet.near.org',
  walletUrl: process.env.NEXT_PUBLIC_NEAR_WALLET_URL || 'https://testnet.mynearwallet.com',
  helperUrl: process.env.NEXT_PUBLIC_NEAR_HELPER_URL || 'https://helper.testnet.near.org',
  contractName: process.env.NEXT_PUBLIC_NEAR_CONTRACT_NAME || 'yasn88.testnet',
  explorerUrl: 'https://explorer.testnet.near.org',
  GAS: '300000000000000', // 300 TGas
  attachedDeposit: '0' // Amount of NEAR to attach (if needed)
};

export async function initNear() {
  try {
    // Create a keyStore for browser local storage
    const keyStore = new keyStores.BrowserLocalStorageKeyStore();

    // Initialize connection to the NEAR network
    const near = await connect({
      keyStore,
      ...nearConfig,
      headers: {}
    });

    // Initialize wallet connection
    const wallet = new WalletConnection(near, 'vote-app');

    return {
      near,
      wallet,
      connected: wallet.isSignedIn(),
      accountId: wallet.getAccountId()
    };
  } catch (error) {
    console.error('Failed to initialize NEAR:', error);
    return {
      near: null,
      wallet: null,
      connected: false,
      accountId: null
    };
  }
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