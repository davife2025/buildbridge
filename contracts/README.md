# BuildBridge Soroban Smart Contracts

Rust-based Soroban contracts on Stellar.

## MilestoneTracker
- `record_milestone(founder, title, category)` — Record a milestone on-chain
- `get_milestones(founder)` — Fetch all milestones for a founder
- `verify_milestone(milestone_id)` — Community verification

## Deploy to Testnet
```bash
cargo build --target wasm32-unknown-unknown --release
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/milestone_tracker.wasm \
  --network testnet
```
