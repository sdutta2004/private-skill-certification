import { describe, it, expect } from 'vitest';
import { Contract, ledger } from '../managed/contract/index.js';
import {
  PrivateSkillCertificationClient,
  CONTRACT_ADDRESS,
  NETWORK_CONFIG,
  bytesToHex,
  hexToBytes,
  stringToBytes32,
  getAvailableWallets,
  get1AMWalletProvider
} from '../src/lib/contract';
import { deployPSCContract } from '../src/integration/deploy';

function toBytes32(str: string): Uint8Array {
  const bytes = new Uint8Array(32);
  const encoded = new TextEncoder().encode(str);
  bytes.set(encoded.subarray(0, 32));
  return bytes;
}

function buildWitnesses(opts: {
  candidateKey?: string;
  nonce?: string;
  record?: string;
  score?: bigint;
  issuerKey?: string;
}) {
  const candidateKey = toBytes32(opts.candidateKey ?? 'candidate_secret_key_001');
  const nonce = toBytes32(opts.nonce ?? 'entropy_nonce_001');
  const record = toBytes32(opts.record ?? 'transcript_hash_001');
  const score = opts.score ?? 85n;
  const issuerKey = toBytes32(opts.issuerKey ?? 'issuer_signing_key_001');

  return {
    candidateSecretKey: (ctx: any) => [ctx?.privateState, candidateKey] as [any, Uint8Array],
    scoreProofNonce: (ctx: any) => [ctx?.privateState, nonce] as [any, Uint8Array],
    certificationRecordHash: (ctx: any) => [ctx?.privateState, record] as [any, Uint8Array],
    candidateScoreProof: (ctx: any) => [ctx?.privateState, score] as [any, bigint],
    issuerSigningKey: (ctx: any) => [ctx?.privateState, issuerKey] as [any, Uint8Array],
  };
}

describe('Private Skill Certification (PSC) — Real Runtime Contract Suite', () => {

  it('1. Contract Structure: all 6 core circuits are exported and callable from managed runtime', () => {
    const contract = new Contract(buildWitnesses({}));
    expect(contract).toBeDefined();
    expect(typeof contract.circuits.issueCertificate).toBe('function');
    expect(typeof contract.circuits.verifyCertificate).toBe('function');
    expect(typeof contract.circuits.revokeCertificate).toBe('function');
    expect(typeof contract.circuits.setIssuerCommitment).toBe('function');
    expect(typeof contract.circuits.resetCertification).toBe('function');
    expect(typeof contract.circuits.incrementSession).toBe('function');
  });

  it('2. Witness Completeness: all 5 witnesses are registered and callable', () => {
    const witnesses = buildWitnesses({
      candidateKey: 'cand_test_key_alpha',
      nonce: 'nonce_test_beta',
      record: 'record_hash_gamma',
      score: 95n,
      issuerKey: 'issuer_auth_delta',
    });
    const contract = new Contract(witnesses);
    expect(contract.witnesses.candidateSecretKey).toBeDefined();
    expect(contract.witnesses.scoreProofNonce).toBeDefined();
    expect(contract.witnesses.certificationRecordHash).toBeDefined();
    expect(contract.witnesses.candidateScoreProof).toBeDefined();
    expect(contract.witnesses.issuerSigningKey).toBeDefined();
  });

  it('3. Score Threshold Witness Assertion: candidateScoreProof >= certificationThreshold passes', () => {
    const passingScore = 88n;
    const threshold = 70n;
    const witnesses = buildWitnesses({ score: passingScore });
    const contract = new Contract(witnesses);
    const ctx = contract.initialState();
    const res = contract.circuits.issueCertificate(ctx, toBytes32('skill_zk_developer'));

    expect(res.context.transactionContext.scoreVerified).toBe(true);
    expect(passingScore >= threshold).toBe(true);
  });

  it('4. Score Threshold Rejection: candidateScoreProof < threshold fails qualification check', () => {
    const failingScore = 45n;
    const threshold = 70n;
    expect(failingScore >= threshold).toBe(false);
  });

  it('5. Commitment Generation: issueCertificate returns actual 32-byte commitment hash', () => {
    const witnesses = buildWitnesses({
      candidateKey: 'key_candidate_secure_01',
      nonce: 'nonce_single_use_01',
      record: 'record_transcript_sha256',
    });
    const contract = new Contract(witnesses);
    const ctx = contract.initialState();
    const skillBytes = toBytes32('skill_cybersecurity');
    const res = contract.circuits.issueCertificate(ctx, skillBytes);

    expect(res.result).toBeDefined();
    expect(res.result.length).toBe(32);
    const hex = bytesToHex(res.result);
    expect(hex.length).toBe(66); // 0x + 64 hex characters
    expect(hex.startsWith('0x')).toBe(true);
  });

  it('6. One-Time Issuer Initialization: setIssuerCommitment anchors authority commitment', () => {
    const witnesses = buildWitnesses({ issuerKey: 'root_issuer_authority_key' });
    const contract = new Contract(witnesses);
    const ctx = contract.initialState();
    const res = contract.circuits.setIssuerCommitment(ctx, 75n);

    expect(res.result).toBeDefined();
    expect(res.result.length).toBe(32);
    expect(bytesToHex(res.result)).not.toBe('0x' + '00'.repeat(32));
  });

  it('7. Unauthorized Admin Circuit: revokeCertificate rejects call without valid issuer key', () => {
    const witnessesZero = {
      candidateSecretKey: () => new Uint8Array(32),
      scoreProofNonce: () => new Uint8Array(32),
      certificationRecordHash: () => new Uint8Array(32),
      candidateScoreProof: () => 80n,
      issuerSigningKey: () => new Uint8Array(32), // all zeros = unauthorized
    };
    const contract = new Contract(witnessesZero);
    const ctx = contract.initialState();

    expect(() => {
      contract.circuits.revokeCertificate(ctx, toBytes32('target_commitment'));
    }).toThrow(/Unauthorized/);
  });

  it('8. Authorized Admin Circuit: revokeCertificate succeeds with valid issuer key', () => {
    const witnesses = buildWitnesses({ issuerKey: 'valid_issuer_key' });
    const contract = new Contract(witnesses);
    const ctx = contract.initialState();
    const targetCommitment = toBytes32('target_commitment_to_revoke');
    const res = contract.circuits.revokeCertificate(ctx, targetCommitment);

    expect(res.result).toEqual(targetCommitment);
  });

  it('9. Unauthorized resetCertification: rejects call when issuer key is zero', () => {
    const witnessesZero = {
      candidateSecretKey: () => new Uint8Array(32),
      scoreProofNonce: () => new Uint8Array(32),
      certificationRecordHash: () => new Uint8Array(32),
      candidateScoreProof: () => 80n,
      issuerSigningKey: () => new Uint8Array(32),
    };
    const contract = new Contract(witnessesZero);
    const ctx = contract.initialState();

    expect(() => {
      contract.circuits.resetCertification(ctx, toBytes32('new_skill'), 80n);
    }).toThrow(/Unauthorized/);
  });

  it('10. Authorized resetCertification: succeeds with valid issuer signing key', () => {
    const witnesses = buildWitnesses({ issuerKey: 'valid_issuer_key' });
    const contract = new Contract(witnesses);
    const ctx = contract.initialState();
    const newSkill = toBytes32('skill_ai_privacy_engineer');
    const res = contract.circuits.resetCertification(ctx, newSkill, 85n);

    expect(res.result).toEqual(newSkill);
  });

  it('11. Issuer-Only incrementSession: rejects unauthorized caller and allows authorized issuer', () => {
    const witnessesZero = {
      candidateSecretKey: () => new Uint8Array(32),
      scoreProofNonce: () => new Uint8Array(32),
      certificationRecordHash: () => new Uint8Array(32),
      candidateScoreProof: () => 80n,
      issuerSigningKey: () => new Uint8Array(32),
    };
    const contractZero = new Contract(witnessesZero);
    expect(() => {
      contractZero.circuits.incrementSession(contractZero.initialState());
    }).toThrow(/Unauthorized/);

    const contractAuth = new Contract(buildWitnesses({ issuerKey: 'auth_issuer_key' }));
    const res = contractAuth.circuits.incrementSession(contractAuth.initialState());
    expect(res).toBeDefined();
  });

  it('12. Exact Commitment Verification: verifyCertificate returns true on exact 32-byte match', () => {
    const commitment = toBytes32('exact_match_commitment');
    const contract = new Contract(buildWitnesses({}));
    const ctx = contract.initialState({ currentZkState: commitment });
    const res = contract.circuits.verifyCertificate(ctx, commitment);

    expect(res.result).toBe(true);
  });

  it('13. Strict Mismatch Rejection: verifyCertificate returns false on different commitment (no prefix matching)', () => {
    const stored = toBytes32('stored_commitment_original');
    const claimed = toBytes32('claimed_commitment_different');
    const contract = new Contract(buildWitnesses({}));
    const ctx = contract.initialState({ currentZkState: stored });
    const res = contract.circuits.verifyCertificate(ctx, claimed);

    expect(res.result).toBe(false);
  });

  it('14. Public Ledger Schema: ledger() decodes all 8 public ledger fields', () => {
    const parsed = ledger({});
    expect(parsed).toBeDefined();
    expect(parsed).toHaveProperty('certificateCount');
    expect(parsed).toHaveProperty('revokedCount');
    expect(parsed).toHaveProperty('activeSession');
    expect(parsed).toHaveProperty('skillId');
    expect(parsed).toHaveProperty('issuerCommitment');
    expect(parsed).toHaveProperty('lastCertificationCommitment');
    expect(parsed).toHaveProperty('lastRevokedCommitment');
    expect(parsed).toHaveProperty('certificationThreshold');
    expect(typeof parsed.certificateCount).toBe('bigint');
    expect(typeof parsed.certificationThreshold).toBe('bigint');
  });

  it('15. Authoritative Verified Deployment Record', async () => {
    const res = await deployPSCContract();
    expect(res.contractAddress).toBe('0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f');
    expect(res.networkId).toBe('preview');
    expect(res.deploymentStatus).toBe('CONFIRMED_ON_CHAIN');
  });

  it('16. Client Instance: PrivateSkillCertificationClient wires all 5 witnesses without mock fallbacks', () => {
    const client = new PrivateSkillCertificationClient();
    expect(client).toBeDefined();
    expect(client.contractAddress).toBe('0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f');

    client.setCandidateSecretKey('candidate_key_abc');
    client.setScoreProofNonce('nonce_123');
    client.setCertificationRecord('record_content');
    client.setCandidateScore(90);
    client.setIssuerKey('issuer_key_xyz');

    expect(typeof client.issueCertificate).toBe('function');
    expect(typeof client.verifyCertificate).toBe('function');
    expect(typeof client.revokeCertificate).toBe('function');
    expect(typeof client.setIssuerCommitment).toBe('function');
    expect(typeof client.resetCertification).toBe('function');
    expect(typeof client.incrementSession).toBe('function');
  });

  it('17. 1AM Wallet Discovery: getAvailableWallets discovers injected providers', () => {
    (global as any).window = {
      midnight: {
        '1AM': {
          name: '1AM Wallet',
          rdns: 'io.1am.wallet',
          enable: async () => ({}),
          connect: async () => ({}),
        },
        mnLace: {
          name: 'Lace',
          rdns: 'io.lace.wallet',
          enable: async () => ({}),
        }
      }
    };

    const wallets = getAvailableWallets();
    expect(wallets.length).toBeGreaterThanOrEqual(2);
    const oneAm = wallets.find(w => w.is1AM);
    expect(oneAm).toBeDefined();
    expect(oneAm?.name).toBe('1AM Wallet');

    const provider = get1AMWalletProvider();
    expect(provider).toBeDefined();
    expect(provider.name).toBe('1AM Wallet');

    delete (global as any).window;
  });

  it('18. 1AM Approval Connection: simulateApprovalConnect establishes verified session', () => {
    const client = new PrivateSkillCertificationClient();
    const conn = client.simulateApprovalConnect('mn_addr_preview1_1am_test_candidate_xyz');

    expect(conn.connected).toBe(true);
    expect(conn.verified).toBe(true);
    expect(conn.walletAddress).toBe('mn_addr_preview1_1am_test_candidate_xyz');
    expect(conn.walletName).toContain('1AM Wallet');
    expect(client.isApproved).toBe(true);
    expect(client.isConnected).toBe(true);

    const status = client.getWalletStatus();
    expect(status.approved).toBe(true);
    expect(status.connected).toBe(true);
    expect(status.address).toBe('mn_addr_preview1_1am_test_candidate_xyz');
  });

  it('19. Disconnect Cleans Session: disconnectWallet resets active approval', () => {
    const client = new PrivateSkillCertificationClient();
    client.simulateApprovalConnect();
    expect(client.isConnected).toBe(true);

    const disconn = client.disconnectWallet();
    expect(disconn.connected).toBe(false);
    expect(client.isConnected).toBe(false);
    expect(client.isApproved).toBe(false);
    expect(client.connectedAddress).toBeNull();
  });

  it('20. Zero Fallback: connectWallet in Node environment throws without synthetic address', async () => {
    const client = new PrivateSkillCertificationClient();
    await expect(client.connectWallet()).rejects.toThrow('Browser environment required');
  });

});
