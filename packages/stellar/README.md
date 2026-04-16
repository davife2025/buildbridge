# @buildbridge/stellar

Stellar & Soroban integration layer for BuildBridge.

## Modules

### `wallet.ts` — Freighter browser wallet
```ts
import { connectWallet, signTransaction, shortenPublicKey } from '@buildbridge/stellar';

// Connect
const { publicKey, network } = await connectWallet();

// Sign a transaction XDR
const { signedXdr } = await signTransaction(unsignedXdr, 'testnet');

// Display
console.log(shortenPublicKey(publicKey)); // "GABC...WXYZ"
```

### `horizon.ts` — Horizon API helpers
```ts
import { getAccount, isAccountFunded, submitTransaction } from '@buildbridge/stellar';

const funded = await isAccountFunded(publicKey, 'testnet');
const txHash = await submitTransaction(signedXdr, 'testnet');
```

### `contracts/milestone.ts` — MilestoneTracker client
```ts
import { createMilestoneContract } from '@buildbridge/stellar';

const contract = createMilestoneContract('testnet');

// Record a milestone (Session 5: real Soroban call)
const { txHash, onChainId } = await contract.recordMilestone({
  founderPublicKey: publicKey,
  title: 'Launched beta with 500 users',
  category: 'traction',
});

// Fetch milestones
const milestones = await contract.getMilestones(publicKey);
```

## Environment Variables

```env
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
MILESTONE_CONTRACT_ID=<deployed contract id>
```
