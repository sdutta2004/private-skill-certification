// src/integration/contract.ts
// Re-exports authoritative client and managed contract definitions.

export {
  PrivateSkillCertificationClient,
  CONTRACT_ADDRESS,
  NETWORK_CONFIG,
  bytesToHex,
  hexToBytes,
  stringToBytes32,
  getClient
} from '../lib/contract';

export { Contract, ledger } from '../../managed/contract/index.js';
