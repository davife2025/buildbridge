import type { ContractConfig, MilestoneRecord } from '../types';

/**
 * BuildBridge MilestoneTracker Soroban Contract Client
 *
 * This is a typed client stub for the Soroban smart contract
 * that will be deployed in Session 5.
 *
 * The contract stores founder milestones on-chain, making them
 * immutably verifiable by investors without trusting a centralized DB.
 */
export class MilestoneContract {
  private config: ContractConfig;

  constructor(config: ContractConfig) {
    this.config = config;
  }

  /**
   * Records a new milestone on-chain.
   * Returns the Stellar transaction hash.
   *
   * Session 5: replace stub with real Soroban contract invocation.
   */
  async recordMilestone(params: {
    founderPublicKey: string;
    title: string;
    category: string;
    signedXdr?: string;
  }): Promise<{ txHash: string; onChainId: number }> {
    // TODO Session 5: build + submit Soroban contract invocation tx
    console.log('[MilestoneContract] recordMilestone — stub', {
      contractId: this.config.contractId,
      network: this.config.network,
      ...params,
    });
    // Stub return — replaced in Session 5
    return {
      txHash: 'stub_tx_hash_' + Date.now(),
      onChainId: Math.floor(Math.random() * 10000),
    };
  }

  /**
   * Fetches all milestones for a given founder from the contract.
   *
   * Session 5: replace stub with real Soroban ledger query.
   */
  async getMilestones(founderPublicKey: string): Promise<MilestoneRecord[]> {
    // TODO Session 5: query Soroban contract state
    console.log('[MilestoneContract] getMilestones — stub', {
      founderPublicKey,
      contractId: this.config.contractId,
    });
    return [];
  }

  /**
   * Returns the contract explorer URL for a given transaction.
   */
  getExplorerUrl(txHash: string): string {
    const base =
      this.config.network === 'testnet'
        ? 'https://stellar.expert/explorer/testnet/tx'
        : 'https://stellar.expert/explorer/public/tx';
    return `${base}/${txHash}`;
  }
}

/**
 * Factory: creates a MilestoneContract from env variables.
 */
export function createMilestoneContract(
  network: 'testnet' | 'mainnet' = 'testnet',
): MilestoneContract {
  const contractId = process.env['MILESTONE_CONTRACT_ID'] ?? '';
  const rpcUrl =
    process.env['SOROBAN_RPC_URL'] ??
    (network === 'testnet'
      ? 'https://soroban-testnet.stellar.org'
      : 'https://soroban.stellar.org');

  return new MilestoneContract({ contractId, network, rpcUrl });
}
