// src/lib/api.ts
// Public receipt registry and verification metrics API client for Private Skill Certification.

import type { PublicReceipt } from './receipt';

export type PublicMetrics = {
  finalized_proofs: number;
  eligible_proofs: number;
  private_attributes_stored: number;
};

const apiBase = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : '/api').replace(/\/$/, '');

export async function publishPublicReceipt(receipt: PublicReceipt): Promise<PublicReceipt> {
  if (!apiBase) return receipt;
  try {
    const response = await fetch(`${apiBase}/receipts`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(receipt),
    });
    if (!response.ok) {
      if (response.status === 409) {
        return receipt;
      }
      return receipt;
    }
    return (await response.json()) as PublicReceipt;
  } catch {
    return receipt;
  }
}

export async function fetchPublicReceipt(transactionId: string): Promise<PublicReceipt | null> {
  if (!apiBase) return null;
  try {
    const response = await fetch(`${apiBase}/receipts/${encodeURIComponent(transactionId)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    return (await response.json()) as PublicReceipt;
  } catch {
    return null;
  }
}

export async function fetchPublicMetrics(): Promise<PublicMetrics | null> {
  if (!apiBase) return null;
  try {
    const response = await fetch(`${apiBase}/metrics`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    return (await response.json()) as PublicMetrics;
  } catch {
    return null;
  }
}