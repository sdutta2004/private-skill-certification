// src/lib/privateState.ts
// Secure device-only private state management for Private Skill Certification (PSC).
// Zero candidate secrets, scores, or transcripts leave the local client.

const STORAGE_KEY = 'psc.local-credential.v1';

export type LocalSkillCredential = {
  label: string;
  issuedAt: string;
  keyId: string;
  secretHex: string;
  candidateScore: number;
  skillId: string;
  transcriptHash: string;
  nonceHex: string;
  threshold: number;
};

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (!/^[0-9a-f]{64}$/i.test(clean)) {
    throw new Error('The local credential secret is invalid. Replace the local record and try again.');
  }
  return Uint8Array.from(clean.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
}

export function randomSecretHex(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToHex(bytes);
}

function createDefaultCredential(issuedAt: string, score = 85, skillId = 'skill_fullstack_zk_engineer'): LocalSkillCredential {
  const secretHex = randomSecretHex();
  const nonceHex = randomSecretHex();
  return {
    label: 'Confidential Skill Credential',
    issuedAt,
    keyId: `local-candidate-${secretHex.slice(-6).toUpperCase()}`,
    secretHex,
    candidateScore: score,
    skillId,
    transcriptHash: randomSecretHex(),
    nonceHex,
    threshold: 70,
  };
}

function isCredential(value: unknown): value is LocalSkillCredential {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LocalSkillCredential>;
  return (
    typeof candidate.label === 'string' &&
    typeof candidate.issuedAt === 'string' &&
    typeof candidate.keyId === 'string' &&
    typeof candidate.secretHex === 'string' &&
    /^[0-9a-f]{64}$/i.test(candidate.secretHex)
  );
}

export function loadSkillCredential(): LocalSkillCredential {
  if (typeof localStorage === 'undefined') {
    return createDefaultCredential('Created in memory');
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed: unknown = JSON.parse(saved);
      if (isCredential(parsed)) {
        return parsed;
      }
    } catch {
      // Discard malformed record
    }
  }
  const cred = createDefaultCredential('Created in this browser profile');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cred));
  return cred;
}

export function rotateSkillCredential(): LocalSkillCredential {
  const cred = createDefaultCredential('Regenerated local keypair');
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cred));
  }
  return cred;
}

export function updateLocalSkillProfile(
  updates: Partial<Pick<LocalSkillCredential, 'candidateScore' | 'skillId' | 'transcriptHash' | 'threshold'>>
): LocalSkillCredential {
  const current = loadSkillCredential();
  const updated: LocalSkillCredential = {
    ...current,
    ...updates,
    issuedAt: 'Updated in local secure enclave',
  };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function clearSkillCredential(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}