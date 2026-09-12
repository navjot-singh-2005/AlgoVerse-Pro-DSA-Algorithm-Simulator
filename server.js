const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { buildTreeAnimationSteps } = require('./tree-visualizer');

const host = '0.0.0.0';
const port = process.env.PORT || 3000;
const root = __dirname;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

const TREE_ALGORITHM_TYPES = new Set(['bst', 'avl', 'trie', 'heap-tree', 'red-black']);

function getComplexityLabel(algorithm, operation) {
  if (['inorder', 'preorder', 'postorder', 'dfs', 'bfs', 'traverse'].includes(operation) && TREE_ALGORITHM_TYPES.has(algorithm)) {
    return 'O(n)';
  }
  if (algorithm === 'bubble') return 'O(n²)';
  if (algorithm === 'selection-sort') return 'O(n²)';
  if (algorithm === 'insertion-sort') return 'O(n²)';
  if (algorithm === 'merge-sort') return 'O(n log n)';
  if (algorithm === 'quick-sort') return 'O(n log n)';
  if (algorithm === 'linear-search') return 'O(n)';
  if (algorithm === 'binary-search') return 'O(log n)';
  if (['bst', 'avl', 'heap-tree', 'red-black'].includes(algorithm)) return 'O(log n)';
  if (algorithm === 'trie') return 'O(m)';
  if (algorithm === 'heap' || algorithm === 'heap-sort') return 'O(n log n)';
  if (algorithm === 'stack' || algorithm === 'queue') return 'O(1)';
  if (algorithm === 'linked-list') return 'O(n)';
  if (algorithm === 'graph' || ['bfs', 'dfs', 'dijkstra', 'prim', 'kruskal', 'bellman-ford'].includes(algorithm)) {
    if (operation === 'dijkstra' || algorithm === 'dijkstra' || operation === 'prim' || algorithm === 'prim' || operation === 'kruskal' || algorithm === 'kruskal') return 'O(E log V)';
    if (operation === 'bellman-ford' || algorithm === 'bellman-ford') return 'O(V · E)';
    return 'O(V + E)';
  }
  return 'O(1)';
}

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function spawnChild(command, args, options = {}, maxAttempts = 3, delayMs = 150) {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const trySpawn = () => {
      const child = spawn(command, args, options);
      let stdout = '';
      let stderr = '';

      if (child.stdout) {
        child.stdout.on('data', (chunk) => {
          stdout += chunk.toString();
        });
      }
      if (child.stderr) {
        child.stderr.on('data', (chunk) => {
          stderr += chunk.toString();
        });
      }

      child.on('error', (error) => {
        if (error && error.code === 'EBUSY' && attempt < maxAttempts - 1) {
          attempt += 1;
          setTimeout(trySpawn, delayMs);
          return;
        }
        reject(error);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
          return;
        }
        const error = new Error(stderr || `Command failed with exit code ${code}`);
        error.code = code;
        reject(error);
      });
    };

    trySpawn();
  });
}

function runCppEngine(algorithm, values, target, operation) {
  const binaryPath = path.join(root, 'algorithm_engine');
  const sourcePath = path.join(root, 'algorithm_engine.cpp');
  const compilers = [
    { command: 'g++', args: ['-std=c++11', sourcePath, '-O2', '-o', binaryPath] },
    { command: 'clang++', args: ['-std=c++11', sourcePath, '-O2', '-o', binaryPath] },
    { command: 'c++', args: ['-std=c++11', sourcePath, '-O2', '-o', binaryPath] }
  ];

  const needsCompile = () => {
    try {
      const binaryStat = fs.statSync(binaryPath);
      const sourceStat = fs.statSync(sourcePath);
      return sourceStat.mtimeMs > binaryStat.mtimeMs;
    } catch (error) {
      return true;
    }
  };

  const compileCpp = () => new Promise((resolve, reject) => {
    let compileIndex = 0;

    const tryCompile = () => {
      if (compileIndex >= compilers.length) {
        reject(new Error('Failed to compile C++ engine with the available toolchains'));
        return;
      }
      const compiler = compilers[compileIndex];
      spawnChild(compiler.command, compiler.args, { cwd: root })
        .then(() => resolve())
        .catch((error) => {
          compileIndex += 1;
          if (compileIndex < compilers.length) {
            tryCompile();
          } else {
            reject(error);
          }
        });
    };

    tryCompile();
  });

  const runBinary = () => spawnChild(binaryPath, [algorithm, values.join(','), target || '', operation || 'none'], { cwd: root });

  return Promise.resolve()
    .then(() => {
      if (needsCompile()) {
        return compileCpp();
      }
    })
    .then(() => runBinary())
    .then(({ stdout }) => stdout.trim());
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  if (req.url === '/api/simulate' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const algorithm = payload.algorithm || 'bubble';
        const rawValues = payload.values;

        if (rawValues == null || String(rawValues).trim() === '') {
          throw new Error('values is required for simulation');
        }

        const target = payload.target != null ? String(payload.target) : '';
        const operation = payload.operation != null ? String(payload.operation) : 'none';

        // Route tree algorithms to the JS tree engine
        if (TREE_ALGORITHM_TYPES.has(algorithm)) {
          const treeSteps = buildTreeAnimationSteps(algorithm, rawValues, operation, target);
          sendJson(res, 200, {
            success: true,
            output: treeSteps,
            meta: {
              algorithm,
              operation,
              complexity: getComplexityLabel(algorithm, operation),
              valueCount: String(rawValues).split(',').length
            }
          });
          return;
        }

        const values = Array.isArray(rawValues)
          ? rawValues.map((value) => Number(value)).filter((value) => !Number.isNaN(value))
          : String(rawValues).split(',').map((value) => Number(value.trim())).filter((value) => !Number.isNaN(value));

        if (values.length === 0) {
          throw new Error('values must contain at least one numeric item');
        }

        const output = await runCppEngine(algorithm, values, target, operation);
        const parsedOutput = JSON.parse(output);
        sendJson(res, 200, {
          success: true,
          output: parsedOutput,
          meta: {
            algorithm,
            operation,
            complexity: getComplexityLabel(algorithm, operation),
            valueCount: values.length
          }
        });
      } catch (error) {
        sendJson(res, 400, { success: false, error: error.message });
      }
    });
    return;
  }

  if (req.url === '/styles.css') {
    serveFile(res, path.join(root, 'styles.css'), 'text/css; charset=utf-8');
    return;
  }

  if (req.url === '/app.js') {
    serveFile(res, path.join(root, 'app.js'), 'application/javascript; charset=utf-8');
    return;
  }

  if (req.url === '/tree-visualizer.js') {
    serveFile(res, path.join(root, 'tree-visualizer.js'), 'application/javascript; charset=utf-8');
    return;
  }

  if (req.url === '/graph-visualizer.js') {
    serveFile(res, path.join(root, 'graph-visualizer.js'), 'application/javascript; charset=utf-8');
    return;
  }

  if (req.url === '/' || req.url === '/index.html') {
    serveFile(res, path.join(root, 'index.html'), 'text/html; charset=utf-8');
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Route not found');
});

server.listen(port, host, () => {
  console.log(`AlgoVerse Pro is running at http://${host}:${port}`);
});
