"use client";
import { useState, useEffect } from "react";
import { getAvailableWallets, getClient, normalizeAddressToString, DiscoveredWallet } from "../lib/contract";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (address: string, walletName: string) => void;
}

export default function WalletConnectModal({ isOpen, onClose, onConnected }: WalletConnectModalProps) {
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("1AM");
  const [status, setStatus] = useState<"idle" | "requesting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const detected = getAvailableWallets();
      setWallets(detected);
      const oneAm = detected.find(w => w.is1AM);
      if (oneAm) {
        setSelectedWalletId(oneAm.id);
      } else if (detected.length > 0) {
        setSelectedWalletId(detected[0].id);
      } else {
        setSelectedWalletId("1AM");
      }
      setStatus("idle");
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const is1AMDetected = wallets.some(w => w.is1AM);

  const handleApproveConnect = async () => {
    setStatus("requesting");
    setErrorMessage(null);
    try {
      const client = getClient();
      const res = await client.connectWallet(selectedWalletId);
      const safeAddr = normalizeAddressToString(res.walletAddress);
      setStatus("success");
      setTimeout(() => {
        onConnected(safeAddr, res.walletName);
        onClose();
      }, 600);
    } catch (err: any) {
      setStatus("error");
      const msg = err?.message || String(err);
      setErrorMessage(msg);
    }
  };

  const handleSimulatedConnect = () => {
    try {
      const client = getClient();
      const res = client.simulateApprovalConnect();
      const safeAddr = normalizeAddressToString(res.walletAddress);
      setStatus("success");
      setTimeout(() => {
        onConnected(safeAddr, res.walletName);
        onClose();
      }, 400);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "Simulated approval failed");
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
        maxWidth: 500,
        width: "100%",
        padding: "1.75rem",
        borderRadius: "20px",
        background: "linear-gradient(145deg, rgba(20,20,32,0.96), rgba(12,12,20,0.98))",
        border: "1px solid rgba(139,92,246,0.3)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.15)",
        position: "relative"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
              boxShadow: "0 0 16px rgba(139,92,246,0.4)"
            }}>
              🛡️
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                Connect 1AM Wallet
              </h2>
              <span style={{ fontSize: "0.75rem", color: "#a78bfa" }}>
                Approval-Based DApp Connector • Midnight Preview
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={status === "requesting"}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              color: "#94a3b8",
              width: 32,
              height: 32,
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>

        {/* Wallet Selection Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
          <div
            onClick={() => setSelectedWalletId("1AM")}
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "12px",
              border: selectedWalletId === "1AM" ? "2px solid #8b5cf6" : "1px solid rgba(255,255,255,0.08)",
              background: selectedWalletId === "1AM" ? "rgba(139,92,246,0.14)" : "rgba(255,255,255,0.02)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ fontSize: "1.4rem" }}>💎</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#f1f5f9" }}>
                  1AM Wallet <span className="badge badge-purple" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>Native ZK</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  Official non-custodial privacy wallet for Midnight
                </div>
              </div>
            </div>
            <div>
              {is1AMDetected ? (
                <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} /> Ready
                </span>
              ) : (
                <span style={{ fontSize: "0.75rem", color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} /> Not Detected
                </span>
              )}
            </div>
          </div>

          <div
            onClick={() => setSelectedWalletId("mnLace")}
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "12px",
              border: selectedWalletId === "mnLace" ? "2px solid #8b5cf6" : "1px solid rgba(255,255,255,0.08)",
              background: selectedWalletId === "mnLace" ? "rgba(139,92,246,0.14)" : "rgba(255,255,255,0.02)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ fontSize: "1.4rem" }}>🌐</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#f1f5f9" }}>
                  Midnight Lace
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  Cardano & Midnight multi-chain extension
                </div>
              </div>
            </div>
            <div>
              {wallets.some(w => !w.is1AM) ? (
                <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} /> Ready
                </span>
              ) : (
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Extension</span>
              )}
            </div>
          </div>
        </div>

        {/* Approval Permissions Scope Box */}
        <div style={{
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "0.85rem",
          marginBottom: "1.25rem",
          fontSize: "0.8rem",
          color: "#cbd5e1"
        }}>
          <div style={{ fontWeight: 600, color: "#a78bfa", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🔑</span> Approval Permissions Requested
          </div>
          <ul style={{ paddingLeft: "1.25rem", margin: "0 0 0.5rem 0", lineHeight: 1.6, color: "#94a3b8" }}>
            <li>Read your shielded public address (Bech32m)</li>
            <li>Connect to contract <code style={{ color: "#a78bfa" }}>0x3fdade...</code> on Midnight Preview</li>
            <li>Sign zero-knowledge proof circuit transactions</li>
          </ul>
          <div style={{ fontSize: "0.72rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
            🔒 Private keys, test scores, and secrets never leave your browser.
          </div>
        </div>

        {/* Live Status Banners */}
        {status === "requesting" && (
          <div style={{
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.4)",
            borderRadius: "10px",
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "#f59e0b",
            fontSize: "0.85rem"
          }}>
            <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            <div>
              <strong>Awaiting 1AM Wallet Approval...</strong>
              <div style={{ fontSize: "0.75rem", color: "#cbd5e1", marginTop: "2px" }}>
                Please check your 1AM Wallet extension popup and click <strong>Approve</strong>.
              </div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div style={{
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: "10px",
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            color: "#ef4444",
            fontSize: "0.85rem"
          }}>
            <strong>❌ Connection / Approval Rejected</strong>
            <div style={{ fontSize: "0.75rem", color: "#fca5a5", marginTop: "2px", wordBreak: "break-word" }}>
              {errorMessage}
            </div>
          </div>
        )}

        {status === "success" && (
          <div style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.4)",
            borderRadius: "10px",
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            color: "#10b981",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            ✓ <strong>1AM Wallet Approved & Verified!</strong> Connecting...
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {is1AMDetected ? (
            <button
              onClick={handleApproveConnect}
              disabled={status === "requesting"}
              className="btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "0.75rem",
                fontSize: "0.95rem"
              }}
            >
              {status === "requesting" ? (
                <><span className="spinner" /> Requesting Approval...</>
              ) : (
                "Approve & Connect 1AM Wallet"
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleApproveConnect}
                disabled={status === "requesting"}
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "0.75rem",
                  fontSize: "0.95rem"
                }}
              >
                {status === "requesting" ? (
                  <><span className="spinner" /> Opening 1AM Approval...</>
                ) : (
                  "Trigger 1AM Approval Popup"
                )}
              </button>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                <a
                  href="https://1am.xyz"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    fontSize: "0.78rem",
                    padding: "0.5rem",
                    textAlign: "center"
                  }}
                >
                  Install 1AM Extension ↗
                </a>
                <button
                  onClick={handleSimulatedConnect}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    fontSize: "0.78rem",
                    padding: "0.5rem",
                    borderColor: "rgba(139,92,246,0.4)",
                    color: "#a78bfa"
                  }}
                >
                  Test 1AM Approval (Dev Mode)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
