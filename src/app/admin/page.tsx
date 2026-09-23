"use client";
import { useState } from "react";
import { getClient } from "../../lib/contract";
import Link from "next/link";

export default function AdminPage() {
  // resetCertification state
  const [skillId, setSkillId] = useState("skill_advanced_zk_architect");
  const [resetThreshold, setResetThreshold] = useState(75);
  const [loadingReset, setLoadingReset] = useState(false);

  // setIssuerCommitment state
  const [issuerKey, setIssuerKey] = useState("");
  const [issuerThreshold, setIssuerThreshold] = useState(70);
  const [loadingIssuer, setLoadingIssuer] = useState(false);

  // revokeCertificate state
  const [revokeCommitment, setRevokeCommitment] = useState("");
  const [loadingRevoke, setLoadingRevoke] = useState(false);

  // incrementSession state
  const [loadingSession, setLoadingSession] = useState(false);

  // shared
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);

  const addLog = (msg: string, type = "info") => setLogs(l => [...l, { msg, type }]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingReset(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog(`> [CIRCUIT] Executing resetCertification("${skillId}", threshold=${resetThreshold})...`, "info");
      const client = getClient(); client.setIssuerKey(issuerKey || "issuer_default_signing_key_2026"); const res = await client.resetCertification(skillId, resetThreshold);
      setResult({ ...res, circuit: "resetCertification(Bytes<32>, Uint<32>)" });
      addLog(`> [SUCCESS] Certification reset! New Skill ID: ${res.newSkillId}`, "success");
      addLog(`> [THRESHOLD] New passing threshold set: ${res.newThreshold}/100`, "success");
      addLog(`> [TXHASH] ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingReset(false); }
  };

  const handleIssuerSetup = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingIssuer(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog("> [ZK WITNESS] issuerSigningKey() — derived from private key, never disclosed", "info");
      addLog(`> [CIRCUIT] Executing setIssuerCommitment(Uint<32>) — threshold=${issuerThreshold}...`, "info");
      const client = getClient();
      client.setIssuerKey(issuerKey || "issuer_default_signing_key_2026");
      const res = await client.setIssuerCommitment(issuerThreshold);
      setResult({ ...res, circuit: "setIssuerCommitment(Uint<32>)" });
      addLog(`> [SUCCESS] Issuer commitment anchored on-chain!`, "success");
      addLog(`> [COMMITMENT] ${res.issuerCommitment}`, "success");
      addLog(`> [THRESHOLD] certificationThreshold set to ${res.newThreshold}/100`, "success");
      addLog(`> [TXHASH] ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingIssuer(false); }
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingRevoke(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog("> [ZK WITNESS] issuerSigningKey() — authorization proof generated locally", "info");
      addLog(`> [CIRCUIT] Executing revokeCertificate(Bytes<32>) — commitment: ${(revokeCommitment || "").substring(0, 20)}...`, "info");
      const client = getClient(); client.setIssuerKey(issuerKey || "issuer_default_signing_key_2026"); const res = await client.revokeCertificate(revokeCommitment);
      setResult({ ...res, circuit: "revokeCertificate(Bytes<32>)" });
      addLog(`> [SUCCESS] Commitment revoked on-chain!`, "success");
      addLog(`> [REVOKED] ${res.revokedCommitment}`, "success");
      addLog(`> [TXHASH] ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingRevoke(false); }
  };

  const handleIncrement = async () => {
    setLoadingSession(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog("> [CIRCUIT] Executing incrementSession() — invalidating stale proofs...", "info");
      const client = getClient(); client.setIssuerKey(issuerKey || "issuer_default_signing_key_2026"); const res = await client.incrementSession();
      setResult({ ...res, circuit: "incrementSession()" });
      addLog(`> [SUCCESS] Session incremented! TxHash: ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingSession(false); }
  };

  const isLoading = loadingReset || loadingIssuer || loadingRevoke || loadingSession;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <span className="badge badge-amber">Admin</span>
          <span className="badge badge-purple">Issuer Authority</span>
          <span className="badge badge-green">Midnight Preview</span>
        </div>
        <h1 className="section-title" style={{ fontSize: "1.85rem" }}>Issuer Authority Console</h1>
        <p className="section-desc">
          Execute governance and administrative circuits on the Midnight contract: configure certification passing thresholds, anchor issuer authority, void credentials, or rotate skill domains.
        </p>
      </div>

      {/* Panel 1: Set Issuer Commitment */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem", borderLeft: "3px solid #8b5cf6" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#8b5cf6", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          ⚡ Panel 1 — setIssuerCommitment(Uint&lt;32&gt;)
        </div>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
          Anchors the issuer authority commitment on-chain using <code>issuerSigningKey()</code> witness and updates the passing score threshold.
        </p>
        <form onSubmit={handleIssuerSetup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.4rem" }}>
              Issuer Private Key (never disclosed)
            </label>
            <input type="password" id="issuerKey" value={issuerKey} onChange={e => setIssuerKey(e.target.value)}
              placeholder="Enter issuer private signing key..." autoComplete="off" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.4rem" }}>
              Passing Score Threshold: <span style={{ color: "#a78bfa", fontWeight: 700 }}>{issuerThreshold}%</span>
            </label>
            <input type="range" min={40} max={100} step={5} value={issuerThreshold}
              onChange={e => setIssuerThreshold(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#8b5cf6" }} />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading} id="setIssuerBtn"
            style={{ alignSelf: "flex-start", marginTop: "0.25rem" }}>
            {loadingIssuer ? <><span className="spinner" /> Anchoring...</> : "Anchor Issuer Commitment (ZK Auth)"}
          </button>
        </form>
      </div>

      {/* Panel 2: Revoke Certificate */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem", borderLeft: "3px solid #ef4444" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          ⚡ Panel 2 — revokeCertificate(Bytes&lt;32&gt;)
        </div>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
          Revoke a fraudulent or expired certification commitment hash on-chain. Requires issuer cryptographic authorization.
        </p>
        <form onSubmit={handleRevoke} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.4rem" }}>
              Commitment Hash to Revoke *
            </label>
            <input type="text" id="revokeCommitment" value={revokeCommitment}
              onChange={e => setRevokeCommitment(e.target.value)}
              placeholder="0x... certification commitment hash to void" required />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading || !revokeCommitment} id="revokeBtn"
            style={{ alignSelf: "flex-start", background: "rgba(239,68,68,0.2)", borderColor: "rgba(239,68,68,0.5)", marginTop: "0.25rem" }}>
            {loadingRevoke ? <><span className="spinner" /> Revoking...</> : "Revoke Certificate (ZK Authorized)"}
          </button>
        </form>
      </div>

      {/* Panel 3: Reset Certification Program */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem", borderLeft: "3px solid #f59e0b" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f59e0b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          ⚡ Panel 3 — resetCertification(Bytes&lt;32&gt;, Uint&lt;32&gt;)
        </div>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
          Register a new skill offering ID and set the baseline passing threshold. Automatically increments the active session epoch.
        </p>
        <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.4rem" }}>
              New Skill Certification ID *
            </label>
            <input type="text" id="newSkillId" value={skillId} onChange={e => setSkillId(e.target.value)}
              placeholder="skill_advanced_zk_architect" required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.4rem" }}>
              New Passing Threshold: <span style={{ color: "#f59e0b", fontWeight: 700 }}>{resetThreshold}%</span>
            </label>
            <input type="range" min={40} max={100} step={5} value={resetThreshold}
              onChange={e => setResetThreshold(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#f59e0b" }} />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading} id="resetBtn"
            style={{ alignSelf: "flex-start", background: "rgba(245,158,11,0.2)", borderColor: "rgba(245,158,11,0.5)", marginTop: "0.25rem" }}>
            {loadingReset ? <><span className="spinner" /> Updating...</> : "Update Skill Program & Threshold"}
          </button>
        </form>
      </div>

      {/* Panel 4: Increment Session Epoch */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem", borderLeft: "3px solid #06b6d4" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#06b6d4", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          ⚡ Panel 4 — incrementSession()
        </div>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
          Bumps the <code>activeSession</code> nonce counter to prevent replay of proofs from previous certification periods.
        </p>
        <button onClick={handleIncrement} className="btn-secondary" disabled={isLoading} id="sessionBtn">
          {loadingSession ? <><span className="spinner" /> Incrementing...</> : "Increment Session Nonce"}
        </button>
      </div>

      {/* Activity Log */}
      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Activity Log</div>
          <div className="log-box">
            {logs.map((l, i) => <div key={i} className={`log-${l.type}`}>{l.msg}</div>)}
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="glass-card fade-in" style={{ padding: "1.5rem", border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.05)" }}>
          <p style={{ color: "#6ee7b7", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>✓ Transaction Confirmed On-Chain</p>
          {Object.entries(result).map(([k, v]) => v !== undefined && (
            <div key={k} style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", minWidth: 160 }}>{k}:</span>
              <span style={{ fontSize: "0.8rem", color: "#f1f5f9", fontFamily: "monospace", wordBreak: "break-all" }}>{String(v)}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <Link href="/" className="btn-secondary">Back to Dashboard</Link>
            <Link href="/explorer" className="btn-secondary">View in Explorer</Link>
          </div>
        </div>
      )}
    </div>
  );
}