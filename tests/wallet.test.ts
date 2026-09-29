import { beforeEach, describe, expect, it } from 'vitest';
import { classifyWalletError, connectWallet, discoverWallets, type WalletSession } from '../src/lib/wallet';

const createSession = (network: string): WalletSession =>
  ({
    getConnectionStatus: async () => ({ status: 'connected', networkId: network }),
    getConfiguration: async () => ({ networkId: network, indexerUri: '', indexerWsUri: '', substrateNodeUri: '' }),
  } as unknown as WalletSession);

describe('1AM & Midnight DApp Connector Wallet Provider', () => {
  beforeEach(() => {
    (globalThis as any).window = { midnight: {} };
  });

  it('discovers registered providers and prefers 1AM Wallet', () => {
    (globalThis as any).window.midnight = {
      other: { name: 'Lace Wallet', apiVersion: '4.0.1', connect: async () => createSession('preview') },
      'uuid-1': { name: '1AM Wallet', apiVersion: '4.0.1', connect: async () => createSession('preview') },
    };
    const wallets = discoverWallets();
    expect(wallets.length).toBe(2);
    expect(wallets[0].name).toBe('1AM Wallet');
  });

  it('connects to 1AM wallet using requested network', async () => {
    let requestedNet = '';
    (globalThis as any).window.midnight = {
      oneAM: {
        name: '1AM Wallet',
        apiVersion: '4.0.1',
        connect: async (network: string) => {
          requestedNet = network;
          return createSession(network);
        },
      },
    };
    const { wallet, session } = await connectWallet('preview');
    expect(requestedNet).toBe('preview');
    expect(wallet.name).toBe('1AM Wallet');
    const status = await session.getConnectionStatus();
    expect(status.status).toBe('connected');
  });

  it('correctly classifies user cancellations without transaction submission', () => {
    const errorMsg = classifyWalletError(new Error('User rejected the transaction.'));
    expect(errorMsg).toMatch(/rejected/i);
    expect(errorMsg).toMatch(/did not leave this device/i);
  });

  it('classifies insufficient DUST fee errors', () => {
    const errorMsg = classifyWalletError(new Error('Insufficient balance of DUST tokens.'));
    expect(errorMsg).toMatch(/dust/i);
  });
});