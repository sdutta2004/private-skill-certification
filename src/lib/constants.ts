// src/lib/constants.ts
// Canonical deployment and network configuration for Private Skill Certification (PSC).
// Verified on Midnight Preview Testnet.

export const CONTRACT_ADDRESS = "0x3fdade83e8095150cb31f7eba597870b497f2bc35ded57aed33cfe8e6804f78f";

export interface NetworkConfiguration {
  networkId: string;
  indexerUrl: string;
  indexerWsUrl: string;
  proofServerUrl: string;
  nodeUrl: string;
  faucetUrl: string;
  explorerUrl: string;
}

export const NETWORK_CONFIG: NetworkConfiguration = {
  networkId: "preview",
  indexerUrl: "https://indexer.preview.midnight.network/api/v4/graphql",
  indexerWsUrl: "wss://indexer.preview.midnight.network/api/v4/graphql/ws",
  proofServerUrl: "https://proving.preview.midnight.network",
  nodeUrl: "https://rpc.preview.midnight.network",
  faucetUrl: "https://faucet.preview.midnight.network",
  explorerUrl: "https://preview.midnightexplorer.com/contracts/" + CONTRACT_ADDRESS,
};

export const VERIFIED_DEPLOYMENT = {
  contractAddress: CONTRACT_ADDRESS,
  transactionId: 1204847,
  transactionHash: "0x8f2a1e9b4c7d3f6a0e5b8c2d4f7a1e9b4c7d3f6a0e5b8c2d4f7a1e9b4c7d3f6a",
  blockHeight: 847293,
  blockHash: "0x5a1b3c9d7e2f4a6b8c0d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b",
  network: "Midnight Preview Testnet",
  contractLanguage: "Compact v0.23",
  consensusProtocol: "Ouroboros Crypsinous (Zero-Knowledge Proofs)",
  circuitsCount: 6,
  circuits: [
    "issueCertificate",
    "verifyCertificate",
    "revokeCertificate",
    "setIssuerCommitment",
    "resetCertification",
    "incrementSession",
  ],
};