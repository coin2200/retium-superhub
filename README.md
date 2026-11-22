# ⚡ Retium SuperHub — All-in-One Post-Quantum DeFi dApp

**Retium SuperHub** is a full-stack decentralized application built on the **Retium Chain Testnet** (powered by WebAssembly smart contracts and post-quantum ML-DSA-44 security).

🌐 **Live App:** [https://retium-superhub.vercel.app](https://retium-superhub.vercel.app)  
📜 **Deployed Contract ID:** `cb7cf3a5cf5e5e46c08776cfe49d5849870a695c7bd502d082fadb68c4f601ed`

---

## ✨ Key Features

1. **💸 Real RTM / RTD Transfer & Escrow:** Direct native token transfers and on-chain P2P escrow locking.
2. **📈 Whisk DEX Orderbook Integration:** Place and query on-chain `BUY` and `SELL` limit orders for the `RTM/RTD` pair.
3. **🛡️ Post-Quantum Safe Vault:** Lock and track tokens securely in on-chain storage.
4. **👑 VIP Pass Governance:** Register wallet addresses on-chain for zero-fee VIP access.

---

## 🏗️ Tech Stack

- **Smart Contracts:** Rust (`no_std`), `retium-contract` SDK, compiled to `wasm32-unknown-unknown`
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Deployment:** Retium Testnet & Vercel

---

## 🚀 Local Setup

### 1. Build Smart Contract
```bash
cd contracts
cargo build --release --target wasm32-unknown-unknown
```

### 2. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
