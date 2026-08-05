const assert = require('assert');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

function waitForServer(port, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const tryConnect = () => {
      const req = http.request({ host: '127.0.0.1', port, path: '/health', method: 'GET' }, (res) => {
        res.resume();
        res.on('end', () => resolve());
      });
      req.on('error', () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error('Server did not start in time'));
          return;
        }
        setTimeout(tryConnect, 200);
      });
      req.end();
    };

    tryConnect();
  });
}

async function main() {
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: '3101' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';
  server.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  try {
    await waitForServer(3101);

    const body = JSON.stringify({ algorithm: 'bubble', values: '5,3,4', target: '', operation: 'none' });
    const response = await new Promise((resolve, reject) => {
      const req = http.request({ host: '127.0.0.1', port: 3101, path: '/api/simulate', method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    assert.strictEqual(response.statusCode, 200, 'Expected HTTP 200 from simulation endpoint');
    const parsed = JSON.parse(response.data);
    assert.ok(parsed.success, 'Expected success flag in response');
    assert.ok(Array.isArray(parsed.output), 'Expected output array in response');
    assert.ok(parsed.meta, 'Expected metadata object in response');
    assert.ok(parsed.meta.complexity, 'Expected complexity value in metadata');

    const invalidBody = JSON.stringify({ algorithm: 'bubble', target: '', operation: 'none' });
    const invalidResponse = await new Promise((resolve, reject) => {
      const req = http.request({ host: '127.0.0.1', port: 3101, path: '/api/simulate', method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.write(invalidBody);
      req.end();
    });

    assert.strictEqual(invalidResponse.statusCode, 400, 'Expected HTTP 400 for missing values');
    const invalidParsed = JSON.parse(invalidResponse.data);
    assert.ok(invalidParsed.error.includes('values'), 'Expected a helpful validation error for missing values');
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
