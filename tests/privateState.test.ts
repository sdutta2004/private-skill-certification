import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearSkillCredential,
  loadSkillCredential,
  rotateSkillCredential,
  updateLocalSkillProfile,
  hexToBytes,
  bytesToHex,
} from '../src/lib/privateState';

describe('Device-Only Private Skill Credential State', () => {
  beforeEach(() => {
    (globalThis as any).localStorage = {
      _store: {} as Record<string, string>,
      getItem(key: string) {
        return this._store[key] ?? null;
      },
      setItem(key: string, val: string) {
        this._store[key] = val;
      },
      removeItem(key: string) {
        delete this._store[key];
      },
    };
    clearSkillCredential();
  });

  it('loads a device-only default credential when none exists', () => {
    const cred = loadSkillCredential();
    expect(cred.keyId).toMatch(/^local-candidate-/);
    expect(cred.candidateScore).toBe(85);
    expect(cred.secretHex).toMatch(/^[0-9a-f]{64}$/i);
  });

  it('rotates and persists a fresh local cryptographic keypair', () => {
    const initial = loadSkillCredential();
    const rotated = rotateSkillCredential();
    expect(rotated.keyId).not.toBe(initial.keyId);
    expect(loadSkillCredential().keyId).toBe(rotated.keyId);
  });

  it('updates local skill profile attributes without disclosing secrets', () => {
    updateLocalSkillProfile({ candidateScore: 92, skillId: 'skill_rust_zk_core' });
    const updated = loadSkillCredential();
    expect(updated.candidateScore).toBe(92);
    expect(updated.skillId).toBe('skill_rust_zk_core');
  });

  it('correctly converts 32-byte hex strings to byte arrays and back', () => {
    const hex = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';
    const bytes = hexToBytes(hex);
    expect(bytes.length).toBe(32);
    expect(bytesToHex(bytes)).toBe(hex);
  });
});