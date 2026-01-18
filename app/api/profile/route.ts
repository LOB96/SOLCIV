import { NextResponse } from "next/server";

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}

function solToTier(sol: number) {
  if (sol < 0.1) return "Dust Camp";
  if (sol < 0.5) return "Meme Village";
  if (sol < 2) return "Shitcoin Borough";
  if (sol < 10) return "Trader Town";
  if (sol < 50) return "Liquidity Keep";
  if (sol < 200) return "Whale District";
  return "Whale Citadel";
}

function estateTier(sol: number) {
  if (sol < 0.1) return { name: "Tent", tiles: 4 };
  if (sol < 0.5) return { name: "Hut", tiles: 6 };
  if (sol < 2) return { name: "House", tiles: 9 };
  if (sol < 10) return { name: "Town", tiles: 14 };
  if (sol < 50) return { name: "City", tiles: 20 };
  if (sol < 200) return { name: "Fortified City", tiles: 28 };
  return { name: "Citadel", tiles: 36 };
}

function startingSolciv(sol: number) {
  if (sol <= 0) return 100;
  return Math.floor(clamp(250 * Math.log10(sol * 10 + 1), 100, 5000));
}

function lowBalanceBoost(sol: number) {
  if (sol <= 0) return 1.75;
  if (sol < 0.25) return 1.6;
  if (sol < 1) return 1.35;
  if (sol < 5) return 1.15;
  if (sol < 20) return 1.0;
  if (sol < 100) return 0.95;
  return 0.9;
}

export async function POST(req: Request) {
  try {
    const { sol, tokenAccounts } = await req.json();
    const s = Number(sol);
    const t = Number(tokenAccounts);

    return NextResponse.json({
      sol: s,
      tokenAccounts: t,
      tier: solToTier(s),
      estate: estateTier(s),
      solciv: startingSolciv(s),
      boost: lowBalanceBoost(s)
    });
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
}
