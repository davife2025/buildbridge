import { Horizon } from '@stellar/stellar-sdk';
import type { StellarNetwork } from './types';

const HORIZON_URLS: Record<StellarNetwork, string> = {
  testnet: 'https://horizon-testnet.stellar.org',
  mainnet: 'https://horizon.stellar.org',
};

/**
 * Returns a configured Horizon server instance.
 */
export function getHorizonServer(network: StellarNetwork = 'testnet'): Horizon.Server {
  const url = process.env['STELLAR_HORIZON_URL'] ?? HORIZON_URLS[network];
  return new Horizon.Server(url);
}

/**
 * Fetches basic account info from Horizon.
 * Returns null if the account does not exist (unfunded).
 */
export async function getAccount(
  publicKey: string,
  network: StellarNetwork = 'testnet',
): Promise<Horizon.AccountResponse | null> {
  try {
    const server = getHorizonServer(network);
    return await server.loadAccount(publicKey);
  } catch {
    return null;
  }
}

/**
 * Checks whether a Stellar account is funded (exists on-chain).
 */
export async function isAccountFunded(
  publicKey: string,
  network: StellarNetwork = 'testnet',
): Promise<boolean> {
  const account = await getAccount(publicKey, network);
  return account !== null;
}

/**
 * Submits a signed XDR transaction to Horizon.
 * Returns the transaction hash on success.
 */
export async function submitTransaction(
  signedXdr: string,
  network: StellarNetwork = 'testnet',
): Promise<string> {
  const { TransactionBuilder } = await import('@stellar/stellar-sdk');
  const server = getHorizonServer(network);
  const tx = TransactionBuilder.fromXDR(
    signedXdr,
    network === 'testnet'
      ? 'Test SDF Network ; September 2015'
      : 'Public Global Stellar Network ; September 2015',
  );
  const result = await server.submitTransaction(tx);
  return result.hash;
}
