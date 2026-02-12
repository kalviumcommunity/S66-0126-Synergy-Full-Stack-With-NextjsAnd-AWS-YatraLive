// scripts/start-worker.ts
import { spawn } from 'child_process';

const p = spawn('node', ['worker/index.js'], { stdio: 'inherit' });
p.on('close', (code) => process.exit(code ?? 0));
