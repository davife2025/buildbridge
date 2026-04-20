/**
 * Freighter wallet integration using @stellar/freighter-api
 *
 * Freighter API docs: https://docs.freighter.app/
 * The window.freighter approach is deprecated — use the npm package.
 */

// @ts-nocheck

import type { StellarNetwork, WalletConnection, SignedTransaction } from './types';
const isBrowser = typeof window !== 'undefined';

// ─── Detection ────────────────────────────────────────────

/**
 * Checks whether the Freighter extension is installed.
 * Works in both browser and SSR contexts.
 */
export async function isFreighterInstalled(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const { isConnected } = await import('@stellar/freighter-api');
    const result = await isConnected();
    return result.isConnected;
  } catch {
    // Fallback: check window object
    return Boolean((window as Record<string, unknown>)['freighter']);
  }
}

// ─── Connect ─────────────────────────────────────────────

/**
 * Requests access to the Freighter wallet.
 * Returns the public key and network.
 */
export async function connectWallet(): Promise<WalletConnection> {
  try {
    const { requestAccess, getNetworkDetails } = await import('@stellar/freighter-api');

    // Request access — prompts the user to approve
    const accessResult = await requestAccess();
    if (accessResult.error) {
      throw new Error(accessResult.error);
    }

    const publicKey = accessResult.address;
    if (!publicKey) throw new Error('No public key returned from Freighter');

    // Get network
    const networkResult = await getNetworkDetails();
    if (networkResult.error) {
      throw new Error(networkResult.error);
    }

    const network: StellarNetwork = networkResult.networkPassphrase?.includes('Test')
      ? 'testnet'
      : 'mainnet';

    return { publicKey, network };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to connect wallet';
    if (msg.includes('not installed') || msg.includes('No such method')) {
      throw new Error(
        'Freighter wallet not found. Please install it from freighter.app and reload the page.',
      );
    }
    throw new Error(msg);
  }
}

// ─── Sign message ─────────────────────────────────────────

/**
 * Signs a plain-text message (used for auth challenge).
 * Returns hex-encoded signature.
 */
export async function signMessage(
  message: string,
  publicKey: string,
): Promise<string> {
  try {
    const { signMessage: freighterSignMessage, getNetworkDetails } = await import('@stellar/freighter-api');

    const networkResult = await getNetworkDetails();
    const networkPassphrase = networkResult.networkPassphrase ?? 'Test SDF Network ; September 2015';

    const result = await freighterSignMessage(message, {
      accountToSign: publicKey,
      networkPassphrase,
    });

    if (result.error) throw new Error(result.error);
    return result.signedMessage ?? '';
  } catch (err) {
    throw new Error(
      `Failed to sign message: ${err instanceof Error ? err.message : 'User rejected'}`,
    );
  }
}

// ─── Sign transaction ─────────────────────────────────────

/**
 * Signs a Stellar transaction XDR using Freighter.
 */
export async function signTransaction(
  unsignedXdr: string,
  network: StellarNetwork = 'testnet',
): Promise<SignedTransaction> {
  try {
    const { signTransaction: freighterSignTx, getPublicKey } = await import('@stellar/freighter-api');

    const networkPassphrase =
      network === 'testnet'
        ? 'Test SDF Network ; September 2015'
        : 'Public Global Stellar Network ; September 2015';

    const pkResult = await getPublicKey();
    if (pkResult.error) throw new Error(pkResult.error);
    const publicKey = pkResult.publicKey;

    const result = await freighterSignTx({
      xdr: unsignedXdr,
      networkPassphrase,
      accountToSign: publicKey,
    });

    if (result.error) throw new Error(result.error);

    return { signedXdr: result.signedTxXdr ?? '', publicKey };
  } catch (err) {
    throw new Error(
      `Failed to sign transaction: ${err instanceof Error ? err.message : 'User rejected'}`,
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────

export function disconnectWallet(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('bb_token');
    window.localStorage.removeItem('bb_wallet');
  }
}

export function shortenPublicKey(key: string, chars = 4): string {
  if (key.length <= chars * 2 + 3) return key;
  return `${key.slice(0, chars)}...${key.slice(-chars)}`;
}
