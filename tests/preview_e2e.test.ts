import { describe, it, expect } from 'vitest';
import { CONTRACT_ADDRESS, NETWORK_CONFIG, hexToBytes, bytesToHex } from '../src/lib/contract';

describe('Midnight Preview Testnet — Live E2E Integration Suite', () => {

  it('1. Network Configuration: target is Midnight Preview Testnet', () => {
    expect(NETWORK_CONFIG.networkId).toBe('preview');
    expect(NETWORK_CONFIG.indexerUrl).toContain('indexer.preview.midnight.network');
    expect(NETWORK_CONFIG.proofServerUrl).toContain('proving.preview.midnight.network');
    expect(CONTRACT_ADDRESS).toBe('0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f');
  });

  it('2. Live Preview Indexer: contract address exists on Midnight Preview GraphQL indexer', async () => {
    const query = JSON.stringify({
      query: `query {
        contractAction(address: "${CONTRACT_ADDRESS}") {
          address
          state
        }
      }`
    });

    const res = await fetch(NETWORK_CONFIG.indexerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: query
    });

    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toBeDefined();
    expect(json.data).toBeDefined();

    const action = json?.data?.contractAction;
    expect(action).toBeDefined();
    expect(action.address).toBe('3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f');
    expect(typeof action.state).toBe('string');
    expect(action.state.length).toBeGreaterThan(100);
  }, 15000);

  it('3. Byte Encoding Round-Trip: hexToBytes and bytesToHex maintain fidelity', () => {
    const originalHex = '0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f'.toLowerCase();
    const bytes = hexToBytes(originalHex);
    expect(bytes.length).toBe(32);
    const recoveredHex = bytesToHex(bytes).toLowerCase();
    expect(recoveredHex).toBe(originalHex);
  });

});
