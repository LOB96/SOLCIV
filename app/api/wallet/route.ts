import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

const RPC = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com";

export async function POST(req: Request) {
  try {
    const { pubkey } = await req.json();
    if (!pubkey || typeof pubkey !== "string") {
      return NextResponse.json({ error: "Missing pubkey" }, { status: 400 });
    }

    const pk = new PublicKey(pubkey);
    const conn = new Connection(RPC, "confirmed");

    const lamports = await conn.getBalance(pk);
    const sol = lamports / 1_000_000_000;

    const tokenAccounts = await conn.getTokenAccountsByOwner(pk, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    });

    return NextResponse.json({
      sol,
      tokenAccounts: tokenAccounts.value.length
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "RPC error" }, { status: 400 });
  }
}
