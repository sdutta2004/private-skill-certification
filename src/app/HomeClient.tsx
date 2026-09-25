"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getClient, CONTRACT_ADDRESS, NETWORK_CONFIG } from "../lib/contract";
import styles from "./page.module.css";

// Dynamic import for Three.js 3D wave component to prevent SSR hydration mismatch
const OrganicWave3D = dynamic(() => import("../components/OrganicWave3D"), {
  ssr: false,
});

export default function HomeClient() {
  const [stats, setStats] = useState({
    certificateCount: 0,
    revokedCount: 0,
    activeSession: 1,
    skillId: "skill_fullstack_zk_engineer",
    lastCertificationCommitment: "0x...",
    certificationThreshold: 70,
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getClient()
      .fetchPublicState()
      .then((s) => {
        setStats(s);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    {
      num: "01 / PRIVACY",
      title: "Zero-Knowledge Skill Proofs",
      desc: "Prove assessment score meets or exceeds certification threshold (e.g. >= 70%) without ever revealing your actual score or exam transcript to employers.",
    },
    {
      num: "02 / ANTI-BIAS",
      title: "Anonymous Assessment Screening",
      desc: "Candidate identity, demographic data, and test records remain client-side. Only a tamper-proof cryptographic commitment is anchored on-chain.",
    },
    {
      num: "03 / SMART CONTRACT",
      title: "Midnight Compact v0.23",
      desc: "Architected with 6 specialized zero-knowledge circuits executing on Midnight Preview Testnet with native Midnight.js SDK integration.",
    },
    {
      num: "04 / VERIFIABILITY",
      title: "Publicly Verifiable Credentials",
      desc: "Employers and institutions can publicly verify claimed certification commitments against the live Midnight ledger in milliseconds.",
    },
  ];

  return (
    <div className={styles.wrapper}>
      {/* 3D Wave Hero Section */}
      <section className={styles.hero}>
        <OrganicWave3D />

        <div className={styles.heroContent}>
          {/* Top Pill Badge */}
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            <span>Midnight Network • Preview Testnet</span>
          </div>

          {/* Clean Pure White Main Title */}
          <h1 className={styles.heroTitle}>
            Elevate Your
            <span className={styles.heroTitleHighlight}>Proof of Competency</span>
          </h1>

          {/* Clean Subtitle */}
          <p className={styles.heroDesc}>
            Verify developer qualifications and professional assessments in complete privacy using zero-knowledge proofs on the Midnight Network — zero test score exposure, zero identity leaks.
          </p>

          {/* Hero Action Buttons */}
          <div className={styles.heroActions}>
            <Link href="/submit" className="btn-pill-primary">
              Issue Certificate
            </Link>
            <Link href="/submit#verify-section" className="btn-pill-ghost">
              Verify Credential
            </Link>
          </div>
        </div>

        {/* Floating 3D Frosted Glass Cards (Matching Reference Layout) */}
        <div className={styles.floatingCardsContainer}>
          {/* Left Floating Card */}
          <div className={styles.floatingCardLeft}>
            <div className={cardHeaderRow()}>
              <span className={styles.cardCategory}>Zero-Knowledge Proofs</span>
              <span className={styles.cardArrowIcon}>↗</span>
            </div>
            <div className={styles.cardMainTitle}>100% Score Privacy</div>
            <div className={styles.cardSubRow}>
              <span className={styles.cardSubText}>Identity & Record Shielded</span>
              <span className={styles.cardPercentBadge}>ZK-SNARK</span>
            </div>
          </div>

          {/* Right Floating Card */}
          <div className={styles.floatingCardRight}>
            <div className={cardHeaderRow()}>
              <span className={styles.cardCategory}>Passing Qualification</span>
              <span className={styles.cardArrowIcon}>↗</span>
            </div>
            <div className={styles.cardBigStat}>96%</div>
            <span className={styles.cardSubText}>Assessment Precision Rate</span>
            <div className={styles.progressBarTrack}>
              <div className={styles.progressBarFill} style={{ width: "96%" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Live Ledger State & Features Section */}
      <section className={styles.ledgerSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Decentralized State</span>
          <h2 className={styles.sectionTitle}>Midnight Preview Ledger</h2>
          <p className={styles.sectionDesc}>
            Direct zero-knowledge state anchors queried from the official Midnight Preview GraphQL indexer.
          </p>
        </div>

        {/* Live Metrics Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Certificates Issued</div>
            <div className={styles.statValue}>
              {loading ? "..." : stats.certificateCount}
            </div>
            <div className={styles.statFootnote}>On-Chain ZK Commitments</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Passing Threshold</div>
            <div className={styles.statValue}>
              {loading ? "..." : `${stats.certificationThreshold}%`}
            </div>
            <div className={styles.statFootnote}>Enforced in Zero-Knowledge</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Active Session Epoch</div>
            <div className={styles.statValue}>
              {loading ? "..." : `#${stats.activeSession}`}
            </div>
            <div className={styles.statFootnote}>Replay Protection Nonce</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Active Track</div>
            <div className={styles.statValue} style={{ fontSize: "1.1rem", paddingTop: "0.5rem" }}>
              Full-Stack ZK
            </div>
            <div className={styles.statFootnote}>{stats.skillId}</div>
          </div>
        </div>

        {/* Canonical Smart Contract Card */}
        <div className={styles.contractBar}>
          <div className={styles.contractInfo}>
            <span className={styles.contractLabel}>Canonical Midnight Preview Contract</span>
            <span className={styles.contractAddress}>{CONTRACT_ADDRESS}</span>
          </div>
          <div className={styles.contractActions}>
            <button
              onClick={copyAddress}
              className="btn-pill-ghost"
              style={{ padding: "0.5rem 1.2rem", fontSize: "0.82rem" }}
            >
              {copied ? "Copied ✓" : "Copy Address"}
            </button>
            <a
              href={NETWORK_CONFIG.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill-primary"
              style={{ padding: "0.5rem 1.2rem", fontSize: "0.82rem" }}
            >
              Midnight Explorer ↗
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <div className={styles.featuresGrid}>
          {features.map((f) => (
            <div key={f.num} className={styles.featureCard}>
              <span className={styles.featureNumber}>{f.num}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function cardHeaderRow() {
  return styles.cardHeaderRow;
}
