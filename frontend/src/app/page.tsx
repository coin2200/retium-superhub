"use client";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    retium?: {
      isRetium?: boolean;
      request: (args: { method: string; params?: any }) => Promise<any>;
      on?: (event: string, cb: (data: any) => void) => void;
    };
  }
}

const CONTRACT_ID = "cb7cf3a5cf5e5e46c08776cfe49d5849870a695c7bd502d082fadb68c4f601ed";

function toAtomic(s: string): string {
  const clean = s.trim() || "0";
  const [w, f = ""] = clean.split(".");
  return (BigInt(w || "0") * BigInt("1000000000000000000") + BigInt((f + "0".repeat(18)).slice(0, 18))).toString();
}

export default function RetiumSuperHub() {
  const [activeTab, setActiveTab] = useState("transfer");
  const [walletAddr, setWalletAddr] = useState("");
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [balances, setBalances] = useState({ rtm: "0.00", rtd: "0.00" });

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

  const syncBalances = async (addr: string) => {
    try {
      const res = await fetch("/api/retium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "balance", address: addr }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        const rtm = Number(json.data.balance_rtm || json.data.balance || 0).toFixed(2);
        const rtd = Number(json.data.tokens?.RTD || json.data.rtd || 0).toFixed(2);
        setBalances({ rtm, rtd });
      }
    } catch {}
  };

  useEffect(() => {
    window.retium?.on?.("accountsChanged", (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setWalletAddr(accounts[0]);
        setConnected(true);
        syncBalances(accounts[0]);
      } else {
        setWalletAddr("");
        setConnected(false);
        setBalances({ rtm: "0.00", rtd: "0.00" });
      }
    });
  }, []);

  const connectWallet = async () => {
    if (busy) return;
    const retium = window.retium;
    if (!retium) {
      setStatus("Retium SDK loading... please try again in a second.");
      return;
    }
    setBusy(true);
    setStatus("Opening Retium Wallet popup...");
    try {
      const res = await retium.request({ method: "retium_requestAccounts" });
      if (res?.address) {
        setWalletAddr(res.address);
        setConnected(true);
        setStatus(`Connected: ${res.address} — Syncing balances...`);
        await syncBalances(res.address);
        setStatus("Wallet connected to Retium Devnet! Live balances synced.");
      }
    } catch (e: any) {
      if (e?.code === 4001) setStatus("Connection cancelled by user.");
      else if (e?.code === 4100) window.open("https://retium.org", "_blank");
      else setStatus(`Wallet error: ${e?.message || "Could not connect"}`);
    } finally {
      setBusy(false);
    }
  };

  const sendRealTokens = async () => {
    if (!connected || !window.retium) return connectWallet();
    if (!recipient || !amount) return alert("Enter receiver address and amount!");
    if (busy) return;
    setBusy(true);
    setStatus(`Requesting wallet approval to send ${amount} ${tokenType}...`);
    try {
      const { txId } = await window.retium.request({
        method: "retium_sendTransfer",
        params: { to: recipient.trim(), amountAtomic: toAtomic(amount) },
      });
      setStatus(`Transfer Submitted! TxID: ${txId}`);
      await syncBalances(walletAddr);
    } catch (e: any) {
      setStatus(e?.code === 4001 ? "Transaction rejected." : `Error: ${e?.message || "Failed"}`);
    } finally {
      setBusy(false);
    }
  };

  const callContract = async (method: string, args: string[]) => {
    if (!connected || !window.retium) return connectWallet();
    if (busy) return;
    setBusy(true);
    setStatus(`Approve ${method} in Retium Wallet popup...`);
    try {
      const { txId } = await window.retium.request({
        method: "retium_call",
        params: { contractId: CONTRACT_ID, method, args, amountAtomic: "0" },
      });
      setStatus(`Contract Call Submitted (${method})! TxID: ${txId}`);
      await syncBalances(walletAddr);
    } catch (e: any) {
      setStatus(e?.code === 4001 ? "Rejected by user." : `Error: ${e?.message || "Failed"}`);
    } finally {
      setBusy(false);
    }
  };

  const queryChain = async (action: string, args: string[], setter: (v: string) => void) => {
    setStatus("Querying Retium Devnet...");
    try {
      const res = await fetch("/api/retium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "query", contract_id: CONTRACT_ID, action, args }),
      });
      const json = await res.json();
      setter(json.data?.data || json.data?.result || "0");
      setStatus("Synced with Devnet!");
    } catch { setStatus("RPC query completed."); }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 pointer-events-none" />
      <nav className="relative z-10 border-b border-zinc-800/80 bg-[#050508]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 p-[1px]">
              <div className="w-full h-full bg-[#050508] rounded-[7px] flex items-center justify-center font-bold text-emerald-400 text-sm">R</div>
            </div>
            <span className="font-semibold text-white tracking-tight">Retium SuperHub</span>
          </div>
          <div className="flex items-center gap-3">
            {connected && (
              <div className="hidden sm:flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-mono">
                <span className="text-emerald-400">{balances.rtm} RTM</span>
                <span className="text-zinc-600">|</span>
                <span className="text-cyan-400">{balances.rtd} RTD</span>
              </div>
            )}
            {connected ? (<div className="flex items-center gap-2"><span className="bg-zinc-900 border border-emerald-500/40 text-emerald-400 px-3 py-2 rounded-xl text-xs font-mono">{walletAddr.slice(0, 7)}...{walletAddr.slice(-4)}</span><button onClick={() => { setWalletAddr(""); setConnected(false); setBalances({ rtm: "0.00", rtd: "0.00" }); setStatus("Wallet disconnected."); }} className="bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 font-semibold px-3 py-2 rounded-xl text-xs font-mono transition">Disconnect</button></div>) : (<button onClick={connectWallet} disabled={busy} className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-xl text-xs font-mono transition">{busy ? "Connecting..." : "Connect Wallet"}</button>)}
          </div>
        </div>
      </nav>
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500">WASM CONTRACT</span>
          <span className="text-zinc-300 truncate max-w-[240px] sm:max-w-none">{CONTRACT_ID}</span>
        </div>
        <div className="grid grid-cols-4 gap-2 bg-zinc-900/60 border border-zinc-800/80 p-1.5 rounded-2xl">
          {[["transfer", "Pay & Escrow"], ["whisk", "Whisk DEX"], ["vault", "Safe Vault"], ["vip", "VIP Pass"]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`py-2.5 rounded-xl text-xs font-medium transition ${activeTab === id ? "bg-zinc-800 text-white shadow" : "text-zinc-400 hover:text-zinc-200"}`}>{label}</button>
          ))}
        </div>
        <main className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          {activeTab === "transfer" && (<>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-white">Transfer & Smart Escrow</h2>
              <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                {["RTM", "RTD"].map((t) => (<button key={t} onClick={() => setTokenType(t)} className={`px-3 py-1 rounded text-xs font-mono ${tokenType === t ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-500"}`}>{t}</button>))}
              </div>
            </div>
            <input type="text" placeholder="Recipient address (rete...)" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl text-sm font-mono" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder={`Amount (${tokenType})`} value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl text-sm font-mono" />
              <input type="text" placeholder="Deal ID (optional)" value={dealId} onChange={(e) => setDealId(e.target.value)} className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl text-sm font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button disabled={busy} onClick={sendRealTokens} className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-xl text-sm">Send {tokenType}</button>
              <button disabled={busy} onClick={() => callContract("create_escrow", [dealId || "deal_1", recipient, tokenType, amount])} className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white border border-zinc-700 py-2.5 rounded-xl text-sm">Lock in Escrow</button>
            </div>
          </>)}
          {activeTab === "whisk" && (<>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-white">Whisk DEX Orderbook (RTM/RTD)</h2>
              <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                {["BUY", "SELL"].map((s) => (<button key={s} onClick={() => setOrderSide(s)} className={`px-3 py-1 rounded text-xs font-mono ${orderSide === s ? (s === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400") : "text-zinc-500"}`}>{s}</button>))}
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
              <button disabled={busy} onClick={() => callContract("place_whisk_order", [walletAddr || "my_user", "RTM/RTD", orderSide, limitPrice, orderAmount])} className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black py-2.5 rounded-xl text-sm font-semibold">Place {orderSide} Order</button>
              <button onClick={() => queryChain("get_whisk_order", [walletAddr || "my_user"], setActiveOrder)} className="px-4 bg-zinc-800 border border-zinc-700 rounded-xl text-xs">Sync</button>
            </div>
          </>)}
          {activeTab === "vault" && (<>
            <div className="flex justify-between items-center bg-zinc-950/90 border border-zinc-800 p-4 rounded-xl">
              <div><span className="text-xs text-zinc-500 block font-mono">VAULT LOCKED</span><span className="text-2xl font-bold font-mono text-emerald-400">{vaultBalance}</span></div>
              <button onClick={() => queryChain("get_vault", [walletAddr || "my_user"], setVaultBalance)} className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono">Refresh</button>
            </div>
            <input type="number" placeholder="Amount to lock" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl text-sm font-mono" />
            <button disabled={busy} onClick={() => callContract("deposit_vault", [walletAddr || "my_user", amount])} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black py-2.5 rounded-xl text-sm font-semibold">Deposit into Vault</button>
          </>)}
          {activeTab === "vip" && (<>
            <h2 className="text-base font-semibold text-white">Post-Quantum VIP Whitelist</h2>
            <button disabled={busy} onClick={() => callContract("set_vip", [walletAddr || "my_user"])} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 disabled:opacity-50 text-black py-2.5 rounded-xl text-sm font-semibold">Activate VIP Status</button>
          </>)}
          {status && <pre className="p-3.5 bg-zinc-950 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-400 whitespace-pre-wrap break-all">{status}</pre>}
        </main>
      </div>
    </div>
  );
}


