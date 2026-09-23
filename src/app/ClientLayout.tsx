"use client";
import { useState, useEffect, useCallback } from "react";
import NavBar from "../components/NavBar";
import WalletConnectModal from "../components/WalletConnectModal";
import WalletDetailsModal from "../components/WalletDetailsModal";
import { getClient, normalizeAddressToString } from "../lib/contract";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string>("1AM Wallet");
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [connecting, setConnecting] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const isConn = sessionStorage.getItem("psc_wallet_connected") === "true";
        const stored = sessionStorage.getItem("psc_wallet_address");
        const storedName = sessionStorage.getItem("psc_wallet_name") || "1AM Wallet";
        const approved = sessionStorage.getItem("psc_wallet_approved") === "true";
        if (isConn && stored && approved) {
          const safe = normalizeAddressToString(stored);
          if (safe && safe !== "[object Object]") {
            setWalletAddress(safe);
            setWalletName(storedName);
            setIsApproved(true);
            const client = getClient();
            client.checkExistingApproval().catch(() => {});
          }
        }
      } catch {}
    }
  }, []);

  const handleOpenConnect = useCallback(() => {
    setIsConnectModalOpen(true);
  }, []);

  const handleOpenDetails = useCallback(() => {
    setIsDetailsModalOpen(true);
  }, []);

  const handleConnected = useCallback((address: string, name: string) => {
    setWalletAddress(address);
    setWalletName(name);
    setIsApproved(true);
  }, []);

  const handleDisconnect = useCallback(() => {
    const client = getClient();
    client.disconnectWallet();
    setWalletAddress(null);
    setIsApproved(false);
  }, []);

  return (
    <div className="page-wrapper">
      <NavBar
        walletAddress={walletAddress}
        walletName={walletName}
        isApproved={isApproved}
        onOpenConnect={handleOpenConnect}
        onOpenDetails={handleOpenDetails}
        connecting={connecting}
      />
      <main>{children}</main>

      <WalletConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnected={handleConnected}
      />

      {walletAddress && (
        <WalletDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          walletAddress={walletAddress}
          walletName={walletName}
          onDisconnect={handleDisconnect}
        />
      )}
    </div>
  );
}
