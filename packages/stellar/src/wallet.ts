/**
 * Freighter wallet integration for BuildBridge
 * Handles wallet connect, disconnect, and transaction signing
 */

export interface WalletConnection {
  publicKey: string;
  network: 'testnet' | 'mainnet';
}

export async function connectWallet(): Promise<WalletConnection> {
  // @ts-ignore
  if (typeof window === 'undefined' || !window.freighter) {
    throw new Error('Freighter wallet not installed. Please install the Freighter browser extension.');
  }
  // @ts-ignore
  const publicKey = await window.freighter.getPublicKey();
  // @ts-ignore
  const network = await window.freighter.getNetwork();

  return {
    publicKey,
    network: network.toLowerCase() as 'testnet' | 'mainnet',
  };
}

export async function signTransaction(xdr: string): Promise<string> {
  // @ts-ignore
  const signedXdr = await window.freighter.signTransaction(xdr);
  return signedXdr;
}
