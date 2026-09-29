import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearPublicReceipt,
  loadPublicReceipt,
  receiptFromFinalizedDeployment,
  savePublicReceipt,
  transactionExplorerUrl,
  contractExplorerUrl,
  isPublicReceipt,
  shortenIdentifier,
} from '../src/lib/receipt';

const sampleDeployment = {
  public: {
    contractAddress: '0x' + 'a'.repeat(64),
    txId: 'tx_midnight_' + 'b'.repeat(40),
    txHash: '0x' + 'c'.repeat(64),
    blockHeight: 847293,
    blockTimestamp: 1780000000000,
  },
};

describe('Authoritative Public Receipt Management', () => {
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
    clearPublicReceipt();
  });

  it('extracts public identifiers strictly from finalized deployment data', () => {
    const receipt = receiptFromFinalizedDeployment(sampleDeployment, 'preview');
    expect(receipt.contract_address).toBe(sampleDeployment.public.contractAddress);
    expect(receipt.transaction_hash).toBe(sampleDeployment.public.txHash);
    expect(receipt.transaction_id).toBe(sampleDeployment.public.txId);
    expect(receipt.receipt_type).toBe('deployment');
    expect(receipt.nullifier).toBeNull();
    expect(receipt.block_height).toBe(847293);
  });

  it('persists and reloads validated public receipts across sessions', () => {
    const receipt = receiptFromFinalizedDeployment(sampleDeployment, 'preview');
    savePublicReceipt(receipt);
    const loaded = loadPublicReceipt();
    expect(loaded).toEqual(receipt);
    expect(isPublicReceipt(loaded)).toBe(true);
  });

  it('generates accurate explorer links for Midnight Preview and Preprod', () => {
    const receipt = receiptFromFinalizedDeployment(sampleDeployment, 'preview');
    expect(transactionExplorerUrl(receipt)).toContain('preview.midnightexplorer.com/transactions/');
    expect(contractExplorerUrl(receipt)).toContain('preview.midnightexplorer.com/contracts/');
  });

  it('shortens 64-character cryptographic identifiers cleanly', () => {
    const shortened = shortenIdentifier(sampleDeployment.public.contractAddress);
    expect(shortened).toContain('...');
    expect(shortened.length).toBeLessThan(sampleDeployment.public.contractAddress.length);
  });

  it('rejects placeholder identifiers during receipt extraction', () => {
    expect(() =>
      receiptFromFinalizedDeployment(
        {
          public: {
            ...sampleDeployment.public,
            contractAddress: 'placeholder_address_12345',
          },
        },
        'preview'
      )
    ).toThrow(/Contract address/);
  });
});