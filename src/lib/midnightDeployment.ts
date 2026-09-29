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
import { Contract, type Witnesses } from '../../managed/contract/index.js';
import type { DeploymentAdapter } from './deployment';
import { hexToBytes as safeHexToBytes, bytesToHex as safeBytesToHex } from './privateState';

const PRIVATE_STATE_ID = 'psc-credential-v1';
const STORAGE_KEY = 'psc.midnight-storage-key.v1';

export type PSCPrivateState = {
  candidateSecretKey: Uint8Array;
  scoreProofNonce: Uint8Array;
  certificationRecordHash: Uint8Array;
  candidateScoreProof: bigint;
  issuerSigningKey: Uint8Array;
};

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
    secret = safeBytesToHex(bytes);
    localStorage.setItem(STORAGE_KEY, secret);
  }
  const chunks = secret.match(/.{1,3}/g);
  return `PSC!${chunks ? chunks.join('-') : secret}`;
}

export function stringToBytes32(str: string): Uint8Array {
  const bytes = new Uint8Array(32);
  const encoded = new TextEncoder().encode(str);
  bytes.set(encoded.subarray(0, 32));
  return bytes;
}

const witnesses: Witnesses = {
  candidateSecretKey: (ctx: any) => [ctx?.privateState, ctx?.privateState?.candidateSecretKey ?? new Uint8Array(32)],
  scoreProofNonce: (ctx: any) => [ctx?.privateState, ctx?.privateState?.scoreProofNonce ?? new Uint8Array(32)],
  certificationRecordHash: (ctx: any) => [ctx?.privateState, ctx?.privateState?.certificationRecordHash ?? new Uint8Array(32)],
  candidateScoreProof: (ctx: any) => [ctx?.privateState, ctx?.privateState?.candidateScoreProof ?? 85n],
  issuerSigningKey: (ctx: any) => [ctx?.privateState, ctx?.privateState?.issuerSigningKey ?? new Uint8Array(32)],
};

const compiledContract: any = (CompiledContract.make as any)('PrivateSkillCertification', Contract).pipe(
  (CompiledContract.withWitnesses as any)(witnesses),
  (CompiledContract.withCompiledFileAssets as any)('/'),
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
      const balanced = await api.balanceUnsealedTransaction(safeBytesToHex(tx.serialize()));
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
      await api.submitTransaction(safeBytesToHex(tx.serialize()));
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

  const initialPrivateState: PSCPrivateState = {
    candidateSecretKey: new Uint8Array(32).fill(11),
    scoreProofNonce: new Uint8Array(32).fill(22),
    certificationRecordHash: new Uint8Array(32).fill(33),
    candidateScoreProof: BigInt(threshold),
    issuerSigningKey: new Uint8Array(32).fill(44),
  };

  const deployed = await deployContract(
    { privateStateProvider, publicDataProvider, zkConfigProvider, proofProvider, walletProvider, midnightProvider },
    {
      compiledContract,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState,
      args: [],
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