"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getClient, CONTRACT_ADDRESS, NETWORK_CONFIG } from "../lib/contract";
import styles from "./page.module.css";

export default function HomeClient() {
  const [stats, setStats] = useState({ certificateCount: 0, skillId: "skill_fullstack_zk_engineer", lastCertificationCommitment: "0x...", activeSession: 1 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getClient().fetchPublicState().then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    {
      icon: "🛡️",
      title: "Zero-Knowledge Skill Proofs",
      desc: "Prove assessment score meets or exceeds certification threshold (e.g. >= 70%) without ever revealing your actual score to employers.",
      badge: "Privacy-Preserving",
      color: "#8b5cf6",
    },
    {
      icon: "👤",
      title: "Anti-Bias Anonymous Screening",
      desc: "Candidate identity, demographic data, and test records remain client-side. Only a tamper-proof cryptographic commitment enters the blockchain.",
      badge: "Anti-Bias",
      color: "#06b6d4",
    },
    {
      icon: "⚡",
      title: "Midnight Compact Smart Contract",
      desc: "Built with Compact v0.23 with 6 specialized circuits running on Midnight Preview Testnet with native Midnight.js SDK integration.",
      badge: "On-Chain ZK",
      color: "#10b981",
    },
    {
      icon: "🔍",
      title: "Publicly Verifiable Credentials",
      desc: "Employers and institutions can publicly verify claimed certification commitments against the Midnight ledger in milliseconds.",
      badge: "Verifiable",
      color: "#f59e0b",
    },
  ];

  return (
    <div className={styles.wrapper}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", display: "inline-block" }} />
          <span>Midnight Network • Preview Testnet</span>
        </div>
        <h1 className={styles.heroTitle}>
          Private Skill<br />
          <span className={styles.heroGradient}>Certification Protocol</span>
        </h1>
        <p className={styles.heroDesc}>
          Issue and verify verified developer and professional skill credentials using <strong>zero-knowledge proofs</strong> on the Midnight Network. Your assessment score and identity stay private — only a cryptographic commitment is anchored on-chain.
        </p>
        <div className={styles.heroCTA}>
          <Link href="/submit" className="btn-primary" style={{ fontSize: "0.95rem", padding: "0.75rem 2rem", borderRadius: "50px" }}>
            🎓 Issue Certificate →
          </Link>
          <Link href="/explorer" className="btn-secondary" style={{ fontSize: "0.95rem", padding: "0.75rem 2rem", borderRadius: "50px" }}>
            🔍 View On-Chain State
          </Link>
          <a href={NETWORK_CONFIG.explorerUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: "0.95rem", padding: "0.75rem 1.75rem", borderRadius: "50px", color: "#a78bfa", borderColor: "rgba(139,92,246,0.3)" }}>
            🚀 Midnight Explorer ↗
          </a>
        </div>
      </section>

      {/* Stats Cards */}
      <section className={styles.statsGrid}>
        <div className="glass-card stat-card fade-in" style={{ padding: "1.5rem" }}>
          <div className="stat-label" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "0.5rem" }}>Total Certificates Issued</div>
          <div className="stat-value" style={{ fontSize: "2rem", fontWeight: 800, color: "#f1f5f9" }}>{loading ? "..." : stats.certificateCount}</div>
          <div style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "0.25rem" }}>✓ Confirmed on-chain</div>
        </div>
        <div className="glass-card stat-card fade-in" style={{ padding: "1.5rem" }}>
          <div className="stat-label" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "0.5rem" }}>Active Session Epoch</div>
          <div className="stat-value" style={{ fontSize: "2rem", fontWeight: 800, color: "#06b6d4" }}>{loading ? "..." : stats.activeSession}</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Epoch replay protection</div>
        </div>
        <div className="glass-card stat-card fade-in" style={{ padding: "1.5rem" }}>
          <div className="stat-label" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "0.5rem" }}>Active Skill Offering</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#a78bfa", marginTop: "0.35rem", wordBreak: "break-all", fontFamily: "monospace" }}>
            {loading ? "..." : stats.skillId}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Active credential domain</div>
        </div>
        <div className="glass-card stat-card fade-in" style={{ padding: "1.5rem" }}>
          <div className="stat-label" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "0.5rem" }}>Network & Framework</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#38bdf8", marginTop: "0.35rem" }}>Midnight Preview</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Compact v0.23 • Next.js 14</div>
        </div>
      </section>

      {/* Contract Verification Card */}
      <section className={styles.infoSection}>
        <div className="glass-card" style={{ padding: "1.75rem", border: "1px solid rgba(139,92,246,0.25)", background: "rgba(139,92,246,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>📜</span>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9" }}>Deployed Midnight Smart Contract</h2>
            </div>
            <span style={{ fontSize: "0.72rem", padding: "0.25rem 0.75rem", borderRadius: "99px", background: "rgba(16,185,129,0.15)", color: "#34d399", fontWeight: 700, border: "1px solid rgba(16,185,129,0.3)" }}>
              LIVE ON PREVIEW
            </span>
          </div>
          <div className={styles.infoGrid}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Contract Address</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", background: "rgba(0,0,0,0.3)", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#c4b5fd", wordBreak: "break-all", flex: 1 }}>{CONTRACT_ADDRESS}</span>
                <button onClick={copyAddress} style={{ padding: "0.35rem 0.85rem", fontSize: "0.75rem", borderRadius: "6px", background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.4)", color: "#a78bfa", cursor: "pointer", fontWeight: 600 }}>
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
                <a href={NETWORK_CONFIG.explorerUrl} target="_blank" rel="noreferrer" style={{ padding: "0.35rem 0.85rem", fontSize: "0.75rem", borderRadius: "6px", background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", color: "#fff", textDecoration: "none", fontWeight: 600 }}>
                  View on Explorer ↗
                </a>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Indexer GraphQL</div>
              <span style={{ color: "#94a3b8", fontSize: "0.78rem", fontFamily: "monospace" }}>{NETWORK_CONFIG.indexerUrl}</span>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Node RPC</div>
              <span style={{ color: "#94a3b8", fontSize: "0.78rem", fontFamily: "monospace" }}>{NETWORK_CONFIG.nodeUrl}</span>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Preview Faucet</div>
              <a href={NETWORK_CONFIG.faucetUrl} target="_blank" rel="noreferrer" style={{ color: "#06b6d4", fontSize: "0.78rem" }}>
                Get Free Test tDUST ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section style={{ marginBottom: "3rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            Why Private Skill Certification?
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Verifiable competency assessments without compromising sensitive personal or candidate data.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
          {features.map(f => (
            <div key={f.title} className="glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "1.75rem" }}>{f.icon}</span>
                <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: "99px", background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}30`, fontWeight: 700 }}>
                  {f.badge}
                </span>
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9" }}>{f.title}</h3>
              <p style={{ fontSize: "0.83rem", color: "#94a3b8", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Quick Cards */}
      <section className={styles.navCards}>
        <Link href="/submit" className={`glass-card ${styles.navCard}`}>
          <div className={styles.navCardIcon}>✍️</div>
          <div className={styles.navCardTitle}>Issue Certificate</div>
          <div className={styles.navCardDesc}>Submit a private zero-knowledge skill proof with local witness injection to claim on-chain credentials.</div>
          <div className={styles.navCardArrow}>→</div>
        </Link>
        <Link href="/admin" className={`glass-card ${styles.navCard}`}>
          <div className={styles.navCardIcon}>🛡️</div>
          <div className={styles.navCardTitle}>Issuer Console</div>
          <div className={styles.navCardDesc}>Issuer governance: set passing score thresholds, revoke credentials, and rotate skill programs.</div>
          <div className={styles.navCardArrow}>→</div>
        </Link>
        <Link href="/explorer" className={`glass-card ${styles.navCard}`}>
          <div className={styles.navCardIcon}>🔍</div>
          <div className={styles.navCardTitle}>Chain Explorer</div>
          <div className={styles.navCardDesc}>Inspect live on-chain public state, total issued credentials, and recent ZK commitment hashes.</div>
          <div className={styles.navCardArrow}>→</div>
        </Link>
        <Link href="/inspector" className={`glass-card ${styles.navCard}`}>
          <div className={styles.navCardIcon}>⚙️</div>
          <div className={styles.navCardTitle}>ZK Inspector</div>
          <div className={styles.navCardDesc}>Deep-dive into the Compact v0.23 circuits, witness schemas, and public ledger field definitions.</div>
          <div className={styles.navCardArrow}>→</div>
        </Link>
      </section>
    </div>
  );
}