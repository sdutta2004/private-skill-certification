"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./NavBar.module.css";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/submit", label: "Issue Certificate" },
  { href: "/admin", label: "Issuer Console" },
  { href: "/explorer", label: "Chain Explorer" },
  { href: "/inspector", label: "ZK Inspector" },
];

export default function NavBar({
  walletAddress,
  walletName = "1AM Wallet",
  isApproved = false,
  onOpenConnect,
  onOpenDetails,
  connecting
}: {
  walletAddress: string | null;
  walletName?: string;
  isApproved?: boolean;
  onOpenConnect: () => void;
  onOpenDetails: () => void;
  connecting: boolean;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const safeAddr = typeof walletAddress === "string" ? walletAddress : (walletAddress ? String(walletAddress) : null);
  const shortAddr = safeAddr && safeAddr.length > 16
    ? `${safeAddr.substring(0, 10)}...${safeAddr.slice(-6)}`
    : (safeAddr || null);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎓</span>
          <span className={styles.logoText}>ZKCert<span className={styles.logoSub}>.psc</span></span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`${styles.navLink} ${pathname === l.href ? styles.active : ""}`} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.netPill}>
            <span className={styles.netDot} />
            <span>Midnight Preview</span>
          </div>

          {walletAddress ? (
            <button
              className="btn-secondary"
              onClick={onOpenDetails}
              title={walletAddress}
              style={{
                fontFamily: "monospace",
                fontSize: "0.8rem",
                padding: "0.4rem 0.9rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "1px solid rgba(16,185,129,0.4)",
                background: "rgba(16,185,129,0.08)",
                color: "#f1f5f9"
              }}
            >
              <span style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px #10b981",
                display: "inline-block"
              }} />
              <span style={{ color: "#10b981", fontWeight: 700, fontSize: "0.75rem" }}>
                {walletName?.includes("1AM") ? "1AM" : "MIDNIGHT"}
              </span>
              <span>{shortAddr}</span>
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={onOpenConnect}
              disabled={connecting}
              style={{ padding: "0.45rem 1.1rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              {connecting ? (
                <><span className="spinner" /> Connecting...</>
              ) : (
                <>🛡️ Connect 1AM Wallet</>
              )}
            </button>
          )}

          <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
