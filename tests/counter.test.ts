import { describe, it, expect } from 'vitest';
import { Contract, ledger } from '../managed/contract/index.js';
import { CONTRACT_ADDRESS, bytesToHex, stringToBytes32 } from '../src/lib/contract';

describe('Private Skill Certification — Auxiliary Circuit Verification', () => {

  it('1. Auxiliary Counter and Session Circuits', () => {
    const witnesses = {
      candidateSecretKey: () => new Uint8Array(32),
      scoreProofNonce: () => new Uint8Array(32),
      certificationRecordHash: () => new Uint8Array(32),
      candidateScoreProof: () => 80n,
      issuerSigningKey: () => stringToBytes32('issuer_key_sample'),
    };
    const contract = new Contract(witnesses);
    expect(contract.circuits.incrementSession).toBeDefined();
    expect(typeof contract.circuits.incrementSession).toBe('function');
  });

  it('2. Authoritative Contract Address Verification', () => {
    expect(CONTRACT_ADDRESS).toBe('0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f');
  });

  it('3. Ledger Schema Counter Bounds', () => {
    const parsed = ledger({});
    expect(parsed.certificateCount >= 0n).toBe(true);
    expect(parsed.activeSession >= 1n).toBe(true);
  });

});
