import type { WalletConnection, SignedTransaction, StellarNetwork } from './types';

/**
 * Checks if the Freighter extension is installed in the browser.
 */
export function isFreighterInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as unknown as Record<string, unknown>)['freighter']);
}

/**
 * Connects to the Freighter wallet and returns the public key + network.
 * Throws if Freighter is not installed or access is denied.
 */
export async function connectWallet(): Promise<WalletConnection> {
  if (!isFreighterInstalled()) {
    throw new Error(
      'Freighter wallet is not installed. Please install the Freighter browser extension from freighter.app',
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const freighter = (window as any).freighter;

  try {
    const publicKey = (await freighter.getPublicKey()) as string;
    const networkDetails = (await freighter.getNetworkDetails()) as {
      network: string;
      networkPassphrase: string;
    };

    const network: StellarNetwork = networkDetails.network
      .toLowerCase()
      .includes('test')
      ? 'testnet'
      : 'mainnet';

    return { publicKey, network };
  } catch (err) {
    throw new Error(
      `Failed to connect Freighter wallet: ${err instanceof Error ? err.message : 'Unknown error'}`,
    );
  }
}

/**
 * Signs a Stellar transaction XDR using Freighter.
 * Returns the signed XDR string.
 */
export async function signTransaction(
  unsignedXdr: string,
  network: StellarNetwork = 'testnet',
): Promise<SignedTransaction> {
  if (!isFreighterInstalled()) {
    throw new Error('Freighter wallet is not installed.');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const freighter = (window as any).freighter;

  try {
    const publicKey = (await freighter.getPublicKey()) as string;
    const signedXdr = (await freighter.signTransaction(unsignedXdr, {
      network: network === 'testnet' ? 'TESTNET' : 'PUBLIC',
    })) as string;

    return { signedXdr, publicKey };
  } catch (err) {
    throw new Error(
      `Failed to sign transaction: ${err instanceof Error ? err.message : 'User rejected'}`,
    );
  }
}

/**
 * Disconnects from Freighter (clears local session state).
 * Note: Freighter does not expose a true disconnect API — this is a UI-level clear.
 */
export function disconnectWallet(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('bb_wallet_key');
    window.localStorage.removeItem('bb_wallet_network');
  }
}

/**
 * Returns a shortened display version of a Stellar public key.
 * e.g. "GABC...WXYZ"
 */
export function shortenPublicKey(key: string, chars = 4): string {
  if (key.length <= chars * 2 + 3) return key;
  return `${key.slice(0, chars)}...${key.slice(-chars)}`;
}
