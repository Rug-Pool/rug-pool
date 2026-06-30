const { spawn, execSync } = require('child_process');
const path = require('path');

const simulate = spawn('node', ['scripts/simulate.js'], {
  cwd: path.join(__dirname, '..'),
  stdio: ['inherit', 'pipe', 'inherit'],
});

let coinAddress = '';
let vrfPollingStarted = false;
let fulfillCalled = false;

simulate.stdout.on('data', (data) => {
  const text = data.toString();
  process.stdout.write(text);

  // Capture coin address
  const coinMatch = text.match(/SIM coin at: (0x[a-fA-F0-9]+)/);
  if (coinMatch) {
    coinAddress = coinMatch[1];
  }

  // When VRF polling starts, call manualFulfill after a short delay
  if (text.includes('Waiting for VRF fulfillment') && !fulfillCalled) {
    vrfPollingStarted = true;
    setTimeout(() => {
      if (coinAddress && !fulfillCalled) {
        fulfillCalled = true;
        console.log(`\n>>> Auto-triggering manualFulfill for coin ${coinAddress} cycle 1 >>>\n`);
        try {
          const result = execSync(
            `node scripts/manual-fulfill.js ${coinAddress} 1`,
            { cwd: path.join(__dirname, '..'), timeout: 60000 }
          );
          console.log(result.toString());
        } catch (err) {
          console.error('manualFulfill error:', err.stderr?.toString() || err.message);
        }
      }
    }, 5000);
  }
});

simulate.on('close', (code) => {
  console.log(`\nsimulate.js exited with code ${code}`);
});
