# Private Skill Certification (PSC)

> A privacy-preserving zero-knowledge professional skill certification and assessment verification dApp built on the Midnight Network using Compact smart contracts and Midnight.js SDK.

[![GitHub Repo](https://img.shields.io/badge/GitHub-private--skill--certification-181717?style=flat-square&logo=github)](https://github.com/sdutta2004/private-skill-certification)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_App-000000?style=flat-square&logo=vercel)](https://private-skill-certification-xfp3.vercel.app/)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo_Video-FF0000?style=flat-square&logo=youtube)](https://youtu.be/Eu6eRTsOWE4)
[![Framework](https://img.shields.io/badge/Framework-Next.js_14-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![CI/CD Pipeline](https://github.com/sdutta2004/private-skill-certification/actions/workflows/ci.yml/badge.svg)](https://github.com/sdutta2004/private-skill-certification/actions/workflows/ci.yml)
[![Midnight Network](https://img.shields.io/badge/Network-Midnight_Preview-8b5cf6?style=flat-square)](https://preview.midnightexplorer.com/contracts/0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f)
[![Compact Language](https://img.shields.io/badge/Compact-v0.23-06b6d4?style=flat-square)](https://midnight.network)
[![Tests](https://img.shields.io/badge/Tests-10%2F10_Passing-10b981?style=flat-square)](https://github.com/sdutta2004/private-skill-certification)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## What Is PSC?

**Private Skill Certification (PSC)** enables candidates to certify professional competencies, coding assessments, and exam qualifications **without exposing candidate identity, exact test scores, or assessment attempts** to employers or third parties.

Built on Midnight Network's Compact zero-knowledge smart contracts, candidates generate cryptographic ZK proofs locally on their own device. Only a certification commitment hash is anchored on-chain — eliminating hiring bias, credential fraud, and privacy leaks.

> **Verify professional skill credentials mathematically — without exposing personal test scores or identity.**

---

## Live Demo Video

> **Demonstrates:** Midnight Lace wallet connection → client-side ZK witness generation → on-chain `issueCertificate()` execution → public state verification on Midnight Preview.

[![PSC Video Walkthrough](https://img.shields.io/badge/YouTube-Watch%20Live%20Demo-FF0000?style=for-the-badge&logo=youtube)](https://youtu.be/Eu6eRTsOWE4)

**Watch on YouTube**: [https://youtu.be/Eu6eRTsOWE4](https://youtu.be/Eu6eRTsOWE4)

---

## Repository & Deployment

| Resource | Link |
|---|---|
| GitHub Repository | [https://github.com/sdutta2004/private-skill-certification](https://github.com/sdutta2004/private-skill-certification) |
| Live Application | [https://private-skill-certification-xfp3.vercel.app/](https://private-skill-certification-xfp3.vercel.app/) |
| YouTube Demo Video | [https://youtu.be/Eu6eRTsOWE4](https://youtu.be/Eu6eRTsOWE4) |
| Midnight Explorer | [https://preview.midnightexplorer.com/contracts/0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f](https://preview.midnightexplorer.com/contracts/0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f) |
| **Contract Address** | `0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f` |
| Network | Midnight Preview Testnet |
| Node RPC | `https://rpc.preview.midnight.network` |
| Indexer | `https://indexer.preview.midnight.network/api/v4/graphql` |
| Faucet | `https://faucet.preview.midnight.network` |

---

## Platform Screenshots

### 1. Main Dashboard — Hero, Live Stats & Smart Contract Card
![Main Dashboard](photos/main-dashboard-home.png)

### 2. Candidate Certificate Issuance — ZK Proof & Score Threshold
![Issue Certificate](photos/issuer-dashboard.png)

### 3. Issuer Authority Console — Passing Threshold & Revocation Governance
![Issuer Console](photos/issuer-console.png)

### 4. Midnight Chain Explorer — Real-Time On-Chain State Verification
![Chain Explorer](photos/chain-explorer.png)

### 5. Mobile Responsive Interface
![Mobile UI](photos/mobile-ui-dashboard.png)

### 6. Vitest Automated Test Suite — 10/10 Tests Passing
![Test Results](photos/test-run-terminal.png)

---

## Compact Smart Contract — 6 Circuits

**File:** `contracts/counter.compact`

| # | Circuit | Inputs | ZK Witnesses Used | Description |
|---|---|---|---|---|
| 1 | `issueCertificate` | `Bytes<32>` (skillId) | candidateSecretKey, scoreProofNonce, certificationRecordHash, candidateScoreProof | Issues ZK cert with private score threshold check |
| 2 | `verifyCertificate` | `Bytes<32>` (commitment) | — | Public verification of claimed commitment vs. on-chain record |
| 3 | `revokeCertificate` | `Bytes<32>` (commitment) | issuerSigningKey | Issuer revokes a specific cert commitment (ZK authorized) |
| 4 | `setIssuerCommitment` | `Uint<32>` (threshold) | issuerSigningKey | Anchors issuer authority commitment + sets score threshold |
| 5 | `resetCertification` | `Bytes<32>`, `Uint<32>` | — | Resets skill program + threshold, bumps session epoch |
| 6 | `incrementSession` | — | — | Increments activeSession epoch nonce (replay protection) |

---

## Privacy Model

### Private — Never Disclosed On-Chain

| Data | ZK Witness | Where Stored |
|---|---|---|
| Candidate Identity | `candidateSecretKey()` | Local device only |
| Nonce Salt | `scoreProofNonce()` | Local device only |
| Assessment Payload | `certificationRecordHash()` | Client-side SHA-256 hash |
| Actual Score | `candidateScoreProof()` | Proved >= threshold in ZK; value hidden |
| Issuer Key | `issuerSigningKey()` | Local device of authorized issuer |

### Public — On-Chain Ledger (8 Fields)

| Field | Type | Description |
|---|---|---|
| `certificateCount` | Counter | Total valid certifications issued |
| `revokedCount` | Counter | Total revoked certification commitments |
| `activeSession` | Counter | Epoch nonce for replay protection |
| `skillId` | `Bytes<32>` | Identifier of active skill credential |
| `issuerCommitment` | `Bytes<32>` | Authority anchor of certification issuer |
| `lastCertificationCommitment` | `Bytes<32>` | Most recent certification hash |
| `lastRevokedCommitment` | `Bytes<32>` | Most recent revoked commitment hash |
| `certificationThreshold` | `Uint<32>` | Minimum required score percentage |

---


---

## 🛠️ Complete Setup & Installation Guide

Follow these comprehensive step-by-step instructions to clone, configure, compile, test, and deploy Private Skill Certification locally.

### 1. Prerequisites
Ensure the following tools and environments are installed on your workstation:
- **Node.js**: `v20.x` or `v22.x` (Recommended: `v22.23.1` or later, verify via `node -v`)
- **npm**: `v9.x` or higher (verify via `npm -v`)
- **Git**: For source version control
- **Midnight 1AM Wallet Extension** (Recommended) or **Midnight Lace**: Install 1AM Wallet from [1am.xyz](https://1am.xyz) and set your active network to **Midnight Preview Testnet**.
- **Docker Desktop** *(Optional)*: For running a local zero-knowledge proof server container (`midnightntwrk/proof-server:8.1.0`).

---

### 2. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/sdutta2004/private-skill-certification.git

# Enter project directory
cd private-skill-certification

# Install dependencies cleanly
npm install
```

---

### 3. 1AM / Midnight Wallet Setup (Approval-Based DApp Connector) & Faucet Funding

1. Open your browser and launch the **Midnight Lace Extension**.
2. Switch the active network dropdown to **Midnight Preview Testnet**.
3. Fund your testnet address using the official Midnight Preview Faucet:
   - **Faucet URL**: [https://faucet.preview.midnight.network](https://faucet.preview.midnight.network)
4. Ensure your Lace wallet account is unlocked prior to executing transactions on the dApp.

---

### 4. Local Proof Server (Docker — Optional)

To generate zero-knowledge proofs locally instead of using the remote proving server:

```bash
# Start official Midnight proof server container
docker run -d -p 6300:6300 --name midnight-proof-server midnightntwrk/proof-server:8.1.0

# Verify health status
curl http://localhost:6300/health
```

---

### 5. Compact Smart Contract Compilation

Compile the Compact smart contract source code and verify the managed schema and artifacts:

```bash
npm run compile:compact
```

**Compilation Output:**
```text
=============================================================
 Midnight Compact Contract Compilation & Verification
 Contract: contracts/private_skill_certification.compact
=============================================================
[1/4] Loaded Compact source (6138 bytes).
[2/4] Compact source validated: 6 circuits, 5 witnesses, 8 ledger fields present.
[3/4] Managed contract-info.json schema matches contract AST.
[4/4] Proving keys, verifying keys, and runtime artifacts validated.
>>> Compact compilation check PASSED!
```

---

### 6. Run Automated Test Suite

Execute the 22 automated tests covering circuit execution, witness isolation, ledger state transitions, and live Preview indexer E2E verification:

```bash
npm test
```

**Test Execution Results:**
```text
 ✓ tests/counter.test.ts (3 tests)
 ✓ tests/private_skill_certification.test.ts (16 tests)
 ✓ tests/preview_e2e.test.ts (3 tests)

 Test Files  3 passed (3)
      Tests  22 passed (22)
```

---

### 7. Run Development Server

Launch the Next.js local development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

---

### 8. Production Bundle & Verification

Build the production bundle and generate static pages:

```bash
# Create optimized production build
npm run build

# Start production server locally
npm start
```

---

## Verification Checklist

- [x] **Midnight.js SDK**: Integrated with `@midnight-ntwrk/dapp-connector-api`, `@midnight-ntwrk/compact-runtime`
- [x] **Approval-Based 1AM Wallet Connection**: Interactive 1AM DApp Connector approval flow (`enable()`) with zero mock/fallback
- [x] **Compact v0.23**: 6 ZK circuits and 8 ledger fields
- [x] **No Simulations**: All cryptographic commitments derived via formal SHA-256 / Blake2s standards
- [x] **Verified Contract**: [0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f](https://preview.midnightexplorer.com/contracts/0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f)
- [x] **Live Application**: [https://private-skill-certification-xfp3.vercel.app/](https://private-skill-certification-xfp3.vercel.app/)
- [x] **10/10 Vitest Tests**: Passing
- [x] **Next.js 14 Build**: Clean static generation
- [x] **YouTube Demo Video**: [https://youtu.be/Eu6eRTsOWE4](https://youtu.be/Eu6eRTsOWE4)
- [x] **GitHub Actions CI**: Automated test & build workflow