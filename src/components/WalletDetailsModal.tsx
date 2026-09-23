"use client";
import { useState } from "react";
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from "../lib/contract";

interface WalletDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  walletName: string;
  onDisconnect: () => void;
}

export default function WalletDetailsModal({
  isOpen,
  onClose,
  walletAddress,
  walletName,
  onDisconnect
}: WalletDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="glass-card" style={{
        maxWidth: 480,
        width: "100%",
        padding: "1.75rem",
        borderRadius: "20px",
        background: "linear-gradient(145deg, rgba(20,20,32,0.96), rgba(12,12,20,0.98))",
        border: "1px solid rgba(139,92,246,0.3)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem"
            }}>
              ✓
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                {walletName}
              </h2>
              <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600 }}>
                ● Active Approval Session
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              color: "#94a3b8",
              width: 32,
              height: 32,
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            ✕
          </button>
        </div>

        {/* Address Card */}
        <div style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "1rem",
          marginBottom: "1.25rem"
        }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
            Connected Midnight Address (Bech32m)
          </div>
          <div style={{
            fontFamily: "monospace",
            fontSize: "0.82rem",
            color: "#cbd5e1",
            wordBreak: "break-all",
            background: "rgba(255,255,255,0.03)",
            padding: "0.6rem",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.04)",
            marginBottom: "0.6rem"
          }}>
            {walletAddress}
          </div>
          <button
            onClick={handleCopy}
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center", fontSize: "0.8rem", padding: "0.4rem" }}
          >
            {copied ? "✓ Copied to Clipboard!" : "📋 Copy Full Address"}
          </button>
        </div>

        {/* Network & Contract Details */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          fontSize: "0.8rem",
          marginBottom: "1.5rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
            <span>Network</span>
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>Midnight Preview Testnet</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
            <span>Approval Type</span>
            <span style={{ color: "#10b981", fontWeight: 600 }}>DApp Connector (enable)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
            <span>Contract Address</span>
            <a
              href={NETWORK_CONFIG.explorerUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#8b5cf6", fontFamily: "monospace", textDecoration: "underline" }}
            >
              {CONTRACT_ADDRESS.substring(0, 10)}...{CONTRACT_ADDRESS.slice(-6)} ↗
            </a>
          </div>
        </div>

        {/* Disconnect Action */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => {
              onDisconnect();
              onClose();
            }}
            className="btn-danger"
            style={{
              flex: 1,
              justifyContent: "center",
              padding: "0.65rem",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#ef4444",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.88rem"
            }}
          >
            Disconnect Wallet
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: "center", padding: "0.65rem", fontSize: "0.88rem" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
