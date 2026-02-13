// Background worker entry point (placeholder)
import { env } from '../lib/utils/env';

async function main() {
  console.log('Worker starting, interval:', env.simulation.workerInterval);
  // TODO: implement worker loop and Redis interactions
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
