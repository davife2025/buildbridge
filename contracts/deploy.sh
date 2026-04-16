#!/usr/bin/env bash
# BuildBridge — Deploy MilestoneTracker to Stellar
# Usage: ./contracts/deploy.sh [testnet|mainnet]
# Requires: Rust, stellar CLI, STELLAR_SECRET_KEY in env

set -euo pipefail

NETWORK="${1:-testnet}"
CONTRACT_DIR="contracts/milestone-tracker"
WASM_PATH="$CONTRACT_DIR/target/wasm32-unknown-unknown/release/milestone_tracker.wasm"

echo "🌉 BuildBridge — Deploying MilestoneTracker"
echo "   Network: $NETWORK"
echo ""

# ── 1. Build ──────────────────────────────────────────────
echo "📦 Building Soroban contract..."
cd "$CONTRACT_DIR"
cargo build --target wasm32-unknown-unknown --release 2>&1
cd ../..

echo "✅ Build complete: $WASM_PATH"
echo ""

# ── 2. Optimize (optional but recommended) ────────────────
if command -v stellar-contract-optimize &> /dev/null; then
  echo "⚡ Optimizing WASM..."
  stellar-contract-optimize --wasm "$WASM_PATH"
fi

# ── 3. Deploy ─────────────────────────────────────────────
echo "🚀 Deploying to $NETWORK..."

CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --network "$NETWORK" \
  --source "$STELLAR_SECRET_KEY")

echo ""
echo "✅ Contract deployed!"
echo "   Contract ID: $CONTRACT_ID"
echo ""
echo "📝 Add this to your .env:"
echo "   MILESTONE_CONTRACT_ID=$CONTRACT_ID"
echo ""
echo "🔍 View on Explorer:"
if [ "$NETWORK" = "testnet" ]; then
  echo "   https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
else
  echo "   https://stellar.expert/explorer/public/contract/$CONTRACT_ID"
fi
