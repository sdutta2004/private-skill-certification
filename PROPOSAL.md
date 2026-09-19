# Project Proposal: Private Skill Certification (PSC)

> **Zero-Knowledge Developer Skill & Professional Accreditation Protocol on Midnight Network**

[![Midnight Network](https://img.shields.io/badge/Network-Midnight_Preview-8b5cf6?style=flat-square)](https://preview.midnightexplorer.com/contracts/0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f)
[![Compact Language](https://img.shields.io/badge/Compact-v0.23-06b6d4?style=flat-square)](https://midnight.network)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## Executive Summary

**Private Skill Certification (PSC)** is a privacy-preserving dApp engineered on the **Midnight Network** utilizing **Compact zero-knowledge (ZK) smart contracts**. PSC solves a critical problem in technical hiring and professional accreditation: **unnecessary exposure of personal identity, assessment test scores, and full resume credentials during candidate screening.**

By generating zero-knowledge proofs client-side in the candidate's browser, developers and professionals prove skill competency, test scores, or credential validity without exposing their full identity, government ID, or exact exam percentage to employers or third-party recruiters. A cryptographic **certification commitment hash** is recorded on-chain, ensuring complete auditability and tamper-proof verification while preventing hiring bias and data harvesting.

---

## Problem Statement & Solution

### The Problem
1. **Hiring Bias & Exposure**: Employers and recruiters often subconsciously filter applicants based on age, gender, location, or institution names rather than raw technical capability.
2. **Over-Disclosure of Credentials**: Standard credential verification requires sharing entire unencrypted certificates containing full legal names, birth dates, and internal test IDs.
3. **Credential Fraud**: Traditional PDF certificates and digital badges are easily falsified without an immutable zero-knowledge on-chain anchor.

### The Midnight ZK Solution
PSC leverages Midnight's dual-state (private witness vs. public ledger) architecture:
- **Client-Side Proof Generation**: The candidate's private key (`candidateSecretKey`), entropy salt (`scoreProofNonce`), and hashed skill qualification payload (`certificationRecordHash`) are computed locally inside the browser.
- **On-Chain Public Verification**: The Midnight Compact contract verifies that the candidate satisfies the required qualification criteria for `skillId` without exposing raw identity or score breakdown.

---

## Technical Architecture & Compact Contract Design

### Smart Contract Specification (`contracts/counter.compact`)

```compact
pragma language_version 0.23;
import CompactStandardLibrary;

export ledger certificateCount: Counter;
export ledger revokedCount: Counter;
export ledger activeSession: Counter;
export ledger skillId: Bytes<32>;
export ledger issuerCommitment: Bytes<32>;
export ledger lastCertificationCommitment: Bytes<32>;
export ledger lastRevokedCommitment: Bytes<32>;
export ledger certificationThreshold: Uint<32>;

witness candidateSecretKey(): Bytes<32>;
witness scoreProofNonce(): Bytes<32>;
witness certificationRecordHash(): Bytes<32>;
witness candidateScoreProof(): Uint<32>;
witness issuerSigningKey(): Bytes<32>;

export circuit issueCertificate(expectedSkillId: Bytes<32>): Bytes<32> {
  // Verifies candidateScore >= certificationThreshold in ZK
  // Anchors commitment hash on-chain
}

export circuit verifyCertificate(claimedCommitment: Bytes<32>): Boolean {
  // Public verification against ledger record
}

export circuit revokeCertificate(commitmentToRevoke: Bytes<32>): Bytes<32> {
  // Issuer revocation with ZK authorization proof
}

export circuit setIssuerCommitment(newThreshold: Uint<32>): Bytes<32> {
  // Sets passing score threshold and authority anchor
}

export circuit resetCertification(newSkillId: Bytes<32>, newThreshold: Uint<32>): Bytes<32> {
  // Rotates active skill program
}

export circuit incrementSession(): [] {
  // Bumps session epoch nonce
}
```

---

## Live Deployment & Verification

- **Contract Address**: `0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f`
- **Midnight Explorer**: [https://preview.midnightexplorer.com/contracts/0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f](https://preview.midnightexplorer.com/contracts/0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f)
- **GitHub Repository**: [https://github.com/sdutta2004/private-skill-certification](https://github.com/sdutta2004/private-skill-certification)
- **Live Demo Video**: [https://youtu.be/pXix0DCIdFo](https://youtu.be/pXix0DCIdFo)
- **Live Application**: [https://private-skill-certification.vercel.app/](https://private-skill-certification.vercel.app/)

---

## Verification Checklist

- [x] **Zero-Knowledge Privacy**: Assessment scores and candidate identities remain client-side
- [x] **Compact Circuits**: 6 functional circuits compiled and validated
- [x] **Midnight.js Integration**: DApp Connector API for Midnight Lace wallet connection
- [x] **Test Coverage**: 10/10 Vitest unit tests passing
- [x] **Production Ready**: Next.js 14 App Router static build verified