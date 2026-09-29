// src/lib/midnightDeployment.ts
// Real-time Midnight SDK deployment pipeline for Private Skill Certification.
// Directly interfaces with 1AM wallet, Midnight proving provider, indexer, and ledger.

import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import {
  CostModel,
  Transaction,
  type Binding,
  type CoinPublicKey,
  type EncPublicKey,
  type FinalizedTransaction,
  type Proof,
  type SignatureEnabled,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { MidnightProvider, WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { dappConnectorProofProvider } from '@midnight-ntwrk/midnight-js-dapp-connector-proof-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import {
  Contract,
  type EligibilityCredential,
  type Schnorr_SchnorrSignature,
  type Witnesses,
} from '../../contracts/artifacts/contract/index.js';
import type { DeploymentAdapter } from './deployment';

const PRIVATE_STATE_ID = 'psc-credential-v1';
const STORAGE_KEY = 'psc.midnight-storage-key.v1';
const POLICY_TEXT = 'Private Skill Certification Program: candidate score >= 70 and verified skill program; eligibility outcome only.';
const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;

export type Attestation = {
  credential: EligibilityCredential;
  signature: Schnorr_SchnorrSignature;
  issuerId: bigint;
};

export type PSCPrivateState = {
  holderSecret: Uint8Array;
  attestation?: Attestation;
};

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (!/^[0-9a-f]{64}$/i.test(clean)) {
    const bytes = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      bytes.fill(17);
    }
    return bytes;
  }
  return Uint8Array.from(clean.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function storagePassword(): string {
  if (typeof localStorage === 'undefined') {
    return 'PSC!StoragePasswordKey2026';
  }
  let secret = localStorage.getItem(STORAGE_KEY);
  if (!secret || !/^[0-9a-f]{64}$/i.test(secret)) {
    const bytes = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    secret = bytesToHex(bytes);
    localStorage.setItem(STORAGE_KEY, secret);
  }
  const chunks = secret.match(/.{1,3}/g);
  return `PSC!${chunks ? chunks.join('-') : secret}`;
}

async function policyHash(skillId?: string, threshold?: number): Promise<Uint8Array> {
  const policy = `${POLICY_TEXT} [Skill: ${skillId ?? 'skill_fullstack_zk_engineer'}, Threshold: ${threshold ?? 70}]`;
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(policy)));
  }
  const bytes = new Uint8Array(32);
  const enc = new TextEncoder().encode(policy);
  bytes.set(enc.subarray(0, 32));
  return bytes;
}

const witnesses: Witnesses<PSCPrivateState> = {
  getHolderSecret: ({ privateState }) => [privateState, privateState.holderSecret],
  getEligibilityCredential: ({ privateState }) => {
    if (!privateState.attestation) {
      throw new Error('No issuer attestation is enrolled for this local credential.');
    }
    const { credential, signature, issuerId } = privateState.attestation;
    return [privateState, [credential, signature, issuerId]];
  },
  getSchnorrReduction: ({ privateState }, challengeHash) => [
    privateState,
    [challengeHash / TWO_248, challengeHash % TWO_248],
  ],
};

const compiledContract = CompiledContract.make('TriageKey', Contract).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets('/'),
);

function hexToVariableBytes(hex: string): Uint8Array {
  const normalized = hex.replace(/^0x/i, '');
  if (!normalized || normalized.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(normalized)) {
    throw new Error('1AM returned an invalid balanced transaction.');
  }
  return Uint8Array.from(normalized.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
}

function createWalletProviders(
  api: ConnectedAPI,
  shielded: any
): { walletProvider: WalletProvider; midnightProvider: MidnightProvider } {
  const coinPk = shielded?.shieldedCoinPublicKey || shielded?.coinPublicKey || shielded?.publicKey || '';
  const encPk = shielded?.shieldedEncryptionPublicKey || shielded?.encryptionPublicKey || shielded?.encPublicKey || '';
  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => coinPk as CoinPublicKey,
    getEncryptionPublicKey: () => encPk as EncPublicKey,
    async balanceTx(tx) {
      const balanced = await api.balanceUnsealedTransaction(bytesToHex(tx.serialize()));
      return Transaction.deserialize(
        'signature',
        'proof',
        'binding',
        hexToVariableBytes(balanced.tx),
      ) as Transaction<SignatureEnabled, Proof, Binding>;
    },
  };
  const midnightProvider: MidnightProvider = {
    async submitTx(tx: FinalizedTransaction) {
      await api.submitTransaction(bytesToHex(tx.serialize()));
      const txId = tx.identifiers()[0];
      if (!txId) throw new Error('1AM submitted the transaction without returning a transaction identifier.');
      return txId;
    },
  };
  return { walletProvider, midnightProvider };
}

export const deployWithMidnight: DeploymentAdapter = async ({
  wallet,
  network,
  skillId = 'skill_fullstack_zk_engineer',
  threshold = 70,
}) => {
  const configuration = await wallet.getConfiguration();
  if (configuration.networkId !== network) {
    throw new Error(`1AM is configured for ${configuration.networkId}, not ${network}.`);
  }
  setNetworkId(configuration.networkId);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const zkConfigProvider = new FetchZkConfigProvider<any>(
    baseUrl,
    typeof window !== 'undefined' ? window.fetch.bind(window) : undefined,
  );
  const proofProvider = await dappConnectorProofProvider(wallet, zkConfigProvider, CostModel.initialCostModel());
  const publicDataProvider = indexerPublicDataProvider(
    configuration.indexerUri,
    configuration.indexerWsUri,
    typeof window !== 'undefined' ? window.WebSocket : (undefined as any),
  );
  const rawShielded = await wallet.getShieldedAddresses();
  const shielded = Array.isArray(rawShielded) ? rawShielded[0] : rawShielded;
  const { walletProvider, midnightProvider } = createWalletProviders(wallet, shielded);
  const accountId = shielded?.shieldedAddress || shielded?.address || 'psc-default-account';
  const privateStateProvider = levelPrivateStateProvider<typeof PRIVATE_STATE_ID, PSCPrivateState>({
    privateStoragePasswordProvider: storagePassword,
    accountId,
    cryptoBackend: 'webcrypto',
  });

  const holderSecret = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(holderSecret);
  } else {
    holderSecret.fill(17);
  }

  const initialPrivateState: PSCPrivateState = {
    holderSecret,
  };

  const deployed = await deployContract(
    { privateStateProvider, publicDataProvider, zkConfigProvider, proofProvider, walletProvider, midnightProvider },
    {
      compiledContract,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState,
      args: [await policyHash(skillId, threshold)],
    },
  );

  const { contractAddress, txId, txHash, blockHeight, blockTimestamp } = deployed.deployTxData.public;
  return {
    public: {
      contractAddress: String(contractAddress),
      txId: String(txId),
      txHash: String(txHash),
      blockHeight,
      blockTimestamp,
    },
  };
};
