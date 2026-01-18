"use client";

import React, { useMemo, useState } from "react";

type WalletInfo = {
  sol: number;
  tokenAccounts: number;
  tier: string;
  estate: { name: string; tiles: number };
  solciv: number;
  boost: number;
};

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}

function shortPk(pk: string) {
  if (!pk) return "GUEST";
  return pk.length < 10 ? pk : `${pk.slice(0, 4)}…${pk.slice(-4)}`;
}

function hashString(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

function svgMap(seed: number, info: WalletInfo, name: string) {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };

  const density = clamp(info.estate.tiles / 36, 0.2, 1);
  const n = Math.floor(14 + 18 * density);

  const circles = Array.from({ length: n }).map((_, i) => {
    const x = rnd() * 100;
    const y = rnd() * 100;
    const r = 2 + rnd() * (6 + 10 * density);
    const o = 0.35 + rnd() * 0.55;
    return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(
      2
    )}" fill="white" fill-opacity="${o.toFixed(2)}" stroke="#111" stroke-width="0.4" />`;
  });

  const title = "SOLCIV EMPIRE MAP";
  const subtitle = `${name} • ${info.tier}`;
  const meta1 = `Estate: ${info.estate.name} • SOL: ${info.sol.toFixed(4)} • Token Accts: ${info.tokenAccounts}`;
  const meta2 = `$SOLCIV: ${info.solciv} • Boost: x${info.boost.toFixed(2)}`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="620" viewBox="0 0 110 62">
  <rect width="110" height="62" fill="#0b0f14"/>

  <g transform="translate(4,10)">
    <text x="0" y="0" fill="#ecf0f1" font-size="4" font-weight="700">${title}</text>
    <text x="0" y="5" fill="#bdc3c7" font-size="3.2">${subtitle}</text>
    <text x="0" y="9" fill="#7f8c8d" font-size="2.6">${meta1}</text>
    <text x="0" y="12.5" fill="#7f8c8d" font-size="2.6">${meta2}</text>
  </g>

  <g transform="translate(6,18)">
    <circle cx="49" cy="23" r="23" fill="none" stroke="#2ecc71" stroke-opacity="0.45" stroke-width="${(
      1.8 + density
    ).toFixed(2)}"/>
    <circle cx="49" cy="23" r="16" fill="none" stroke="#34495e" stroke-opacity="0.55" stroke-width="${(
      1.0 + density
    ).toFixed(2)}"/>

    ${circles.join("\n")}
    <text x="49" y="23" text-anchor="middle" dominant-baseline="middle" font-size="${(10 + 6 * density).toFixed(
      2
    )}" fill="#ecf0f1">✶</text>
  </g>

  <text x="108" y="60.5" text-anchor="end" fill="#7f8c8d" font-size="2.2">Built by @Obbicial • Ireland • Jan 2026</text>
</svg>
`.trim();
}

function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function card(): React.CSSProperties {
  return { background: "#0e131a", border: "1px solid #141a22", borderRadius: 14, padding: 14 };
}
function btn(): React.CSSProperties {
  return { background: "#111827", color: "#ecf0f1", border: "1px solid #1f2937", borderRadius: 10, padding: "10px 12px", cursor: "pointer" };
}
function inp(): React.CSSProperties {
  return { flex: 1, minWidth: 280, background: "#070a0d", color: "#ecf0f1", border: "1px solid #141a22", borderRadius: 10, padding: "10px 12px" };
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ background: "#070a0d", border: "1px solid #141a22", borderRadius: 12, padding: 12 }}>
      <div style={{ color: "#7f8c8d", fontSize: 12 }}>{k}</div>
      <div style={{ fontSize: 18, marginTop: 6 }}>{v}</div>
    </div>
  );
}

export default function Page() {
  const [pk, setPk] = useState("");
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 10_000_000));

  const name = useMemo(() => (wallet ? shortPk(pk) : "GUEST"), [wallet, pk]);

  const mapSvg = useMemo(() => {
    if (!wallet) return "";
    const stableSeed = pk ? Math.abs(hashString(pk)) % 10_000_000 : seed;
    return svgMap(stableSeed, wallet, name);
  }, [wallet, pk, seed, name]);

  function addLog(m: string) {
    setLog((prev) => [m, ...prev].slice(0, 20));
  }

  async function loadGuest() {
    const sol = [0.03, 0.12, 0.42, 1.3, 6.7][Math.floor(Math.random() * 5)];
    const tokenAccounts = 1 + Math.floor(Math.random() * 14);
    const prof = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sol, tokenAccounts })
    });
    const info = (await prof.json()) as WalletInfo;
    setWallet(info);
    setPk("");
    setSeed(Math.floor(Math.random() * 10_000_000));
    addLog("Guest entered. Empire forged.");
  }

  async function loadWallet() {
    const res = await fetch("/api/wallet", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pubkey: pk })
    });
    const data = await res.json();
    if (!res.ok) {
      addLog(`Wallet load failed: ${data?.error || "unknown error"}`);
      return;
    }

    const prof = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sol: data.sol, tokenAccounts: data.tokenAccounts })
    });
    const info = (await prof.json()) as WalletInfo;
    setWallet(info);
    addLog(`Wallet loaded: ${shortPk(pk)} • SOL ${data.sol.toFixed(4)}`);
  }

  const shareText = wallet
    ? `My SolCiv empire is ${wallet.tier} • SOL ${wallet.sol.toFixed(4)} • Estate ${wallet.estate.name} • $SOLCIV ${wallet.solciv}.\nBuilt by @Obbicial`
    : "";

  return (
    <main>
      <h1 style={{ margin: "6px 0 4px" }}>SolCiv</h1>
      <div style={{ color: "#7f8c8d", marginBottom: 16 }}>
        Wallet → civilisation → map → share. Read-only.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18 }}>
        <section style={card()}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={btn()} onClick={loadGuest}>Start as Guest</button>
            <input
              style={inp()}
              placeholder="Solana public key (read-only)"
              value={pk}
              onChange={(e) => setPk(e.target.value)}
            />
            <button style={btn()} onClick={loadWallet}>Load Wallet</button>
          </div>

          {wallet && (
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                <Stat k="Tier" v={wallet.tier} />
                <Stat k="Estate" v={wallet.estate.name} />
                <Stat k="SOL" v={wallet.sol.toFixed(4)} />
                <Stat k="$SOLCIV" v={String(wallet.solciv)} />
              </div>

              <div style={{ color: "#7f8c8d" }}>Inclusivity boost: x{wallet.boost.toFixed(2)}</div>

              <div style={{ background: "#070a0d", borderRadius: 12, padding: 12, border: "1px solid #141a22" }}>
                <div dangerouslySetInnerHTML={{ __html: mapSvg }} />
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={btn()} onClick={() => downloadText(`solciv_${name}.svg`, mapSvg, "image/svg+xml")}>
                  Download Map (SVG)
                </button>
                <button style={btn()} onClick={() => downloadText(`solciv_share.txt`, shareText, "text/plain")}>
                  Download Share Text
                </button>
              </div>

              <pre style={{ whiteSpace: "pre-wrap", color: "#bdc3c7", background: "#070a0d", border: "1px solid #141a22", borderRadius: 12, padding: 12 }}>
{shareText}
              </pre>
            </div>
          )}
        </section>

        <aside style={card()}>
          <h3 style={{ marginTop: 0 }}>Log</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {log.length === 0 ? <div style={{ color: "#7f8c8d" }}>Empty.</div> : log.map((x, i) => (
              <div key={i} style={{ color: "#bdc3c7" }}>• {x}</div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
