"use client";
import { useState } from "react";
import { getClient } from "../../lib/contract";
import Link from "next/link";

export default function IssueCertificatePage() {
  const [skillId, setSkillId] = useState("skill_fullstack_zk_engineer");
  const [candidateKey, setCandidateKey] = useState("");
  const [certRecord, setCertRecord] = useState("");
  const [candidateScore, setCandidateScore] = useState(85);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [claimedCommitment, setClaimedCommitment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);

  const PASSING_THRESHOLD = 70;
  const addLog = (msg: string, type = "info") => setLogs(l => [...l, { msg, type }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null); setLogs([]);
    try {
      addLog("> [WALLET] Verifying active 1AM Wallet approval...", "info");
      const client = getClient();
      if (!client.isConnected || !client.walletApi) {
        addLog("> [APPROVAL REQUIRED] Requesting 1AM Wallet DApp Connector approval popup...", "info");
        await client.connectWallet();
      }
      addLog(`> [WALLET APPROVED] Verified 1AM Wallet active: ${client.connectedAddress}`, "success");
      client.setCandidateSecretKey(candidateKey || "anonymous_candidate_key_default_2026");
      client.setCertificationRecord(certRecord || "assessment_verified_payload_cs");
      client.setCandidateScore(candidateScore);

      addLog("> [ZK WITNESS] candidateSecretKey() — private identity witness, never leaves device", "info");
      addLog("> [ZK WITNESS] scoreProofNonce() — cryptographic entropy salt for replay protection", "info");
      addLog("> [ZK WITNESS] certificationRecordHash() — SHA-256 hash of assessment record", "info");
      addLog(`> [ZK WITNESS] candidateScoreProof() — score ${candidateScore}% checked privately vs. ${PASSING_THRESHOLD}% threshold`, "info");
      addLog(`> [ZK THRESHOLD] Verifying candidateScore >= certificationThreshold in Zero-Knowledge...`, "info");

      if (candidateScore < PASSING_THRESHOLD) {
        addLog(`> [REJECTED] Score ${candidateScore}% is below required ${PASSING_THRESHOLD}% passing threshold`, "error");
        setError(`Score requirement not met: ${candidateScore}% is below the required ${PASSING_THRESHOLD}% threshold.`);
        return;
      }

      addLog("> [CIRCUIT] Executing issueCertificate(Bytes<32>) on Midnight Network...", "info");
      const res = await client.issueCertificate(skillId);
      setResult(res);
      setClaimedCommitment(res.commitmentHex);
      addLog(`> [SUCCESS] Certificate issued! TxHash: ${res.txHash}`, "success");
      addLog(`> [COMMITMENT] ZK Commitment: ${res.commitmentHex}`, "success");
      addLog(`> [PRIVACY] Score, identity, record — NEVER disclosed on-chain`, "success");
      addLog(`> [FEE] Transaction fee: ${res.txFee} ${res.txFeeAsset}`, "info");
    } catch (err: any) {
      const msg = err?.message || "Certificate issuance failed.";
      setError(msg);
      addLog(`> [ERROR] ${msg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoVerify = async (identifier: string) => {
    if (!identifier.trim()) return;
    setClaimedCommitment(identifier.trim());
    setVerifyLoading(true);
    setVerifyResult(null);
    try {
      addLog(`> [VERIFY] Initiating verification for: ${identifier.trim().slice(0, 18)}...`, "info");
      addLog("> [CIRCUIT] Executing verifyCertificate(Bytes<32>) on Midnight Network...", "info");
      const res = await getClient().verifyCertificate(identifier.trim());
      setVerifyResult(res);
      addLog(
        res.matches
          ? "> [VERIFIED] Credential is VALID! (ZK Commitment match on Midnight Preview)"
          : "> [MISMATCH] Commitment does not match registered state.",
        res.matches ? "success" : "error"
      );
      const el = document.getElementById("verify-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } catch (err: any) {
      addLog(`> [ERROR] ${err?.message || err}`, "error");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimedCommitment.trim()) return;
    await handleAutoVerify(claimedCommitment.trim());
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <span className="badge badge-purple">ZK Certification</span>
          <span className="badge badge-green">Midnight Preview</span>
          <span className="badge badge-amber">Score Threshold</span>
        </div>
        <h1 className="section-title" style={{ fontSize: "1.85rem" }}>Issue Skill Certificate Anonymously</h1>
        <p className="section-desc">
          Your identity, exam score, and assessment records stay fully private on your device. A ZK proof verifies your score meets the threshold — only a cryptographic commitment hash is disclosed on-chain.
        </p>
      </div>

      {/* ZK Architecture Info */}
      <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem", borderLeft: "3px solid #8b5cf6" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#8b5cf6", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          ZK Circuit Architecture — issueCertificate(Bytes&lt;32&gt;)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "candidateSecretKey()", desc: "Private identity witness", color: "#ef4444" },
            { label: "scoreProofNonce()", desc: "Entropy/replay binding", color: "#f59e0b" },
            { label: "certificationRecordHash()", desc: "Hashed assessment record", color: "#06b6d4" },
            { label: "candidateScoreProof()", desc: "Private score >= threshold", color: "#10b981" },
          ].map(w => (
            <div key={w.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "0.75rem", border: `1px solid ${w.color}33` }}>
              <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: w.color, marginBottom: "0.25rem" }}>{w.label}</div>
              <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Issue Certificate Form */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Skill Certification Identifier (Public Input) *
            </label>
            <input type="text" id="skillId" value={skillId} onChange={e => setSkillId(e.target.value)}
              placeholder="e.g. skill_fullstack_zk_engineer" required />
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>Identifies which certified skill competency is registered on-chain by the issuer</p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Candidate Secret Key — Private Witness
            </label>
            <input type="password" id="candidateKey" value={candidateKey} onChange={e => setCandidateKey(e.target.value)}
              placeholder="Your private secret key (never leaves your device)" autoComplete="off" />
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>
              Used locally to generate <code>candidateSecretKey()</code> ZK witness — never transmitted
            </p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Assessment Score (Threshold Check in ZK): <span style={{ color: candidateScore >= PASSING_THRESHOLD ? "#10b981" : "#ef4444", fontWeight: 700 }}>{candidateScore}%</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <input type="range" min={0} max={100} step={1} value={candidateScore}
                onChange={e => setCandidateScore(Number(e.target.value))}
                style={{ flex: 1, accentColor: candidateScore >= PASSING_THRESHOLD ? "#10b981" : "#ef4444" }} />
              <span style={{
                fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "99px",
                background: candidateScore >= PASSING_THRESHOLD ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: candidateScore >= PASSING_THRESHOLD ? "#10b981" : "#ef4444", fontWeight: 700
              }}>
                {candidateScore >= PASSING_THRESHOLD ? "✓ ELIGIBLE (PASS)" : "✕ BELOW THRESHOLD"}
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>
              Verified client-side: score must be &gt;= {PASSING_THRESHOLD}%. The exact percentage is never written to the blockchain.
            </p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Assessment Record / Payload
            </label>
            <textarea id="certRecord" value={certRecord} onChange={e => setCertRecord(e.target.value)}
              placeholder="Paste assessment verification data or qualification hash..."
              rows={3} style={{ resize: "vertical" }} />
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>
              Hashed locally via SHA-256 into <code>certificationRecordHash()</code> — plaintext never exposed
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <button type="submit" className="btn-primary" disabled={loading} id="issueBtn">
              {loading ? <><span className="spinner" /> Generating ZK Proof...</> : "🎓 Issue Certificate (ZK Proof)"}
            </button>
            <Link href="/" className="btn-secondary">Back to Dashboard</Link>
          </div>
        </form>
      </div>

      {/* Activity Logs */}
      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Activity Log</div>
          <div className="log-box">
            {logs.map((l, i) => <div key={i} className={`log-${l.type}`}>{l.msg}</div>)}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="glass-card fade-in" style={{ padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
          <p style={{ color: "#fca5a5", fontWeight: 600 }}>Error</p>
          <p style={{ color: "#94a3b8", marginTop: "0.5rem", fontSize: "0.9rem" }}>{error}</p>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="glass-card fade-in" style={{ padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.05)" }}>
          <p style={{ color: "#6ee7b7", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>✓ Skill Certificate Confirmed On-Chain!</p>
          {[
            { label: "Circuit", value: "issueCertificate(Bytes<32>)" },
            { label: "ZK Certification Commitment", value: result.commitmentHex },
            { label: "On-Chain TxHash", value: result.txHash },
            { label: "Score Threshold Met", value: result.scoreThresholdMet ? "✓ Met (Zero-Knowledge)" : "✕ Not Met" },
            { label: "Signed By", value: result.signedBy },
            { label: "Tx Fee", value: `${result.txFee} ${result.txFeeAsset}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", minWidth: 190 }}>{label}:</span>
              <span style={{ fontSize: "0.8rem", color: "#f1f5f9", fontFamily: "monospace", wordBreak: "break-all" }}>{value as string}</span>
            </div>
          ))}
          <p style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "0.75rem", fontWeight: 600 }}>Status: CONFIRMED (Midnight Preview)</p>

          {/* Quick Action & Verification Buttons */}
          <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", borderTop: "1px solid rgba(16,185,129,0.2)", paddingTop: "1rem" }}>
            <button
              type="button"
              id="autoVerifyBtn"
              onClick={() => handleAutoVerify(result.commitmentHex)}
              className="btn-primary"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", borderColor: "#10b981", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}
            >
              🔍 1-Click Verify Issued Credential
            </button>
            <button
              type="button"
              onClick={() => handleAutoVerify(result.txHash)}
              className="btn-secondary"
              style={{ borderColor: "rgba(56,189,248,0.4)", color: "#38bdf8" }}
            >
              ⚡ Verify via TxHash
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(result.commitmentHex);
                addLog("> [COPIED] ZK Commitment copied to clipboard", "success");
              }}
              className="btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.8rem" }}
            >
              📋 Copy Commitment
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(result.txHash);
                addLog("> [COPIED] On-Chain TxHash copied to clipboard", "success");
              }}
              className="btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.8rem" }}
            >
              📋 Copy TxHash
            </button>
          </div>
        </div>
      )}

      {/* Verify Certificate Panel */}
      <div id="verify-section" className="glass-card" style={{ padding: "1.5rem", borderLeft: "3px solid #06b6d4" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#06b6d4", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Verify Skill Certificate — verifyCertificate(Bytes&lt;32&gt;)
        </div>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.75rem" }}>
          Employers, hiring managers, and institutions can publicly verify whether a candidate's claimed certificate is anchored on-chain without learning test scores or identity.
        </p>
        <p style={{ fontSize: "0.78rem", color: "#38bdf8", marginBottom: "1rem" }}>
          💡 <strong>Supports Dual Verification:</strong> Enter either the <strong>ZK Commitment Hash</strong> or the <strong>On-Chain TxHash</strong> below.
        </p>

        <form onSubmit={handleVerify} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            type="text"
            id="claimedCommitment"
            value={claimedCommitment}
            onChange={e => setClaimedCommitment(e.target.value)}
            placeholder="0x... (Paste ZK Commitment or On-Chain TxHash)"
            style={{ flex: 1, minWidth: "260px" }}
          />
          <button type="submit" className="btn-secondary" disabled={verifyLoading} id="verifyBtn" style={{ whiteSpace: "nowrap" }}>
            {verifyLoading ? <><span className="spinner" /> Verifying On-Chain...</> : "Verify On-Chain"}
          </button>
        </form>

        {/* Quick Fill Buttons */}
        {result && (
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Quick Fill:</span>
            <button
              type="button"
              onClick={() => setClaimedCommitment(result.commitmentHex)}
              style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)", cursor: "pointer" }}
            >
              Insert ZK Commitment
            </button>
            <button
              type="button"
              onClick={() => setClaimedCommitment(result.txHash)}
              style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(56,189,248,0.15)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)", cursor: "pointer" }}
            >
              Insert TxHash
            </button>
          </div>
        )}

        {/* Verification Result */}
        {verifyResult && (
          <div style={{
            marginTop: "1.25rem",
            padding: "1rem 1.25rem",
            borderRadius: "8px",
            background: verifyResult.matches ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${verifyResult.matches ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ color: verifyResult.matches ? "#10b981" : "#ef4444", fontSize: "1.1rem" }}>
                {verifyResult.matches ? "✓" : "✕"}
              </span>
              <span style={{ color: verifyResult.matches ? "#6ee7b7" : "#fca5a5", fontWeight: 700, fontSize: "0.98rem" }}>
                {verifyResult.matches ? "VALID — Skill Certificate Verified On-Chain" : "INVALID — Commitment Mismatch"}
              </span>
              {verifyResult.matches && (
                <span className="badge badge-green" style={{ marginLeft: "auto", fontSize: "0.7rem" }}>
                  Zero-Knowledge Proof Verified
                </span>
              )}
            </div>

            

            {verifyResult.matches ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.78rem" }}>
                <div>
                  <span style={{ color: "#64748b" }}>Circuit: </span>
                  <span style={{ color: "#f1f5f9", fontFamily: "monospace" }}>verifyCertificate(Bytes&lt;32&gt;)</span>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>ZK Commitment: </span>
                  <span style={{ color: "#6ee7b7", fontFamily: "monospace", wordBreak: "break-all" }}>
                    {verifyResult.claimedCommitment}
                  </span>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>On-Chain TxHash: </span>
                  <span style={{ color: "#94a3b8", fontFamily: "monospace", wordBreak: "break-all" }}>
                    {verifyResult.txHash || "Confirmed on-chain"}
                  </span>
                </div>
                {verifyResult.skillId && (
                  <div>
                    <span style={{ color: "#64748b" }}>Certified Competency: </span>
                    <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{verifyResult.skillId}</span>
                  </div>
                )}
                <div>
                  <span style={{ color: "#64748b" }}>Verification Mode: </span>
                  <span style={{ color: "#10b981", fontWeight: 600 }}>
                    {verifyResult.verificationMethod === "on-chain-indexer"
                      ? "Midnight Preview Indexer (Direct Public Ledger State)"
                      : "Zero-Knowledge Circuit Proof & Cryptographic Witness Anchor"}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
                  {verifyResult.details || "The provided identifier does not match any registered on-chain certificate commitment or active session proof."}
                </p>
                {result && (
                  <div style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "#f59e0b", background: "rgba(245,158,11,0.08)", padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid rgba(245,158,11,0.2)" }}>
                    💡 Did you just issue a certificate? Click the <strong>&quot;🔍 1-Click Verify Issued Credential&quot;</strong> button above to verify your issued commitment automatically.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
