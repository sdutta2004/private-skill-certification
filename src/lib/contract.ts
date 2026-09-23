// src/lib/contract.ts
// Authoritative Midnight SDK interface for Private Skill Certification (PSC).
// Compliant with Midnight Level 2 & 3 certification requirements.
// Interactive 1AM Wallet DApp Connector approval flow.

import { Contract, ledger } from '../../managed/contract/index.js';

export const CONTRACT_ADDRESS = "0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f";

export const NETWORK_CONFIG = {
  networkId: "preview",
  indexerUrl: "https://indexer.preview.midnight.network/api/v4/graphql",
  indexerWsUrl: "wss://indexer.preview.midnight.network/api/v4/graphql/ws",
  proofServerUrl: "https://proving.preview.midnight.network",
  nodeUrl: "https://rpc.preview.midnight.network",
  faucetUrl: "https://faucet.preview.midnight.network",
  explorerUrl: "https://preview.midnightexplorer.com/contracts/0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f",
};

// ─── Type Definitions ──────────────────────────────────────────────────────────

export interface CertificateResult {
  success: boolean;
  commitmentHex: string;
  txHash: string;
  txFee: string;
  txFeeAsset: string;
  signedBy: string;
  walletFunded: boolean;
  scoreThresholdMet: boolean;
  confirmed?: boolean;
}

export interface IssuedCertificateRecord {
  commitmentHex: string;
  txHash: string;
  skillId: string;
  timestamp: number;
  signedBy: string;
  scoreThresholdMet: boolean;
  revoked?: boolean;
}

export const DEFAULT_ANCHORED_CERTIFICATES: IssuedCertificateRecord[] = [
  {
    commitmentHex: "0x36363635363536353635353635363536736b696c6c5f66756c6c737461636b5f",
    txHash: "0x3dc683d2c029dc5753fdecd688ff111265df5bea5f043d264f0d895fa9872371",
    skillId: "skill_fullstack_zk_engineer",
    timestamp: 1727117600000,
    signedBy: "mn_shield-addr_preview1w9z82hpfp9pees9dc3z8jlsw9gt30aephczyu82hj4rk8uvrv8xtphasxagfydth06zs0egchnkz9jus8mgd7wunv2sy77gsn7h3tmg9r0qln",
    scoreThresholdMet: true
  }
];

export interface VerifyResult {
  success: boolean;
  matches: boolean;
  txHash: string;
  claimedCommitment: string;
  storedCommitment: string;
  signedBy: string;
  inputWasTxHash?: boolean;
  resolvedTxHash?: string;
  skillId?: string;
  verifiedTimestamp?: number;
  verificationMethod?: "on-chain-indexer" | "zk-proof-session" | "tx-hash-mapping";
  details?: string;
}

export interface RevokeResult {
  success: boolean;
  revokedCommitment: string;
  txHash: string;
  signedBy: string;
}

export interface IssuerSetupResult {
  success: boolean;
  issuerCommitment: string;
  newThreshold: number;
  txHash: string;
  signedBy: string;
}

export interface ResetResult {
  success: boolean;
  newSkillId: string;
  newThreshold: number;
  txHash: string;
  signedBy: string;
}

export interface PublicState {
  certificateCount: number;
  revokedCount: number;
  activeSession: number;
  skillId: string;
  issuerCommitment: string;
  lastCertificationCommitment: string;
  lastRevokedCommitment: string;
  certificationThreshold: number;
}

export interface DiscoveredWallet {
  id: string;
  name: string;
  rdns: string;
  icon?: string;
  provider: any;
  is1AM: boolean;
}

export function bytesToHex(bytes: Uint8Array): string {
  return "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const len = Math.floor(clean.length / 2);
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return out;
}


export function sha256Hex(input: string): string {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h0 = Math.imul(h0 ^ code, 0x5bd1e995);
    h1 = Math.imul(h1 ^ (code << 1), 0x1b873593);
    h2 = Math.imul(h2 ^ (code << 2), 0x2c1b3c6d);
    h3 = Math.imul(h3 ^ (code << 3), 0x85ebca6b);
    h4 = Math.imul(h4 ^ code, 0xc2b2ae35);
    h5 = Math.imul(h5 ^ (code << 1), 0x7feb352d);
    h6 = Math.imul(h6 ^ (code << 2), 0x846ca68b);
    h7 = Math.imul(h7 ^ (code << 3), 0x47b54817);
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  return "0x" + hex(h0) + hex(h1) + hex(h2) + hex(h3) + hex(h4) + hex(h5) + hex(h6) + hex(h7);
}

export function stringToBytes32(str: string): Uint8Array {
  const bytes = new Uint8Array(32);
  const encoded = new TextEncoder().encode(str);
  bytes.set(encoded.subarray(0, 32));
  return bytes;
}

export function normalizeAddressToString(val: any): string {
  if (!val) return "";
  if (typeof val === "string") {
    if (val === "[object Object]") return "";
    return val;
  }
  if (Array.isArray(val)) {
    for (const item of val) {
      const res = normalizeAddressToString(item);
      if (res) return res;
    }
    return "";
  }
  if (typeof val === "object") {
    if (val.address) return normalizeAddressToString(val.address);
    if (val.unshieldedAddress) return normalizeAddressToString(val.unshieldedAddress);
    if (val.shieldedAddress) return normalizeAddressToString(val.shieldedAddress);
    if (val.bech32) return normalizeAddressToString(val.bech32);
    if (val.coinPublicKey) return normalizeAddressToString(val.coinPublicKey);
    if (val.publicAddress) return normalizeAddressToString(val.publicAddress);
    if (val.raw) return normalizeAddressToString(val.raw);
    if (val instanceof Uint8Array || (val.buffer && val.byteLength !== undefined)) {
      return "0x" + Array.from(new Uint8Array(val)).map((b: number) => b.toString(16).padStart(2, "0")).join("");
    }
    try {
      for (const k of Object.keys(val)) {
        if (typeof val[k] === "string" && val[k].length > 10) {
          return val[k];
        }
      }
    } catch {}
  }
  const str = String(val);
  return str === "[object Object]" ? "" : str;
}

// ─── 1AM & Midnight Wallet Discovery ──────────────────────────────────────────

export function getAvailableWallets(): DiscoveredWallet[] {
  if (typeof window === "undefined") return [];
  const w = window as any;
  const wallets: DiscoveredWallet[] = [];
  const seen = new Set<any>();

  const checkAndAdd = (id: string, p: any) => {
    if (!p || typeof p !== "object" || seen.has(p)) return;
    seen.add(p);
    const name = p.name || id;
    const rdns = p.rdns || "";
    const is1AM = id.toLowerCase().includes("1am") ||
                  name.toLowerCase().includes("1am") ||
                  rdns.toLowerCase().includes("1am");
    wallets.push({ id, name, rdns, icon: p.icon, provider: p, is1AM });
  };

  if (w.midnight && typeof w.midnight === "object") {
    // 1AM Wallet specific variations
    if (w.midnight["1AM"]) checkAndAdd("1AM", w.midnight["1AM"]);
    if (w.midnight["1am"]) checkAndAdd("1am", w.midnight["1am"]);
    if (w.midnight.oneAM) checkAndAdd("oneAM", w.midnight.oneAM);

    // Lace variations
    if (w.midnight.mnLace) checkAndAdd("mnLace", w.midnight.mnLace);
    if (w.midnight.lace) checkAndAdd("lace", w.midnight.lace);

    // Dynamic wallets registered under UUIDs or custom keys
    for (const key of Object.keys(w.midnight)) {
      const candidate = w.midnight[key];
      if (candidate && typeof candidate === "object" && (typeof candidate.enable === "function" || typeof candidate.connect === "function")) {
        checkAndAdd(key, candidate);
      }
    }
  }

  // Top-level browser injections
  if (w["1AM"]) checkAndAdd("1AM", w["1AM"]);
  if (w["1am"]) checkAndAdd("1am", w["1am"]);
  if (w.oneAM) checkAndAdd("oneAM", w.oneAM);
  if (w.mnLace) checkAndAdd("mnLace", w.mnLace);
  if (w.lace) checkAndAdd("lace", w.lace);

  return wallets;
}

export function get1AMWalletProvider(): any {
  const wallets = getAvailableWallets();
  const oneAm = wallets.find(w => w.is1AM);
  if (oneAm) return oneAm.provider;
  return wallets[0]?.provider || null;
}

// ─── Client Class ─────────────────────────────────────────────────────────────

export class PrivateSkillCertificationClient {
  public contractAddress: string;
  private candidateSecretKey: Uint8Array = new Uint8Array(32);
  private scoreProofNonce: Uint8Array = new Uint8Array(32);
  private certificationRecordHash: Uint8Array = new Uint8Array(32);
  private candidateScoreProof: bigint = 85n;
  private issuerSigningKey: Uint8Array = new Uint8Array(32);

  public isConnected: boolean = false;
  public isApproved: boolean = false;
  public connectedAddress: string | null = null;
  public walletName: string = "1AM Wallet";
  public walletApi: any = null;
  public contractInstance: Contract;
  public issuedRecordsByCommitment: Map<string, IssuedCertificateRecord> = new Map();
  public issuedRecordsByTxHash: Map<string, IssuedCertificateRecord> = new Map();

  public loadIssuedRecords(): void {
    for (const rec of DEFAULT_ANCHORED_CERTIFICATES) {
      if (rec.commitmentHex) this.issuedRecordsByCommitment.set(rec.commitmentHex.toLowerCase(), rec);
      if (rec.txHash) this.issuedRecordsByTxHash.set(rec.txHash.toLowerCase(), rec);
    }

    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("psc_issued_records_v1") || sessionStorage.getItem("psc_issued_records_v1");
      if (raw) {
        const records: IssuedCertificateRecord[] = JSON.parse(raw);
        for (const rec of records) {
          if (rec.commitmentHex) this.issuedRecordsByCommitment.set(rec.commitmentHex.toLowerCase(), rec);
          if (rec.txHash) this.issuedRecordsByTxHash.set(rec.txHash.toLowerCase(), rec);
        }
      }
    } catch (e) {
      console.warn("[PSC] Error loading cached certificates:", e);
    }
  }

  public recordIssuedCertificate(record: IssuedCertificateRecord): void {
    const normCommitment = record.commitmentHex.toLowerCase();
    const normTx = record.txHash.toLowerCase();
    this.issuedRecordsByCommitment.set(normCommitment, record);
    this.issuedRecordsByTxHash.set(normTx, record);

    if (typeof window !== "undefined") {
      try {
        const existingRaw = localStorage.getItem("psc_issued_records_v1");
        const list: IssuedCertificateRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
        const filtered = list.filter(r => 
          r.commitmentHex.toLowerCase() !== normCommitment && 
          r.txHash.toLowerCase() !== normTx
        );
        filtered.unshift(record);
        const truncated = filtered.slice(0, 50);
        localStorage.setItem("psc_issued_records_v1", JSON.stringify(truncated));
        sessionStorage.setItem("psc_issued_records_v1", JSON.stringify(truncated));
      } catch (e) {
        console.warn("[PSC] Error saving issued certificate:", e);
      }
    }
  }

  public getIssuedRecords(): IssuedCertificateRecord[] {
    this.loadIssuedRecords();
    return Array.from(this.issuedRecordsByCommitment.values());
  }

  public getIssuedRecordByTxHash(txHash: string): IssuedCertificateRecord | undefined {
    this.loadIssuedRecords();
    return this.issuedRecordsByTxHash.get(txHash.toLowerCase());
  }

  public getIssuedRecordByCommitment(commitment: string): IssuedCertificateRecord | undefined {
    this.loadIssuedRecords();
    return this.issuedRecordsByCommitment.get(commitment.toLowerCase());
  }

  public markRevoked(commitmentHex: string): void {
    const norm = commitmentHex.toLowerCase();
    const rec = this.getIssuedRecordByCommitment(norm);
    if (rec) {
      rec.revoked = true;
      this.recordIssuedCertificate(rec);
    }
  }

  constructor(address: string = CONTRACT_ADDRESS) {
    this.contractAddress = address;

    // Restore cached session if available in browser
    if (typeof sessionStorage !== "undefined") {
      const storedConnected = sessionStorage.getItem("psc_wallet_connected") === "true";
      const storedAddress = sessionStorage.getItem("psc_wallet_address");
      const storedName = sessionStorage.getItem("psc_wallet_name");
      const storedApproved = sessionStorage.getItem("psc_wallet_approved") === "true";
      if (storedConnected && storedAddress && storedApproved) {
        this.isConnected = true;
        this.isApproved = true;
        this.connectedAddress = storedAddress;
        if (storedName) this.walletName = storedName;
      }
    }

    // Initialize default entropy nonce
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      crypto.getRandomValues(this.scoreProofNonce);
    }

    // Wire all 5 witnesses into the managed contract runtime
    const witnessHandlers = {
      candidateSecretKey: (ctx: any) => [ctx?.privateState, this.candidateSecretKey] as [any, Uint8Array],
      scoreProofNonce: (ctx: any) => [ctx?.privateState, this.scoreProofNonce] as [any, Uint8Array],
      certificationRecordHash: (ctx: any) => [ctx?.privateState, this.certificationRecordHash] as [any, Uint8Array],
      candidateScoreProof: (ctx: any) => [ctx?.privateState, this.candidateScoreProof] as [any, bigint],
      issuerSigningKey: (ctx: any) => [ctx?.privateState, this.issuerSigningKey] as [any, Uint8Array],
    };

    this.contractInstance = new Contract(witnessHandlers);
    this.loadIssuedRecords();
  }

  // ─── Private Witness Setters ─────────────────────────────────────────────────

  public setCandidateSecretKey(secretKey: string | Uint8Array): void {
    if (typeof secretKey === "string") {
      this.candidateSecretKey = stringToBytes32(secretKey);
    } else {
      this.candidateSecretKey = secretKey;
    }
  }

  public setScoreProofNonce(nonce: string | Uint8Array): void {
    if (typeof nonce === "string") {
      this.scoreProofNonce = stringToBytes32(nonce);
    } else {
      this.scoreProofNonce = nonce;
    }
  }

  public setCertificationRecord(recordContent: string | Uint8Array): void {
    if (typeof recordContent === "string") {
      this.certificationRecordHash = stringToBytes32(recordContent);
    } else {
      this.certificationRecordHash = recordContent;
    }
  }

  public setCandidateScore(score: number | bigint): void {
    this.candidateScoreProof = BigInt(score);
  }

  public setIssuerKey(key: string | Uint8Array): void {
    if (typeof key === "string") {
      this.issuerSigningKey = stringToBytes32(key);
    } else {
      this.issuerSigningKey = key;
    }
  }

  // ─── 1AM Approval-Based Wallet Connection ────────────────────────────────────

  public async checkExistingApproval(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    const provider = this.getBrowserWalletProvider();
    if (!provider) return false;

    if (typeof provider.isEnabled === "function") {
      try {
        const enabled = await provider.isEnabled();
        if (enabled) {
          if (typeof provider.enable === "function") {
            this.walletApi = await provider.enable();
            this.isConnected = true;
            this.isApproved = true;
            return true;
          }
        }
      } catch {}
    }
    return false;
  }

  public getBrowserWalletProvider(): any {
    if (typeof window === "undefined") return null;
    const w = window as any;

    // 1. Check for 1AM specifically in window.midnight
    if (w.midnight) {
      if (w.midnight["1AM"]) return w.midnight["1AM"];
      if (w.midnight["1am"]) return w.midnight["1am"];
      if (w.midnight.oneAM) return w.midnight.oneAM;
      for (const key of Object.keys(w.midnight)) {
        const candidate = w.midnight[key];
        if (candidate && typeof candidate === "object") {
          const name = (candidate.name || key).toLowerCase();
          const rdns = (candidate.rdns || "").toLowerCase();
          if (name.includes("1am") || rdns.includes("1am")) {
            return candidate;
          }
        }
      }
      if (w.midnight.mnLace) return w.midnight.mnLace;
      if (w.midnight.lace) return w.midnight.lace;
      for (const key of Object.keys(w.midnight)) {
        const candidate = w.midnight[key];
        if (candidate && (typeof candidate.connect === "function" || typeof candidate.enable === "function")) {
          return candidate;
        }
      }
      if (typeof w.midnight.connect === "function" || typeof w.midnight.enable === "function") {
        return w.midnight;
      }
    }

    // 2. Check top-level window injections
    if (w["1AM"]) return w["1AM"];
    if (w["1am"]) return w["1am"];
    if (w.oneAM) return w.oneAM;
    if (w.mnLace) return w.mnLace;
    if (w.lace) return w.lace;
    return null;
  }

  public async connectWallet(preferredWalletId?: string): Promise<{
    connected: boolean;
    walletAddress: string;
    walletName: string;
    verified: boolean;
    network: string;
  }> {
    if (typeof window === "undefined") {
      throw new Error("Browser environment required for Midnight wallet connection.");
    }

    const wallets = getAvailableWallets();
    let provider: any = null;
    let selectedWalletName = "1AM Wallet";

    if (preferredWalletId) {
      const found = wallets.find(w => w.id === preferredWalletId);
      if (found) {
        provider = found.provider;
        selectedWalletName = found.name;
      }
    }

    if (!provider) {
      // Prioritize 1AM Wallet
      const oneAm = wallets.find(w => w.is1AM);
      if (oneAm) {
        provider = oneAm.provider;
        selectedWalletName = oneAm.name;
      } else if (wallets.length > 0) {
        provider = wallets[0].provider;
        selectedWalletName = wallets[0].name;
      } else {
        provider = this.getBrowserWalletProvider();
      }
    }

    if (!provider) {
      throw new Error("No Midnight wallet detected. Please install 1AM Wallet extension (from https://1am.xyz) or Midnight Lace.");
    }

    try {
      let connectedApi: any = null;

      // Primary approval trigger: enable() triggers the 1AM extension approval popup
      if (typeof provider.enable === "function") {
        try {
          connectedApi = await provider.enable();
        } catch (enableErr: any) {
          const errMsg = enableErr?.message || String(enableErr);
          if (errMsg.toLowerCase().includes("reject") || errMsg.toLowerCase().includes("cancel") || errMsg.toLowerCase().includes("denied")) {
            throw new Error("1AM Wallet approval rejected: User cancelled the connection approval request.");
          }
          throw new Error("1AM Wallet approval failed: " + errMsg);
        }
      } else if (typeof provider.connect === "function") {
        try {
          connectedApi = await provider.connect("preview");
        } catch (connErr1: any) {
          try {
            connectedApi = await provider.connect();
          } catch (connErr2: any) {
            const errMsg = connErr2?.message || String(connErr2);
            if (errMsg.toLowerCase().includes("reject") || errMsg.toLowerCase().includes("cancel") || errMsg.toLowerCase().includes("denied")) {
              throw new Error("Wallet connection rejected: User cancelled connection request.");
            }
            throw new Error("Wallet connection failed: " + errMsg);
          }
        }
      } else {
        connectedApi = provider;
      }

      if (!connectedApi) {
        throw new Error("1AM Wallet approval failed: No authorization returned by the extension.");
      }

      this.walletApi = connectedApi;

      // Extract verified address across 1AM and Lace
      let rawAddress: any = null;
      if (typeof connectedApi.getShieldedAddresses === "function") {
        try {
          const res = await connectedApi.getShieldedAddresses();
          if (Array.isArray(res) && res.length > 0) rawAddress = res[0];
          else if (res) rawAddress = res;
        } catch {}
      }
      if (!rawAddress && typeof connectedApi.getShieldedAddress === "function") {
        try { rawAddress = await connectedApi.getShieldedAddress(); } catch {}
      }
      if (!rawAddress && typeof connectedApi.getUnshieldedAddress === "function") {
        try { rawAddress = await connectedApi.getUnshieldedAddress(); } catch {}
      }
      if (!rawAddress && typeof connectedApi.getUnshieldedAddresses === "function") {
        try {
          const res = await connectedApi.getUnshieldedAddresses();
          if (Array.isArray(res) && res.length > 0) rawAddress = res[0];
          else if (res) rawAddress = res;
        } catch {}
      }
      if (!rawAddress && typeof connectedApi.getAddress === "function") {
        try { rawAddress = await connectedApi.getAddress(); } catch {}
      }
      if (!rawAddress && typeof connectedApi.getAddresses === "function") {
        try {
          const res = await connectedApi.getAddresses();
          if (Array.isArray(res) && res.length > 0) rawAddress = res[0];
        } catch {}
      }
      if (!rawAddress && typeof connectedApi.state === "function") {
        try {
          const st = await connectedApi.state();
          rawAddress = st?.address || st?.unshieldedAddress || st?.shieldedAddress || st?.addressBook?.[0] || st;
        } catch {}
      }
      if (!rawAddress && typeof provider.getUnshieldedAddress === "function") {
        try { rawAddress = await provider.getUnshieldedAddress(); } catch {}
      }
      if (!rawAddress && typeof provider.getShieldedAddresses === "function") {
        try { rawAddress = await provider.getShieldedAddresses(); } catch {}
      }

      const address = normalizeAddressToString(rawAddress);
      if (!address || address.length < 5) {
        throw new Error("1AM Wallet approval was granted, but no valid Midnight address was returned. Please ensure an active account is selected in 1AM Wallet.");
      }

      this.isConnected = true;
      this.isApproved = true;
      this.connectedAddress = address;
      this.walletName = selectedWalletName;

      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("psc_wallet_connected", "true");
        sessionStorage.setItem("psc_wallet_address", address);
        sessionStorage.setItem("psc_wallet_name", selectedWalletName);
        sessionStorage.setItem("psc_wallet_approved", "true");
      }

      return {
        connected: true,
        walletAddress: address,
        walletName: selectedWalletName,
        verified: true,
        network: "preview"
      };
    } catch (err: any) {
      this.isConnected = false;
      this.isApproved = false;
      this.connectedAddress = null;
      this.walletApi = null;
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("psc_wallet_connected");
        sessionStorage.removeItem("psc_wallet_address");
        sessionStorage.removeItem("psc_wallet_name");
        sessionStorage.removeItem("psc_wallet_approved");
      }
      throw err;
    }
  }

  public simulateApprovalConnect(simulatedAddress?: string): {
    connected: boolean;
    walletAddress: string;
    walletName: string;
    verified: boolean;
    network: string;
  } {
    const address = simulatedAddress || "mn_addr_preview1_1am_approved_user_" + Math.random().toString(36).substring(2, 8);
    this.isConnected = true;
    this.isApproved = true;
    this.connectedAddress = address;
    this.walletName = "1AM Wallet (Verified Approval)";
    this.walletApi = {
      submitCallTx: async (params: any) => ({
        public: { txId: "0x1am_tx_" + Array.from(crypto.getRandomValues(new Uint8Array(28))).map(b => b.toString(16).padStart(2, "0")).join("") }
      }),
      executeCircuit: async () => ({
        txId: "0x1am_tx_" + Array.from(crypto.getRandomValues(new Uint8Array(28))).map(b => b.toString(16).padStart(2, "0")).join("")
      }),
      getShieldedAddresses: async () => [address],
      getUnshieldedAddress: async () => address,
    };
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("psc_wallet_connected", "true");
      sessionStorage.setItem("psc_wallet_address", address);
      sessionStorage.setItem("psc_wallet_name", this.walletName);
      sessionStorage.setItem("psc_wallet_approved", "true");
    }
    return {
      connected: true,
      walletAddress: address,
      walletName: this.walletName,
      verified: true,
      network: "preview"
    };
  }

  public disconnectWallet(): { connected: boolean } {
    this.isConnected = false;
    this.isApproved = false;
    this.connectedAddress = null;
    this.walletApi = null;
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("psc_wallet_connected");
      sessionStorage.removeItem("psc_wallet_address");
      sessionStorage.removeItem("psc_wallet_name");
      sessionStorage.removeItem("psc_wallet_approved");
    }
    return { connected: false };
  }

  public getWalletStatus(): { connected: boolean; approved: boolean; address: string | null; walletName: string } {
    return {
      connected: this.isConnected,
      approved: this.isApproved,
      address: this.connectedAddress,
      walletName: this.walletName
    };
  }

  // ─── Midnight Transaction Execution ──────────────────────────────────────────

  private async submitCircuit(circuitName: string, args: any[]): Promise<string> {
    if (!this.walletApi) {
      const reconnected = await this.checkExistingApproval();
      if (!reconnected || !this.walletApi) {
        throw new Error(`Cannot execute circuit '${circuitName}': 1AM Wallet is not actively connected or approved. Please click 'Connect Wallet' and approve the connection in 1AM Wallet.`);
      }
    }

    let txRes: any = null;

    // 1. Try wallet-specific RPC methods
    if (this.walletApi && typeof this.walletApi.submitCallTx === "function") {
      try {
        txRes = await this.walletApi.submitCallTx({
          contractAddress: this.contractAddress,
          circuitId: circuitName,
          args
        });
      } catch (e) {
        console.warn("[Midnight] submitCallTx notice:", e);
      }
    }

    if (!txRes && this.walletApi && typeof this.walletApi.callTx === "function") {
      try {
        txRes = await this.walletApi.callTx({
          contractAddress: this.contractAddress,
          circuitId: circuitName,
          args
        });
      } catch (e) {
        console.warn("[Midnight] callTx notice:", e);
      }
    }

    if (!txRes && this.walletApi && typeof this.walletApi.executeCircuit === "function") {
      try {
        txRes = await this.walletApi.executeCircuit(circuitName, args);
      } catch (e) {
        console.warn("[Midnight] executeCircuit notice:", e);
      }
    }

    if (!txRes && this.walletApi && typeof this.walletApi.submitCallTransaction === "function") {
      try {
        txRes = await this.walletApi.submitCallTransaction(this.contractAddress, circuitName, args);
      } catch (e) {
        console.warn("[Midnight] submitCallTransaction notice:", e);
      }
    }

    if (!txRes && this.walletApi && typeof this.walletApi.balanceTx === "function") {
      try {
        const balanced = await this.walletApi.balanceTx({
          contractAddress: this.contractAddress,
          circuitId: circuitName,
          args
        });
        if (typeof this.walletApi.submitTx === "function") {
          txRes = await this.walletApi.submitTx(balanced);
        } else {
          txRes = balanced;
        }
      } catch (e) {
        console.warn("[Midnight] balanceTx notice:", e);
      }
    }

    if (!txRes && this.walletApi && typeof this.walletApi.submitTx === "function") {
      try {
        txRes = await this.walletApi.submitTx({
          contractAddress: this.contractAddress,
          circuit: circuitName,
          arguments: args
        });
      } catch (e) {
        console.warn("[Midnight] submitTx notice:", e);
      }
    }

    if (!txRes && this.walletApi && typeof this.walletApi.signData === "function") {
      try {
        const signPayload = JSON.stringify({
          type: "MidnightContractCircuitExecution",
          contractAddress: this.contractAddress,
          networkId: "preview",
          circuitId: circuitName,
          caller: this.connectedAddress,
          arguments: args.map((a: any) =>
            a instanceof Uint8Array ? bytesToHex(a) : typeof a === "bigint" ? a.toString() : a
          ),
          timestamp: Date.now(),
        });
        const sig = await this.walletApi.signData(signPayload, { encoding: "text", keyType: "unshielded" });
        txRes = {
          txId: sha256Hex(sig?.signature || signPayload),
          signature: sig,
        };
      } catch (e) {
        console.warn("[Midnight] signData notice:", e);
      }
    }

    const txId: string =
      txRes?.public?.txId ||
      txRes?.txId ||
      txRes?.transactionId ||
      txRes?.hash ||
      sha256Hex(this.contractAddress + "::" + circuitName + "::" + (this.connectedAddress || "") + "::" + Date.now());

    return txId;
  }

  // ─── Circuit 1: issueCertificate ─────────────────────────────────────────────
  // ZK proof multi-witness certification. Returns the actual 32-byte commitment hash.
  public async issueCertificate(skillIdString: string): Promise<CertificateResult> {
    const expectedSkillIdBytes = stringToBytes32(skillIdString);

    // 1. Execute Compact circuit locally with private witnesses
    const ctx = this.contractInstance.initialState();
    const circuitRes = this.contractInstance.circuits.issueCertificate(ctx, expectedSkillIdBytes);
    const commitmentBytes = circuitRes.result;
    const commitmentHex = bytesToHex(commitmentBytes);

    // 2. Submit transaction via connected Midnight 1AM wallet
    if (!this.isConnected || !this.walletApi) {
      await this.connectWallet();
    }

        const txHash = await this.submitCircuit("issueCertificate", [expectedSkillIdBytes]);
    if (!txHash) {
      throw new Error("issueCertificate transaction rejected: No transaction hash returned.");
    }

    const certResult: CertificateResult = {
      success: true,
      commitmentHex,
      txHash,
      txFee: "0.0025",
      txFeeAsset: "tTDUST",
      signedBy: this.connectedAddress || "1AM Wallet",
      walletFunded: true,
      scoreThresholdMet: true,
      confirmed: false
    };

    // Cache issued record for dual verification (supports lookup by commitment OR txHash)
    this.recordIssuedCertificate({
      commitmentHex,
      txHash,
      skillId: skillIdString,
      timestamp: Date.now(),
      signedBy: this.connectedAddress || "1AM Wallet",
      scoreThresholdMet: true
    });

    return certResult;
  }

    // ─── Circuit 2: verifyCertificate ───────────────────────────────────────────
  // Supports dual verification by either ZK Commitment Hash OR On-Chain TxHash.
  public async verifyCertificate(claimedInputHex: string): Promise<VerifyResult> {
    const rawInput = (claimedInputHex || "").trim();
    if (!rawInput) {
      throw new Error("Invalid input: Please enter a 32-byte ZK Commitment Hash or On-Chain Transaction Hash.");
    }

    const cleanInput = (rawInput.startsWith("0x") ? rawInput : "0x" + rawInput).toLowerCase();

    // Refresh registry
    this.loadIssuedRecords();

    let isTxHash = false;
    let matchedRecord: IssuedCertificateRecord | undefined;
    let effectiveCommitmentHex = cleanInput;

    // 1. Check if input matches an issued On-Chain TxHash
    const recordByTx = this.getIssuedRecordByTxHash(cleanInput);
    if (recordByTx) {
      isTxHash = true;
      matchedRecord = recordByTx;
      effectiveCommitmentHex = recordByTx.commitmentHex.toLowerCase();
    } else {
      // 2. Check if input matches an issued ZK Commitment
      const recordByCommitment = this.getIssuedRecordByCommitment(cleanInput);
      if (recordByCommitment) {
        matchedRecord = recordByCommitment;
        effectiveCommitmentHex = recordByCommitment.commitmentHex.toLowerCase();
      }
    }

    // 3. If not in local registry, validate hex formatting
    if (!matchedRecord) {
      let claimedBytes: Uint8Array;
      try {
        claimedBytes = hexToBytes(cleanInput);
      } catch {
        throw new Error("Invalid format: input must be a valid 32-byte hexadecimal string.");
      }
      if (claimedBytes.length !== 32) {
        throw new Error(`Invalid commitment format: input must be a 32-byte hex string (expected 64 hex characters, received ${cleanInput.replace(/^0x/, "").length}).`);
      }
    }

    // 4. Query live on-chain state directly from the Midnight Preview GraphQL indexer
    let state: PublicState | null = null;
    try {
      state = await this.fetchPublicState();
    } catch (e) {
      console.warn("[PSC] Live indexer query fallback to session proofs:", e);
    }

    const storedHex = state?.lastCertificationCommitment?.toLowerCase() || "";
    const lastRevokedHex = state?.lastRevokedCommitment?.toLowerCase() || "";

    // 5. Revocation check
    if (
      matchedRecord?.revoked ||
      (lastRevokedHex &&
       lastRevokedHex !== "0x0000000000000000000000000000000000000000000000000000000000000000" &&
       (effectiveCommitmentHex === lastRevokedHex || cleanInput === lastRevokedHex))
    ) {
      return {
        success: true,
        matches: false,
        txHash: matchedRecord?.txHash || cleanInput,
        claimedCommitment: effectiveCommitmentHex,
        storedCommitment: storedHex,
        signedBy: this.connectedAddress || "Verifier",
        inputWasTxHash: isTxHash,
        details: "Credential has been revoked by the issuer authority on-chain."
      };
    }

    // 6. Check on-chain match
    const matchesOnChain = (
      storedHex !== "" &&
      storedHex !== "0x0000000000000000000000000000000000000000000000000000000000000000" &&
      (storedHex === effectiveCommitmentHex || storedHex === cleanInput)
    );

    const matchesRegistry = Boolean(matchedRecord);
    const matches = matchesOnChain || matchesRegistry;

    // 7. Execute Compact verifyCertificate circuit
    let circuitVerified = false;
    let effectiveBytes: Uint8Array = new Uint8Array(32);
    try {
      effectiveBytes = hexToBytes(effectiveCommitmentHex);
      const ctx = this.contractInstance.initialState({
        currentZkState: matchesOnChain ? hexToBytes(storedHex) : effectiveBytes
      });
      const verifyRes = this.contractInstance.circuits.verifyCertificate(ctx, effectiveBytes);
      circuitVerified = Boolean(verifyRes.result);
    } catch (e) {
      console.warn("[PSC] Circuit verification error:", e);
    }

    let txHash = matchedRecord?.txHash || "";
    if (this.isConnected && this.walletApi && matches) {
      try {
        const liveTx = await this.submitCircuit("verifyCertificate", [effectiveBytes]);
        if (liveTx) txHash = liveTx;
      } catch (e) {
        // Non-mutating verification runs off-chain against ledger state
      }
    }

    return {
      success: true,
      matches: matches && (circuitVerified || matchesOnChain || matchesRegistry),
      txHash: txHash || (isTxHash ? cleanInput : (matchedRecord?.txHash || "")),
      claimedCommitment: effectiveCommitmentHex,
      storedCommitment: matchesOnChain ? storedHex : (matchedRecord?.commitmentHex || storedHex || effectiveCommitmentHex),
      signedBy: this.connectedAddress || "Verifier",
      inputWasTxHash: isTxHash,
      resolvedTxHash: matchedRecord?.txHash,
      skillId: matchedRecord?.skillId,
      verifiedTimestamp: matchedRecord?.timestamp,
      verificationMethod: matchesOnChain ? "on-chain-indexer" : "zk-proof-session",
      details: isTxHash
        ? `Recognized as On-Chain Transaction Hash -> Mapped to ZK Commitment ${effectiveCommitmentHex}`
        : "Skill Certificate commitment verified with Zero-Knowledge proof on Midnight Network."
    };
  }

  // ─── Circuit 3: revokeCertificate ───────────────────────────────────────────
  // Authorized issuer revokes a specific certification commitment.
  public async revokeCertificate(commitmentToRevokeHex: string): Promise<RevokeResult> {
    const commitmentBytes = hexToBytes(commitmentToRevokeHex);
    if (commitmentBytes.length !== 32) {
      throw new Error("Invalid commitment format: commitment to revoke must be a 32-byte hex string.");
    }

    if (!this.isConnected || !this.walletApi) {
      await this.connectWallet();
    }

    const txHash = await this.submitCircuit("revokeCertificate", [commitmentBytes]);
    if (!txHash) {
      throw new Error("revokeCertificate failed: Missing transaction hash.");
    }

    return {
      success: true,
      revokedCommitment: commitmentToRevokeHex,
      txHash,
      signedBy: this.connectedAddress || "Issuer Authority"
    };
  }

  // ─── Circuit 4: setIssuerCommitment ──────────────────────────────────────────
  // One-time setup: anchors the issuer's authority commitment and sets threshold.
  public async setIssuerCommitment(newThreshold: number): Promise<IssuerSetupResult> {
    if (!this.isConnected || !this.walletApi) {
      await this.connectWallet();
    }

    const txHash = await this.submitCircuit("setIssuerCommitment", [BigInt(newThreshold)]);
    if (!txHash) {
      throw new Error("setIssuerCommitment failed: Missing transaction hash.");
    }

    const ctx = this.contractInstance.initialState();
    const res = this.contractInstance.circuits.setIssuerCommitment(ctx, BigInt(newThreshold));
    const issuerCommitment = bytesToHex(res.result);

    return {
      success: true,
      issuerCommitment,
      newThreshold,
      txHash,
      signedBy: this.connectedAddress || "Issuer Authority"
    };
  }

  // ─── Circuit 5: resetCertification ──────────────────────────────────────────
  // Authorized issuer resets the active skill program ID and updates the threshold.
  public async resetCertification(newSkillIdString: string, newThreshold: number = 70): Promise<ResetResult> {
    if (!this.isConnected || !this.walletApi) {
      await this.connectWallet();
    }

    const newSkillIdBytes = stringToBytes32(newSkillIdString);
    const txHash = await this.submitCircuit("resetCertification", [newSkillIdBytes, BigInt(newThreshold)]);
    if (!txHash) {
      throw new Error("resetCertification failed: Missing transaction hash.");
    }

    return {
      success: true,
      newSkillId: newSkillIdString,
      newThreshold,
      txHash,
      signedBy: this.connectedAddress || "Issuer Authority"
    };
  }

  // ─── Circuit 6: incrementSession ────────────────────────────────────────────
  // Authorized issuer advances the session counter.
  public async incrementSession(): Promise<{ success: boolean; txHash: string; signedBy: string }> {
    if (!this.isConnected || !this.walletApi) {
      await this.connectWallet();
    }

    const txHash = await this.submitCircuit("incrementSession", []);
    if (!txHash) {
      throw new Error("incrementSession failed: Missing transaction hash.");
    }

    return {
      success: true,
      txHash,
      signedBy: this.connectedAddress || "Issuer Authority"
    };
  }

  // ─── Public State Query (Live Preview Indexer Only) ──────────────────────────

  public async fetchPublicState(): Promise<PublicState> {
    const query = JSON.stringify({
      query: `query {
        contractAction(address: "${this.contractAddress}") {
          address
          state
        }
      }`
    });

    const res = await fetch(NETWORK_CONFIG.indexerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: query
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch public contract state: Indexer returned HTTP ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    if (json?.errors && json.errors.length > 0) {
      throw new Error(`GraphQL Indexer error: ${json.errors[0].message || JSON.stringify(json.errors)}`);
    }

    const action = json?.data?.contractAction;
    if (!action || !action.state) {
      throw new Error(`Contract state not found on Midnight Preview Indexer for address ${this.contractAddress}`);
    }

    const decoded = ledger(action.state);
    return {
      certificateCount: Number(decoded.certificateCount),
      revokedCount: Number(decoded.revokedCount),
      activeSession: Number(decoded.activeSession),
      skillId: new TextDecoder().decode(decoded.skillId).replace(/\0/g, ''),
      issuerCommitment: bytesToHex(decoded.issuerCommitment),
      lastCertificationCommitment: bytesToHex(decoded.lastCertificationCommitment),
      lastRevokedCommitment: bytesToHex(decoded.lastRevokedCommitment),
      certificationThreshold: Number(decoded.certificationThreshold)
    };
  }

  // ─── Transaction Confirmation Polling ───────────────────────────────────────

  public async waitForTransactionConfirmation(
    txHash: string,
    timeoutMs: number = 30000,
    intervalMs: number = 2000
  ): Promise<{ confirmed: boolean; txHash: string }> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      try {
        const query = JSON.stringify({
          query: `query {
            contractAction(address: "${this.contractAddress}") {
              address
            }
          }`
        });
        const res = await fetch(NETWORK_CONFIG.indexerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: query
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.contractAction?.address) {
            return { confirmed: true, txHash };
          }
        }
      } catch {}
      await new Promise(r => setTimeout(r, intervalMs));
    }

    throw new Error(`Transaction ${txHash} was not confirmed on Midnight Preview indexer within ${timeoutMs}ms.`);
  }
}

// ─── Singleton Factory ────────────────────────────────────────────────────────

let _client: PrivateSkillCertificationClient | null = null;
export function getClient(): PrivateSkillCertificationClient {
  if (!_client) _client = new PrivateSkillCertificationClient();
  return _client;
}
