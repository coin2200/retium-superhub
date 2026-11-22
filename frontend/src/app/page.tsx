"use client";
import { useState } from "react";

const CONTRACT_ID = "cb7cf3a5cf5e5e46c08776cfe49d5849870a695c7bd502d082fadb68c4f601ed";
const RPC_URL = "https://retium.org";

export default function RetiumSuperHub() {
  const [activeTab, setActiveTab] = useState("transfer");
  const [walletAddr, setWalletAddr] = useState("");
  const [connected, setConnected] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [tokenType, setTokenType] = useState("RTM");
  const [amount, setAmount] = useState("");
  const [dealId, setDealId] = useState("");
  const [orderSide, setOrderSide] = useState("BUY");
  const [limitPrice, setLimitPrice] = useState("0.50");
  const [orderAmount, setOrderAmount] = useState("");
  const [activeOrder, setActiveOrder] = useState("No active orders");
  const [vaultBalance, setVaultBalance] = useState("0");
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    const p = (window as any).retium;
    if (!p) return setStatus("Web Wallet Mode: Enter your rete... address above.");
    try {
      const acc = await p.request({ method: "rtm_requestAccounts" });
      if (acc?.length) { setWalletAddr(acc); setConnected(true); setStatus(`Connected: ${acc}`); }
    } catch (e: any) { setStatus(`Error: ${e.message}`); }
  };

  const sendRealTokens = async () => {
    if (!recipient || !amount) return alert("Enter receiver address and amount!");
    const p = (window as any).retium;
    if (!p) return setStatus(`CLI: retium transfer ${recipient} ${amount} --asset ${tokenType}`);
    try {
      const tx = await p.request({ method: "rtm_sendTransaction", params: [{ type: "transfer", to: recipient, amount, asset: tokenType }] });
      setStatus(`Sent! Tx ID: ${tx}`);
    } catch (e: any) { setStatus(`Error: ${e.message}`); }
  };

  const callContract = async (action: string, args: string[]) => {
    const p = (window as any).retium;
    if (!p) return setStatus(`CLI: retium call ${CONTRACT_ID} ${action} ${args.map(a => `"${a}"`).join(" ")} --fee RTD`);
    try {
      const tx = await p.request({ method: "rtm_sendTransaction", params: [{ contractId: CONTRACT_ID, action, args }] });
      setStatus(`Confirmed on Testnet! Tx ID: ${tx}`);
    } catch (e: any) { setStatus(`Error: ${e.message}`); }
  };

  const queryChain = async (action: string, args: string[], setter: (v: string) => void) => {
    setStatus("Syncing with Retium Testnet node...");
    try {
      const res = await fetch(`${RPC_URL}/query`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contract_id: CONTRACT_ID, action, args }) });
      const data = await res.json();
      setter(data.data || data.result || "0");
      setStatus("Synced with latest block state.");
    } catch { setStatus("RPC query dispatched."); }
  };
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[220px] bg-emerald-500/10 blur-[110px] pointer-events-none" />

      <nav className="relative z-10 border-b border-zinc-800/80 bg-[#050508]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 p-[1px]">
              <div className="w-full h-full bg-[#050508] rounded-[7px] flex items-center justify-center font-bold text-emerald-400 text-sm">R</div>
            </div>
            <span className="font-semibold tracking-tight text-lg text-white">Retium <span className="text-zinc-400 font-normal">SuperHub</span></span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Testnet
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="rete... address" value={walletAddr} onChange={(e) => setWalletAddr(e.target.value)} className="bg-zinc-900/90 border border-zinc-800 focus:border-emerald-500/50 outline-none px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-200 w-36 sm:w-56" />
            <button onClick={connectWallet} className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border ${connected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-white text-black hover:bg-zinc-200 border-transparent"}`}>{connected ? "Connected" : "Connect"}</button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-xs font-mono text-zinc-400">
          <span>WASM CONTRACT</span>
          <span className="text-zinc-200">{CONTRACT_ID.slice(0, 14)}...{CONTRACT_ID.slice(-10)}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 mb-6">
          {[{ id: "transfer", label: "Pay & Escrow" }, { id: "whisk", label: "Whisk DEX" }, { id: "vault", label: "Safe Vault" }, { id: "vip", label: "VIP Pass" }].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`py-2 rounded-lg text-xs font-medium transition ${activeTab === t.id ? "bg-zinc-800 text-white border border-zinc-700/70" : "text-zinc-400 hover:text-zinc-200"}`}>{t.label}</button>
          ))}
        </div>

        <main className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-2xl space-y-5">
          {activeTab === "transfer" && (<>
            <div className="flex justify-between items-center">
              <div><h2 className="text-base font-semibold text-white">Transfer & Smart Escrow</h2><p className="text-xs text-zinc-400">Instant post-quantum settlement on Retium</p></div>
              <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                {["RTM", "RTD"].map((tok) => (<button key={tok} onClick={() => setTokenType(tok)} className={`px-3 py-1 rounded text-xs font-mono font-medium ${tokenType === tok ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-zinc-500"}`}>{tok}</button>))}
              </div>
            </div>
            <input type="text" placeholder="Recipient address (rete...)" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full bg-zinc-950/90 border border-zinc-800 focus:border-emerald-500/50 outline-none p-3 rounded-xl text-sm font-mono" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="number" placeholder={`Amount (${tokenType})`} value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-zinc-950/90 border border-zinc-800 focus:border-emerald-500/50 outline-none p-3 rounded-xl text-sm font-mono" />
              <input type="text" placeholder="Escrow Deal ID (optional)" value={dealId} onChange={(e) => setDealId(e.target.value)} className="bg-zinc-950/90 border border-zinc-800 focus:border-emerald-500/50 outline-none p-3 rounded-xl text-sm font-mono" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={sendRealTokens} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2.5 rounded-xl text-sm">Send {tokenType}</button>
              <button onClick={() => callContract("create_escrow", [dealId || "deal_1", recipient, tokenType, amount])} className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-medium py-2.5 rounded-xl text-sm">Lock in Escrow</button>
            </div>
          </>)}
          {activeTab === "whisk" && (<>
            <div className="flex justify-between items-center">
              <div><h2 className="text-base font-semibold text-white">Whisk DEX Orderbook</h2><p className="text-xs text-zinc-400">Pair: RTM / RTD • On-Chain Limit Execution</p></div>
              <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                {["BUY", "SELL"].map((s) => (<button key={s} onClick={() => setOrderSide(s)} className={`px-3 py-1 rounded text-xs font-mono font-semibold ${orderSide === s ? (s === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400") : "text-zinc-500"}`}>{s}</button>))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="0.01" placeholder="Price (RTD)" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl text-sm font-mono" />
              <input type="number" placeholder="Amount (RTM)" value={orderAmount} onChange={(e) => setOrderAmount(e.target.value)} className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl text-sm font-mono" />
            </div>
            <div className="bg-zinc-950/90 border border-zinc-800 p-3.5 rounded-xl text-xs flex justify-between font-mono">
              <span className="text-zinc-500">ACTIVE ORDER</span><span className="text-cyan-400">{activeOrder}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => callContract("place_whisk_order", [walletAddr || "my_user", "RTM/RTD", orderSide, limitPrice, orderAmount])} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${orderSide === "BUY" ? "bg-emerald-500 text-black" : "bg-rose-500 text-white"}`}>Place {orderSide} Order</button>
              <button onClick={() => queryChain("get_whisk_order", [walletAddr || "my_user"], setActiveOrder)} className="px-4 bg-zinc-800 border border-zinc-700 rounded-xl text-xs">Sync</button>
            </div>
          </>)}

          {activeTab === "vault" && (<>
            <div className="flex justify-between items-center bg-zinc-950/90 border border-zinc-800 p-4 rounded-xl">
              <div><span className="text-xs text-zinc-500 block font-mono">VAULT LOCKED BALANCE</span><span className="text-2xl font-bold font-mono text-emerald-400">{vaultBalance} <span className="text-xs text-zinc-400">RTM/RTD</span></span></div>
              <button onClick={() => queryChain("get_vault", [walletAddr || "my_user"], setVaultBalance)} className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono">Refresh</button>
            </div>
            <input type="number" placeholder="Amount to lock in vault" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl text-sm font-mono" />
            <button onClick={() => callContract("deposit_vault", [walletAddr || "my_user", amount])} className="w-full bg-emerald-500 text-black py-2.5 rounded-xl text-sm font-semibold">Deposit into Vault</button>
          </>)}

          {activeTab === "vip" && (<>
            <div><h2 className="text-base font-semibold text-white">Post-Quantum VIP Whitelist</h2><p className="text-xs text-zinc-400">Register your ML-DSA-44 address on-chain for zero-fee protocol access.</p></div>
            <button onClick={() => callContract("set_vip", [walletAddr || "my_user"])} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black py-2.5 rounded-xl text-sm font-semibold">Activate VIP Status</button>
          </>)}

          {status && <div className="p-3.5 bg-zinc-950 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-400 break-all">{status}</div>}
        </main>

        <footer className="mt-8 text-center text-[11px] font-mono text-zinc-500">Secured by ML-DSA-44 Post-Quantum Signatures • Built on Retium Chain</footer>
      </div>
    </div>
  );
}
