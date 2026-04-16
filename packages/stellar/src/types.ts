export type StellarNetwork = 'testnet' | 'mainnet';

export interface WalletConnection {
  publicKey: string;
  network: StellarNetwork;
}

export interface SignedTransaction {
  signedXdr: string;
  publicKey: string;
}

export interface MilestoneRecord {
  id: number;
  founderPublicKey: string;
  title: string;
  category: string;
  timestamp: number;
  txHash: string;
}

export interface ContractConfig {
  contractId: string;
  network: StellarNetwork;
  rpcUrl: string;
}
