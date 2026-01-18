export const metadata = { title: "SolCiv", description: "Solana wallet civilisation simulator" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0b0f14", color: "#ecf0f1", fontFamily: "ui-sans-serif,system-ui" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 18 }}>{children}</div>
      </body>
    </html>
  );
}
