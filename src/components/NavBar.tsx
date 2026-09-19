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

export default function NavBar({ walletAddress, onConnect, onDisconnect, connecting }: {
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  connecting: boolean;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const shortAddr = walletAddress ? `${walletAddress.substring(0, 10)}...${walletAddress.slice(-6)}` : null;

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
            <button className="btn-secondary" onClick={onDisconnect} title={walletAddress} style={{ fontFamily: "monospace", fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>
              🔑 {shortAddr}
            </button>
          ) : (
            <button className="btn-primary" onClick={onConnect} disabled={connecting} style={{ padding: "0.45rem 1.1rem", fontSize: "0.85rem" }}>
              {connecting ? <><span className="spinner" /> Connecting...</> : "Connect Wallet"}
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