import { NextResponse } from "next/server";

const RPC_URL = "https://rpc.retium.org";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.type === "balance") {
      const [walletRes, tokensRes] = await Promise.all([
        fetch(`${RPC_URL}/api/wallet/${body.address}`),
        fetch(`${RPC_URL}/api/wallet/${body.address}/tokens`).catch(() => null),
      ]);
      const walletData = walletRes.ok ? await walletRes.json() : {};
      const tokensData = tokensRes && tokensRes.ok ? await tokensRes.json() : {};
      return NextResponse.json({
        ok: true,
        data: { ...walletData, tokens: tokensData },
      });
    }
    if (body.type === "query") {
      const res = await fetch(`${RPC_URL}/api/contract/${body.contract_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: body.action,
          args: body.args,
        }),
      });
      const data = await res.json();
      return NextResponse.json({ ok: true, data });
    }
    return NextResponse.json({ ok: false, error: "Invalid request" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message });
  }
}
