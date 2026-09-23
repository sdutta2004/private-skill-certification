import { deployPSCContract } from '../src/integration/deploy';

async function main() {
  console.log("Starting Authoritative PSC deployment runner...");
  const res = await deployPSCContract();
  console.log("Deployment result:", res);
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
