// scripts/deploy.ts
// Real-time deployment runner for Private Skill Certification on Midnight Network.

import { deployPSCContract } from '../src/integration/deploy';
import { CONTRACT_ADDRESS, NETWORK_CONFIG, VERIFIED_DEPLOYMENT } from '../src/lib/constants';
import { transactionExplorerUrl, contractExplorerUrl } from '../src/lib/receipt';

async function main() {
  console.log("=============================================================");
  console.log(" Midnight SDK Private Skill Certification (PSC) Deployment");
  console.log(" Target Network: Midnight Preview Testnet");
  console.log("=============================================================");

  const res = await deployPSCContract();

  console.log("\nDeployment Completed Successfully:");
  console.log("  Contract Address:  ", res.contractAddress);
  console.log("  Transaction Hash:  ", res.txHash);
  console.log("  Transaction ID:    ", res.transactionId);
  console.log("  Block Height:      ", res.blockHeight);
  console.log("  Network:           ", res.networkId);
  console.log("  Explorer URL:      ", res.explorerUrl);
  console.log("  Status:            ", res.deploymentStatus);
  if (res.receipt) {
    console.log("  Receipt Type:      ", res.receipt.receipt_type);
    console.log("  Tx Explorer URL:   ", transactionExplorerUrl(res.receipt));
    console.log("  Contract Explorer: ", contractExplorerUrl(res.receipt));
    console.log("  Finalized At:      ", res.receipt.finalized_at);
  }
  console.log("=============================================================\n");
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});