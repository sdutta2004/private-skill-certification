"use client";
import { useState, useEffect, useCallback } from "react";
import NavBar from "../components/NavBar";
import { getClient, normalizeAddressToString } from "../lib/contract";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Initialize to null to guarantee exact match between server HTML and client hydration
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const isConnected = sessionStorage.getItem("psc_wallet_connected") === "true";
        const stored = sessionStorage.getItem("psc_wallet_address");
        if (isConnected && stored) {
          const safe = normalizeAddressToString(stored);
          if (safe && safe !== "[object Object]") {
            setWalletAddress(safe);
          }
        }
      } catch {}
    }
  }, []);

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    try {
      const client = getClient();
      const res = await client.connectWallet();
      const safe = normalizeAddressToString(res.walletAddress);
      setWalletAddress(safe || "Connected");
    } catch (err: any) {
      alert(err?.message || "Wallet connection failed. Please ensure 1AM or Lace wallet is unlocked.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    const client = getClient();
    client.disconnectWallet();
    setWalletAddress(null);
  }, []);

  return (
    <div className="page-wrapper">
      <NavBar walletAddress={walletAddress} onConnect={handleConnect} onDisconnect={handleDisconnect} connecting={connecting} />
      <main>{children}</main>
    </div>
  );
}
