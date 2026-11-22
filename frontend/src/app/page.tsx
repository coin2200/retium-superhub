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
    const provider = (window as any).retium;
    if (!provider) return setStatus("Retium Wallet Extension not found. Enter address manually.");
    try {
      const acc = await provider.request({ method: "rtm_requestAccounts" });
      if (acc?.length) { setWalletAddr(acc); setConnected(true); setStatus(`Connected: ${acc}`); }
    } catch (e: any) { setStatus(`Error: ${e.message}`); }
  };

  const sendRealTokens = async () => {
    if (!recipient || !amount) return alert("Enter receiver address and amount!");
    const provider = (window as any).retium;
    if (!provider) return setStatus(`CLI: retium transfer ${recipient} ${amount} --asset ${tokenType}`);
    try {
      const tx = await provider.request({ method: "rtm_sendTransaction", params: [{ type: "transfer", to: recipient, amount, asset: tokenType }] });
      setStatus(`Sent! Tx ID: ${tx}`);
    } catch (e: any) { setStatus(`Error: ${e.message}`); }
  };

  const callContract = async (action: string, args: string[]) => {
    const provider = (window as any).retium;
    if (!provider) return setStatus(`CLI: retium call ${CONTRACT_ID} ${action} ${args.map(a => `"${a}"`).join(" ")} --fee RTD`);
    try {
      const tx = await provider.request({ method: "rtm_sendTransaction", params: [{ contractId: CONTRACT_ID, action, args }] });
      setStatus(`Success! Tx ID: ${tx}`);
    } catch (e: any) { setStatus(`Error: ${e.message}`); }
  };

  const queryChain = async (action: string, args: string[], setter: (v: string) => void) => {
    setStatus("Querying Testnet...");
    try {
      const res = await fetch(`${RPC_URL}/query`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contract_id: CONTRACT_ID, action, args }) });
      const data = await res.json();
      setter(data.data || data.result || "0");
      setStatus("Updated from Testnet!");
    } catch { setStatus("RPC query sent."); }
  };
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Retium SuperHub</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">Contract: {CONTRACT_ID.slice(0, 10)}...{CONTRACT_ID.slice(-8)}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input type="text" placeholder="Address (rete...) or user" value={walletAddr} onChange={(e) => setWalletAddr(e.target.value)} className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm" />
            <button onClick={connectWallet} className={`px-4 py-2 rounded-lg font-semibold text-sm ${connected ? "bg-emerald-600" : "bg-blue-600"}`}>{connected ? "Connected" : "Connect Wallet"}</button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[{ id: "transfer", label: "RTM / RTD Pay" }, { id: "whisk", label: "Whisk DEX" }, { id: "vault", label: "Safe Vault" }, { id: "vip", label: "VIP Pass" }].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`py-3 rounded-xl font-semibold text-sm ${activeTab === t.id ? "bg-purple-600 text-white" : "bg-slate-900 text-slate-400"}`}>{t.label}</button>
          ))}
        </div>

        <main className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          {activeTab === "transfer" && (<>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Real RTM / RTD Transfer & Escrow</h2>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg">{["RTM", "RTD"].map((tok) => (<button key={tok} onClick={() => setTokenType(tok)} className={`px-3 py-1 rounded text-xs font-bold ${tokenType === tok ? "bg-blue-600" : "text-slate-400"}`}>{tok}</button>))}</div>
            </div>
            <input type="text" placeholder="Receiver Address (rete...)" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder={`Amount (${tokenType})`} value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm" />
              <input type="text" placeholder="Deal ID (for Escrow)" value={dealId} onChange={(e) => setDealId(e.target.value)} className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={sendRealTokens} className="bg-emerald-600 py-3 rounded-lg font-semibold">Send {tokenType} Now</button>
              <button onClick={() => callContract("create_escrow", [dealId || "deal_1", recipient, tokenType, amount])} className="bg-blue-600 py-3 rounded-lg font-semibold">Lock in Escrow</button>
            </div>
          </>)}

          {activeTab === "whisk" && (<>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Whisk DEX Limit Orderbook (RTM/RTD)</h2>
              <div className="flex gap-2">{["BUY", "SELL"].map((s) => (<button key={s} onClick={() => setOrderSide(s)} className={`px-3 py-1 rounded text-xs font-bold ${orderSide === s ? (s === "BUY" ? "bg-emerald-600" : "bg-rose-600") : "bg-slate-950 text-slate-400"}`}>{s}</button>))}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="0.01" placeholder="Limit Price (RTD)" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm" />
              <input type="number" placeholder="Amount (RTM)" value={orderAmount} onChange={(e) => setOrderAmount(e.target.value)} className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm" />
            </div>
            <div className="bg-slate-950 p-3 rounded-xl text-xs flex justify-between"><span className="text-slate-400">Active Order:</span><span className="font-mono text-purple-400">{activeOrder}</span></div>
            <div className="flex gap-3">
              <button onClick={() => callContract("place_whisk_order", [walletAddr || "my_user", "RTM/RTD", orderSide, limitPrice, orderAmount])} className="flex-1 bg-emerald-600 py-3 rounded-lg font-semibold">Place {orderSide} Order</button>
              <button onClick={() => queryChain("get_whisk_order", [walletAddr || "my_user"], setActiveOrder)} className="px-4 bg-slate-800 rounded-lg text-sm">Check Order</button>
            </div>
          </>)}

          {activeTab === "vault" && (<>
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl"><span className="text-slate-400 text-sm">Vault Balance:</span><span className="text-2xl font-bold text-emerald-400">{vaultBalance}</span></div>
            <input type="number" placeholder="Amount to Lock" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg" />
            <div className="flex gap-3">
              <button onClick={() => callContract("deposit_vault", [walletAddr || "my_user", amount])} className="flex-1 bg-emerald-600 py-3 rounded-lg font-semibold">Lock in Vault</button>
              <button onClick={() => queryChain("get_vault", [walletAddr || "my_user"], setVaultBalance)} className="px-5 bg-slate-800 rounded-lg">Refresh</button>
            </div>
          </>)}

          {activeTab === "vip" && (<>
            <h2 className="text-xl font-semibold">Activate Post-Quantum VIP Pass</h2>
            <button onClick={() => callContract("set_vip", [walletAddr || "my_user"])} className="w-full bg-amber-600 py-3 rounded-lg font-semibold">Activate VIP Pass</button>
          </>)}

          {status && <div className="mt-4 p-4 bg-slate-950 border border-cyan-900 rounded-xl text-xs font-mono text-cyan-300 break-all">{status}</div>}
        </main>
      </div>
    </div>
  );
}
