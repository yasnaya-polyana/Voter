import { KeyPair, keyStores } from 'near-api-js';
import { nearConfig } from './near-config';

// Get account credentials from environment variables
const ACCOUNT_ID = process.env.NEAR_ACCOUNT_ID || 'yasn.testnet';
const PRIVATE_KEY = process.env.NEAR_PRIVATE_KEY || '';

export async function getServerKeyStore() {
  const keyStore = new keyStores.InMemoryKeyStore();
  
  if (!PRIVATE_KEY) {
    console.error('NEAR_PRIVATE_KEY environment variable is not set');
    throw new Error('NEAR private key is not configured');
  }
  
  // Add the key pair to the key store
  const keyPair = KeyPair.fromString(PRIVATE_KEY);
  await keyStore.setKey(nearConfig.networkId, ACCOUNT_ID, keyPair);
  
  return keyStore;
}

export const serverNearConfig = {
  ...nearConfig,
  accountId: ACCOUNT_ID
}; 