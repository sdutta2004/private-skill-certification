"use client";
import Link from "next/link";
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from "../../lib/contract";

export default function InspectorPage() {
  const circuits = [
    { name: "issueCertificate", params: "expectedSkillId: Bytes<32>", returns: "Bytes<32>", privacy: "Candidate (ZK)", desc: "Submits candidate skill certification commitment. Generates ZK proof using 4 private witnesses (candidate key, nonce, record hash, candidate score proof)." },
    { name: "verifyCertificate", params: "claimedCommitment: Bytes<32>", returns: "Boolean", privacy: "Public", desc: "Verifies whether a claimed commitment hash matches the registered on-chain commitment without revealing candidate data." },
    { name: "revokeCertificate", params: "commitmentToRevoke: Bytes<32>", returns: "Bytes<32>", privacy: "Issuer (ZK Auth)", desc: "Revokes an existing certification commitment hash. Requires issuerSigningKey witness authorization." },
    { name: "setIssuerCommitment", params: "newThreshold: Uint<32>", returns: "Bytes<32>", privacy: "Issuer (ZK Auth)", desc: "Anchors the issuer's public authority commitment on-chain and updates the minimum certification score threshold." },
    { name: "resetCertification", params: "newSkillId: Bytes<32>, newThreshold: Uint<32>", returns: "Bytes<32>", privacy: "Issuer", desc: "Updates the on-chain skill identifier and adjusts passing score threshold for new exam programs." },
    { name: "incrementSession", params: "(none)", returns: "[]", privacy: "Issuer", desc: "Increments the activeSession epoch counter, invalidating stale proofs from previous testing cycles." },
  ];

  const witnesses = [
    { name: "candidateSecretKey()", type: "Bytes<32>", desc: "Private candidate identity key — computed client-side, never leaves device" },
    { name: "scoreProofNonce()", type: "Bytes<32>", desc: "Cryptographic entropy salt ensuring proof uniqueness and preventing linkability" },
    { name: "certificationRecordHash()", type: "Bytes<32>", desc: "SHA-256 hash of candidate's assessment and qualification payload" },
    { name: "candidateScoreProof()", type: "Uint<32>", desc: "Private assessment score verified >= certificationThreshold inside the circuit" },
    { name: "issuerSigningKey()", type: "Bytes<32>", desc: "Private issuer key used for governance and revocation authorizations" },
  ];

  const ledger = [
    { name: "certificateCount", type: "Counter", visibility: "Public", desc: "Total valid certifications issued" },
    { name: "revokedCount", type: "Counter", visibility: "Public", desc: "Total revoked certification commitments" },
    { name: "activeSession", type: "Counter", visibility: "Public", desc: "Epoch counter for replay protection" },
    { name: "skillId", type: "Bytes<32>", visibility: "Public", desc: "Identifier of active skill certification offering" },
    { name: "issuerCommitment", type: "Bytes<32>", visibility: "Public", desc: "Public anchor of issuer authority" },
    { name: "lastCertificationCommitment", type: "Bytes<32>", visibility: "Public", desc: "Most recently anchored certification commitment" },
    { name: "lastRevokedCommitment", type: "Bytes<32>", visibility: "Public", desc: "Most recently revoked commitment hash" },
    { name: "certificationThreshold", type: "Uint<32>", visibility: "Public", desc: "Required score threshold (e.g. 70%)" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-purple">Inspector</span>
          <span className="badge badge-amber">Compact v0.23</span>
          <span className="badge badge-green">Zero-Knowledge</span>
        </div>
        <h1 className="section-title" style={{ fontSize: "1.85rem" }}>Smart Contract Inspector</h1>
        <p className="section-desc">
          Complete structural inspection of the Private Skill Certification Compact smart contract deployed on Midnight Preview Testnet.
        </p>
      </div>

      {/* Contract Reference */}
      <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Deployed Contract Address</div>
        <div style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#a78bfa", wordBreak: "break-all" }}>{CONTRACT_ADDRESS}</div>
      </div>

      {/* Circuits */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "1rem" }}>Exported Circuits (6)</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {circuits.map(c => (
            <div key={c.name} style={{ background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#a78bfa", fontSize: "0.9rem" }}>{c.name}</span>
                <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem", borderRadius: "99px", background: "rgba(139,92,246,0.15)", color: "#a78bfa", fontWeight: 600 }}>{c.privacy}</span>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#64748b", marginBottom: "0.4rem" }}>
                inputs: {c.params} → returns: {c.returns}
              </div>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Witnesses */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "1rem" }}>Private Witnesses (5)</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {witnesses.map(w => (
            <div key={w.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#38bdf8", fontWeight: 600 }}>{w.name}</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b", marginLeft: "0.5rem" }}>: {w.type}</span>
              </div>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{w.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ledger State */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "1rem" }}>Public Ledger Fields (8)</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {ledger.map(l => (
            <div key={l.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#10b981", fontWeight: 600 }}>{l.name}</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b", marginLeft: "0.5rem" }}>: {l.type}</span>
              </div>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{l.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}