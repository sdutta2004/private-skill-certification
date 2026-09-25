"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./NavBar.module.css";

const links = [
  { href: "/", label: "Overview" },
  { href: "/submit", label: "Issue Credential" },
  { href: "/submit#verify-section", label: "Verify Credential" },
  { href: "/admin", label: "Issuer Console" },
  { href: "/explorer", label: "Explorer" },
];

export default function NavBar({
  walletAddress,
  walletName = "1AM Wallet",
  isApproved = false,
  onOpenConnect,
  onOpenDetails,
  connecting,
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
    ? `${safeAddr.substring(0, 8)}...${safeAddr.slice(-5)}`
    : (safeAddr || null);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Brand Logo */}
        <Link href="/" className={styles.brand}>
          <div className={styles.brandDot} />
          <span className={styles.brandTitle}>PSC Protocol</span>
        </Link>

        {/* Center Nav Links */}
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.navLink} ${isActive ? styles.activeLink : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className={styles.actions}>
          <div className={styles.networkBadge} title="Connected to Midnight Preview Testnet">
            <span className={styles.networkDot} />
            <span className={styles.networkText}>Preview</span>
          </div>

          {walletAddress ? (
            <button
              className={styles.walletBtnConnected}
              onClick={onOpenDetails}
              title={walletAddress}
            >
              <span className={styles.walletDot} />
              <span className={styles.walletLabel}>{walletName?.includes("1AM") ? "1AM" : "MIDNIGHT"}</span>
              <span className={styles.walletAddress}>{shortAddr}</span>
            </button>
          ) : (
            <button
              className={styles.walletBtnConnect}
              onClick={onOpenConnect}
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <span className="spinner" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>
          )}

          {/* Mobile Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className={menuOpen ? styles.barTopOpen : ""} />
            <span className={menuOpen ? styles.barMidOpen : ""} />
            <span className={menuOpen ? styles.barBotOpen : ""} />
          </button>
        </div>
      </div>
    </header>
  );
}
