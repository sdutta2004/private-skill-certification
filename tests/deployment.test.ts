import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  deployPSCContract,
  registerDeploymentAdapter,
  type DeploymentAdapter,
} from '../src/lib/deployment';
import type { WalletSession } from '../src/lib/wallet';
import { clearPublicReceipt, loadPublicReceipt } from '../src/lib/receipt';

describe('Real-Time Contract Deployment Coordinator', () => {
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
    (globalThis as any).window = {
      dispatchEvent: vi.fn(),
      CustomEvent: class {
        type: string;
        detail: any;
        constructor(type: string, opts: any) {
          this.type = type;
          this.detail = opts?.detail;
        }
      },
    };
    clearPublicReceipt();
  });

  it('rejects deployment if wallet is not connected to requested network', async () => {
    const mockWallet = {
      getConnectionStatus: async () => ({ status: 'connected', networkId: 'preprod' }),
      hintUsage: vi.fn(),
    } as unknown as WalletSession;

    await expect(
      deployPSCContract({
        wallet: mockWallet,
        network: 'preview',
      })
    ).rejects.toThrow(/reconnect before deploying/i);
  });

  it('coordinates real-time deployment and persists the public receipt', async () => {
    const mockWallet = {
      getConnectionStatus: async () => ({ status: 'connected', networkId: 'preview' }),
      hintUsage: vi.fn(),
    } as unknown as WalletSession;

    const mockAdapter: DeploymentAdapter = async ({ network }) => ({
      public: {
        contractAddress: '0x' + 'd'.repeat(64),
        txId: 'tx_midnight_deploy_1234567890',
        txHash: '0x' + 'e'.repeat(64),
        blockHeight: 902100,
        blockTimestamp: 1780000000000,
      },
    });

    registerDeploymentAdapter(mockAdapter);

    const { receipt } = await deployPSCContract({
      wallet: mockWallet,
      network: 'preview',
      skillId: 'skill_fullstack_zk_engineer',
      threshold: 75,
    });

    expect(mockWallet.hintUsage).toHaveBeenCalledWith([
      'getShieldedAddresses',
      'getProvingProvider',
      'balanceUnsealedTransaction',
      'submitTransaction',
    ]);
    expect(receipt.contract_address).toBe('0x' + 'd'.repeat(64));
    expect(receipt.transaction_hash).toBe('0x' + 'e'.repeat(64));
    expect(receipt.block_height).toBe(902100);

    const saved = loadPublicReceipt();
    expect(saved).not.toBeNull();
    expect(saved?.contract_address).toBe(receipt.contract_address);
  });
});