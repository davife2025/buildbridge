import {
  Contract,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  Address as StellarAddress,
} from '@stellar/stellar-sdk';
import { rpc as SorobanRpc } from '@stellar/stellar-sdk';
import type { ContractConfig, MilestoneRecord, StellarNetwork } from '../types';

const NETWORK_PASSPHRASE: Record<StellarNetwork, string> = {
  testnet: Networks.TESTNET,
  mainnet: Networks.PUBLIC,
};

const RPC_URLS: Record<StellarNetwork, string> = {
  testnet: 'https://soroban-testnet.stellar.org',
  mainnet: 'https://soroban.stellar.org',
};

export class MilestoneContract {
  private config: ContractConfig;
  private server: SorobanRpc.Server;
  private contract: Contract;

  constructor(config: ContractConfig) {
    this.config = config;
    const rpcUrl = config.rpcUrl ?? RPC_URLS[config.network];
    this.server = new SorobanRpc.Server(rpcUrl, { allowHttp: false });
    this.contract = new Contract(config.contractId);
  }

  private get passphrase(): string {
    return NETWORK_PASSPHRASE[this.config.network];
  }

  private async buildTx(sourcePublicKey: string, method: string, args: unknown[]): Promise<string> {
    const account = await this.server.getAccount(sourcePublicKey);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.passphrase,
    })
      .addOperation(this.contract.call(method, ...args.map((a) => nativeToScVal(a))))
      .setTimeout(30)
      .build();

    const simResult = await this.server.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(simResult)) {
      throw new Error(`Contract simulation failed: ${simResult.error}`);
    }
    return SorobanRpc.assembleTransaction(tx, simResult).build().toXDR();
  }

  async submitAndConfirm(signedXdr: string): Promise<string> {
    const { TransactionBuilder: TB } = await import('@stellar/stellar-sdk');
    const tx = TB.fromXDR(signedXdr, this.passphrase);
    const sendResult = await this.server.sendTransaction(tx);

    if (sendResult.status === 'ERROR') {
      throw new Error(`Transaction rejected: ${JSON.stringify(sendResult.errorResult)}`);
    }

    const hash = sendResult.hash;
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const result = await this.server.getTransaction(hash);
      if (result.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) return hash;
      if (result.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
        throw new Error(`Transaction failed: ${hash}`);
      }
    }
    throw new Error(`Transaction timed out: ${hash}`);
  }

  async buildRecordMilestoneTx(params: {
    founderPublicKey: string;
    title: string;
    category: string;
  }): Promise<string> {
    return this.buildTx(params.founderPublicKey, 'record_milestone', [
      new StellarAddress(params.founderPublicKey),
      params.title,
      params.category,
    ]);
  }

  async submitRecordMilestone(signedXdr: string): Promise<{ txHash: string; onChainId: number }> {
    const txHash = await this.submitAndConfirm(signedXdr);
    const result = await this.server.getTransaction(txHash);
    let onChainId = 0;
    if (result.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS && result.returnValue) {
      onChainId = Number(scValToNative(result.returnValue));
    }
    return { txHash, onChainId };
  }

  async getFounderMilestoneIds(founderPublicKey: string): Promise<number[]> {
    const account = await this.server.getAccount(founderPublicKey);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.passphrase,
    })
      .addOperation(
        this.contract.call(
          'get_founder_milestone_ids',
          nativeToScVal(new StellarAddress(founderPublicKey)),
        ),
      )
      .setTimeout(30)
      .build();

    const simResult = await this.server.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(simResult) || !simResult.result?.retval) return [];
    return (scValToNative(simResult.result.retval) as bigint[]).map(Number);
  }

  async getMilestone(id: number, sourcePublicKey: string): Promise<MilestoneRecord | null> {
    try {
      const account = await this.server.getAccount(sourcePublicKey);
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.passphrase,
      })
        .addOperation(this.contract.call('get_milestone', nativeToScVal(BigInt(id))))
        .setTimeout(30)
        .build();

      const simResult = await this.server.simulateTransaction(tx);
      if (SorobanRpc.Api.isSimulationError(simResult) || !simResult.result?.retval) return null;

      const raw = scValToNative(simResult.result.retval) as Record<string, unknown>;
      return {
        id: Number(raw['id']),
        founderPublicKey: String(raw['founder']),
        title: String(raw['title']),
        category: String(raw['category']),
        timestamp: Number(raw['timestamp']),
        txHash: '',
      };
    } catch {
      return null;
    }
  }

  getExplorerUrl(txHash: string): string {
    const base =
      this.config.network === 'testnet'
        ? 'https://stellar.expert/explorer/testnet/tx'
        : 'https://stellar.expert/explorer/public/tx';
    return `${base}/${txHash}`;
  }

  getContractUrl(): string {
    const base =
      this.config.network === 'testnet'
        ? 'https://stellar.expert/explorer/testnet/contract'
        : 'https://stellar.expert/explorer/public/contract';
    return `${base}/${this.config.contractId}`;
  }
}

export function createMilestoneContract(network: StellarNetwork = 'testnet'): MilestoneContract {
  const contractId = process.env['MILESTONE_CONTRACT_ID'] ?? '';
  const rpcUrl = process.env['SOROBAN_RPC_URL'] ?? RPC_URLS[network];
  if (!contractId) {
    console.warn('[MilestoneContract] MILESTONE_CONTRACT_ID not set.');
  }
  return new MilestoneContract({ contractId, network, rpcUrl });
}
