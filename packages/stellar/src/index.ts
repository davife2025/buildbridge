// Wallet
export {
  connectWallet,
  disconnectWallet,
  signTransaction,
  isFreighterInstalled,
  shortenPublicKey,
} from './wallet';

// Horizon
export { getHorizonServer, getAccount, isAccountFunded, submitTransaction } from './horizon';

// Contracts
export { MilestoneContract, createMilestoneContract } from './contracts/milestone';

// Types
export type {
  StellarNetwork,
  WalletConnection,
  SignedTransaction,
  MilestoneRecord,
  ContractConfig,
} from './types';
