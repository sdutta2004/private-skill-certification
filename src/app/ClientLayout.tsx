"use client";
import { useState, useCallback } from "react";
import NavBar from "../components/NavBar";
import { getClient } from "../lib/contract";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("psc_wallet_address");
    return sessionStorage.getItem("psc_wallet_connected") === "true" ? stored : null;
  });
  const [connecting, setConnecting] = useState(false);

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    try {
      const client = getClient();
      const res = await client.connectWallet();
      setWalletAddress(res.walletAddress);
    } catch (err: any) {
      alert(err?.message || "Wallet connection failed.");
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