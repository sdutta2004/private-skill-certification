"use client";
import { useEffect, useState } from "react";
import { getClient, CONTRACT_ADDRESS, NETWORK_CONFIG } from "../../lib/contract";
import Link from "next/link";

export default function ExplorerPage() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try { const s = await getClient().fetchPublicState(); setState(s); } catch {}
    if (isRefresh) setRefreshing(false); else setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rows = state ? [
    { label: "Total Certificates Issued", value: state.certificateCount, mono: false, color: "#10b981" },
    { label: "Active Skill Certification ID", value: state.skillId, mono: true, color: "#a78bfa" },
    { label: "Last Certification Commitment", value: state.lastCertificationCommitment, mono: true, color: "#06b6d4" },
    { label: "Active Session Epoch", value: state.activeSession, mono: false, color: "#f59e0b" },
  ] : [];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-purple">Explorer</span>
          <span className="badge badge-green">Live On-Chain State</span>
        </div>
        <h1 className="section-title" style={{ fontSize: "1.85rem" }}>Chain Explorer</h1>
        <p className="section-desc">Real-time public ledger state verified from the Midnight Preview blockchain.</p>
      </div>

      {/* Contract Details Card */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Deployed Contract Address</div>
            <div style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#a78bfa", wordBreak: "break-all" }}>{CONTRACT_ADDRESS}</div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button onClick={copyAddress} className="btn-secondary" style={{ padding: "0.4rem 0.9rem", fontSize: "0.8rem" }}>
              {copied ? "✓ Copied!" : "Copy Address"}
            </button>
            <a href={NETWORK_CONFIG.explorerUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: "0.4rem 0.9rem", fontSize: "0.8rem" }}>
              Midnight Explorer ↗
            </a>
          </div>
        </div>
      </div>

      {/* Public State Table */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9" }}>Public Ledger State</h2>
          <button onClick={() => load(true)} className="btn-secondary" disabled={refreshing} style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}>
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
            <span className="spinner" /> Querying Midnight Preview indexer...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {rows.map(r => (
              <div key={r.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem",
                padding: "0.85rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)"
              }}>
                <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{r.label}</span>
                <span style={{
                  fontFamily: r.mono ? "monospace" : "inherit",
                  fontSize: r.mono ? "0.8rem" : "1.1rem",
                  fontWeight: 700,
                  color: r.color,
                  wordBreak: "break-all"
                }}>{String(r.value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Circuit Directory */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "1rem" }}>Available On-Chain Circuits (6)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem" }}>
          {[
            { name: "issueCertificate", type: "Candidate", color: "#8b5cf6", desc: "Prove score >= threshold in ZK and anchor cert commitment" },
            { name: "verifyCertificate", type: "Public", color: "#06b6d4", desc: "Publicly verify claimed commitment matches on-chain record" },
            { name: "revokeCertificate", type: "Issuer", color: "#ef4444", desc: "Revoke specific fraudulent or expired certificate" },
            { name: "setIssuerCommitment", type: "Issuer", color: "#f59e0b", desc: "Anchor issuer authority and update passing score threshold" },
            { name: "resetCertification", type: "Issuer", color: "#10b981", desc: "Rotate active skill ID and reset threshold" },
            { name: "incrementSession", type: "Governance", color: "#38bdf8", desc: "Bump activeSession epoch nonce for replay protection" },
          ].map(c => (
            <div key={c.name} style={{ padding: "0.85rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: `1px solid ${c.color}22` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: c.color, fontWeight: 700 }}>{c.name}</span>
                <span style={{ fontSize: "0.68rem", padding: "0.15rem 0.45rem", borderRadius: "99px", background: `${c.color}15`, color: c.color }}>{c.type}</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.4 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}