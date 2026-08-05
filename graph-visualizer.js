class GraphEngine {
  constructor(nodesInput, edgesInput, isDirected = false, startNode = 0) {
    this.nodes = this.parseNodes(nodesInput);
    this.edges = this.parseEdges(edgesInput, this.nodes);
    this.isDirected = isDirected;
    this.startNode = startNode;
  }

  parseNodes(input) {
    if (Array.isArray(input)) return input;
    const str = String(input || '0,1,2,3,4');
    return str
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((val) => !Number.isNaN(val));
  }

  parseEdges(input, nodes) {
    if (Array.isArray(input)) return input;
    if (!input || String(input).trim() === '') {
      const n = nodes.length;
      const defaultEdges = [];
      if (n >= 2) defaultEdges.push({ from: nodes[0], to: nodes[1], weight: 4 });
      if (n >= 3) defaultEdges.push({ from: nodes[0], to: nodes[2], weight: 2 });
      if (n >= 3) defaultEdges.push({ from: nodes[1], to: nodes[2], weight: 1 });
      if (n >= 4) defaultEdges.push({ from: nodes[1], to: nodes[3], weight: 5 });
      if (n >= 5) defaultEdges.push({ from: nodes[2], to: nodes[4], weight: 3 });
      if (n >= 5) defaultEdges.push({ from: nodes[3], to: nodes[4], weight: 6 });
      return defaultEdges;
    }

    const parts = String(input).split(',');
    const edges = [];
    parts.forEach((part) => {
      const match = part.trim().match(/^(\d+)-(\d+)(?::(-?\d+))?$/);
      if (match) {
        const from = Number(match[1]);
        const to = Number(match[2]);
        const weight = match[3] != null ? Number(match[3]) : 1;
        edges.push({ from, to, weight });
      }
    });
    return edges;
  }

  getAdjList() {
    const adj = {};
    this.nodes.forEach((n) => (adj[n] = []));
    this.edges.forEach((e) => {
      if (adj[e.from]) adj[e.from].push({ to: e.to, weight: e.weight });
      if (!this.isDirected && adj[e.to]) {
        adj[e.to].push({ to: e.from, weight: e.weight });
      }
    });
    return adj;
  }

  simulate(algorithm) {
    switch (algorithm) {
      case 'bfs':
        return this.simulateBFS();
      case 'dfs':
        return this.simulateDFS();
      case 'dijkstra':
        return this.simulateDijkstra();
      case 'prim':
        return this.simulatePrim();
      case 'kruskal':
        return this.simulateKruskal();
      case 'bellman-ford':
        return this.simulateBellmanFord();
      default:
        return this.simulateBFS();
    }
  }

  simulateBFS() {
    const steps = [];
    const visited = new Set();
    const queue = [this.startNode];
    visited.add(this.startNode);

    const adj = this.getAdjList();

    steps.push({
      currentNode: this.startNode,
      visitedNodes: Array.from(visited),
      activeEdges: [],
      queue: Array.from(queue),
      message: `Start BFS from node ${this.startNode}`,
      explanation: [`Enqueued start node ${this.startNode}. Visited set initialized.`]
    });

    while (queue.length > 0) {
      const current = queue.shift();

      steps.push({
        currentNode: current,
        visitedNodes: Array.from(visited),
        activeEdges: [],
        queue: Array.from(queue),
        message: `Dequeued Node ${current} for processing`,
        explanation: [`Processing neighbors of node ${current}.`]
      });

      const neighbors = adj[current] || [];
      for (const edge of neighbors) {
        const neighbor = edge.to;
        const activeEdge = { from: current, to: neighbor };

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);

          steps.push({
            currentNode: current,
            visitedNodes: Array.from(visited),
            activeEdges: [activeEdge],
            queue: Array.from(queue),
            message: `Discovered unvisited neighbor Node ${neighbor}`,
            explanation: [`Marked node ${neighbor} as visited and pushed to Queue.`]
          });
        } else {
          steps.push({
            currentNode: current,
            visitedNodes: Array.from(visited),
            activeEdges: [activeEdge],
            queue: Array.from(queue),
            message: `Neighbor Node ${neighbor} is already visited`,
            explanation: [`Skipping already visited node ${neighbor}.`]
          });
        }
      }
    }

    steps.push({
      currentNode: null,
      visitedNodes: Array.from(visited),
      activeEdges: [],
      queue: [],
      message: `BFS Traversal Complete`,
      explanation: [`All reachable nodes have been visited level-by-level.`]
    });

    return steps;
  }

  simulateDFS() {
    const steps = [];
    const visited = new Set();
    const stack = [this.startNode];
    const adj = this.getAdjList();

    steps.push({
      currentNode: this.startNode,
      visitedNodes: [],
      activeEdges: [],
      queue: Array.from(stack),
      message: `Start DFS from node ${this.startNode}`,
      explanation: [`Pushed start node ${this.startNode} onto stack.`]
    });

    while (stack.length > 0) {
      const current = stack.pop();
      if (!visited.has(current)) {
        visited.add(current);

        steps.push({
          currentNode: current,
          visitedNodes: Array.from(visited),
          activeEdges: [],
          queue: Array.from(stack),
          message: `Popped and visited Node ${current}`,
          explanation: [`Node ${current} marked as visited. Exploring adjacent nodes.`]
        });

        const neighbors = adj[current] || [];
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const neighbor = neighbors[i].to;
          const activeEdge = { from: current, to: neighbor };

          if (!visited.has(neighbor)) {
            stack.push(neighbor);
            steps.push({
              currentNode: current,
              visitedNodes: Array.from(visited),
              activeEdges: [activeEdge],
              queue: Array.from(stack),
              message: `Discovered Node ${neighbor}, pushing to stack`,
              explanation: [`Added unvisited node ${neighbor} onto the stack.`]
            });
          }
        }
      }
    }

    steps.push({
      currentNode: null,
      visitedNodes: Array.from(visited),
      activeEdges: [],
      queue: [],
      message: `DFS Traversal Complete`,
      explanation: [`All deep branches explored.`]
    });

    return steps;
  }

  simulateDijkstra() {
    const steps = [];
    const distances = {};
    const previous = {};
    const visited = new Set();

    this.nodes.forEach((n) => {
      distances[n] = Infinity;
      previous[n] = null;
    });

    distances[this.startNode] = 0;
    const adj = this.getAdjList();
    const getPathEdges = () =>
      Object.entries(previous)
        .filter(([, prev]) => prev !== null)
        .map(([node, prev]) => ({ from: Number(prev), to: Number(node) }));

    steps.push({
      currentNode: this.startNode,
      visitedNodes: [],
      activeEdges: [],
      queue: this.formatDistances(distances),
      message: `Initialize Dijkstra from node ${this.startNode}`,
      explanation: [`Set dist[${this.startNode}]=0, all other distances = ∞.`]
    });

    while (visited.size < this.nodes.length) {
      let current = null;
      let minDist = Infinity;
      this.nodes.forEach((n) => {
        if (!visited.has(n) && distances[n] < minDist) {
          minDist = distances[n];
          current = n;
        }
      });

      if (current === null || minDist === Infinity) break;

      visited.add(current);

      steps.push({
        currentNode: current,
        visitedNodes: Array.from(visited),
        activeEdges: getPathEdges(),
        queue: this.formatDistances(distances),
        message: `Selected Node ${current} with minimum distance ${minDist}`,
        explanation: [`Node ${current} finalized. Relaxing outgoing edges.`]
      });

      const neighbors = adj[current] || [];
      for (const edge of neighbors) {
        const neighbor = edge.to;
        const weight = edge.weight;
        const activeEdge = { from: current, to: neighbor };

        if (!visited.has(neighbor)) {
          const newDist = distances[current] + weight;
          if (newDist < distances[neighbor]) {
            distances[neighbor] = newDist;
            previous[neighbor] = current;

            steps.push({
              currentNode: current,
              visitedNodes: Array.from(visited),
              activeEdges: [activeEdge, ...getPathEdges()],
              queue: this.formatDistances(distances),
              message: `Relaxed edge (${current} → ${neighbor}): new dist = ${newDist}`,
              explanation: [`Updated shortest distance to node ${neighbor} = ${newDist}.`]
            });
          } else {
            steps.push({
              currentNode: current,
              visitedNodes: Array.from(visited),
              activeEdges: [activeEdge, ...getPathEdges()],
              queue: this.formatDistances(distances),
              message: `Edge (${current} → ${neighbor}) not relaxed`,
              explanation: [`Existing distance ${distances[neighbor]} <= ${newDist}.`]
            });
          }
        }
      }
    }

    steps.push({
      currentNode: null,
      visitedNodes: Array.from(visited),
      activeEdges: getPathEdges(),
      queue: this.formatDistances(distances),
      message: `Dijkstra Shortest Paths Complete`,
      explanation: [`Shortest distance from node ${this.startNode} to all reachable nodes computed.`]
    });

    return steps;
  }

  simulatePrim() {
    const steps = [];
    const inMST = new Set();
    const mstEdges = [];
    inMST.add(this.startNode);

    steps.push({
      currentNode: this.startNode,
      visitedNodes: Array.from(inMST),
      activeEdges: [],
      queue: [],
      message: `Start Prim's MST from node ${this.startNode}`,
      explanation: [`Added initial node ${this.startNode} to MST.`]
    });

    while (inMST.size < this.nodes.length) {
      let minEdge = null;
      let minWeight = Infinity;

      this.edges.forEach((e) => {
        const uIn = inMST.has(e.from);
        const vIn = inMST.has(e.to);
        if ((uIn && !vIn) || (!this.isDirected && vIn && !uIn)) {
          if (e.weight < minWeight) {
            minWeight = e.weight;
            minEdge = uIn ? { from: e.from, to: e.to, weight: e.weight } : { from: e.to, to: e.from, weight: e.weight };
          }
        }
      });

      if (!minEdge) break;

      inMST.add(minEdge.to);
      mstEdges.push(minEdge);

      steps.push({
        currentNode: minEdge.to,
        visitedNodes: Array.from(inMST),
        activeEdges: mstEdges.map((e) => ({ from: e.from, to: e.to })),
        queue: mstEdges.map((e) => `${e.from}-${e.to}:${e.weight}`),
        message: `Added edge (${minEdge.from} - ${minEdge.to}, weight=${minEdge.weight}) to MST`,
        explanation: [`Selected minimum weight edge crossing the MST cut.`]
      });
    }

    steps.push({
      currentNode: null,
      visitedNodes: Array.from(inMST),
      activeEdges: mstEdges.map((e) => ({ from: e.from, to: e.to })),
      queue: mstEdges.map((e) => `${e.from}-${e.to}:${e.weight}`),
      message: `Prim's MST Construction Complete`,
      explanation: [`Total MST weight = ${mstEdges.reduce((acc, e) => acc + e.weight, 0)}.`]
    });

    return steps;
  }

  simulateKruskal() {
    const steps = [];
    const sortedEdges = [...this.edges].sort((a, b) => a.weight - b.weight);

    const parent = {};
    this.nodes.forEach((n) => (parent[n] = n));

    const find = (i) => {
      if (parent[i] === i) return i;
      return (parent[i] = find(parent[i]));
    };

    const union = (i, j) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent[rootI] = rootJ;
        return true;
      }
      return false;
    };

    const mstEdges = [];
    const visitedNodes = new Set();

    steps.push({
      currentNode: null,
      visitedNodes: [],
      activeEdges: [],
      queue: sortedEdges.map((e) => `${e.from}-${e.to}:${e.weight}`),
      message: `Start Kruskal's MST algorithm`,
      explanation: [`Sorted ${sortedEdges.length} edges by weight in ascending order.`]
    });

    for (const edge of sortedEdges) {
      if (find(edge.from) !== find(edge.to)) {
        union(edge.from, edge.to);
        mstEdges.push(edge);
        visitedNodes.add(edge.from);
        visitedNodes.add(edge.to);

        steps.push({
          currentNode: edge.to,
          visitedNodes: Array.from(visitedNodes),
          activeEdges: mstEdges.map((e) => ({ from: e.from, to: e.to })),
          queue: mstEdges.map((e) => `${e.from}-${e.to}:${e.weight}`),
          message: `Accepted Edge (${edge.from} - ${edge.to}, weight=${edge.weight})`,
          explanation: [`No cycle formed. Added edge to MST.`]
        });
      } else {
        steps.push({
          currentNode: null,
          visitedNodes: Array.from(visitedNodes),
          activeEdges: mstEdges.map((e) => ({ from: e.from, to: e.to })),
          queue: mstEdges.map((e) => `${e.from}-${e.to}:${e.weight}`),
          message: `Rejected Edge (${edge.from} - ${edge.to}, weight=${edge.weight})`,
          explanation: [`Edge creates a cycle, skipped.`]
        });
      }
    }

    steps.push({
      currentNode: null,
      visitedNodes: Array.from(visitedNodes),
      activeEdges: mstEdges.map((e) => ({ from: e.from, to: e.to })),
      queue: mstEdges.map((e) => `${e.from}-${e.to}:${e.weight}`),
      message: `Kruskal's MST Complete`,
      explanation: [`Total MST weight = ${mstEdges.reduce((acc, e) => acc + e.weight, 0)}.`]
    });

    return steps;
  }

  simulateBellmanFord() {
    const steps = [];
    const distances = {};
    this.nodes.forEach((n) => (distances[n] = Infinity));
    distances[this.startNode] = 0;

    const visited = new Set([this.startNode]);

    steps.push({
      currentNode: this.startNode,
      visitedNodes: Array.from(visited),
      activeEdges: [],
      queue: this.formatDistances(distances),
      message: `Initialize Bellman-Ford from node ${this.startNode}`,
      explanation: [`Set dist[${this.startNode}]=0, all other nodes = ∞.`]
    });

    const V = this.nodes.length;
    for (let iter = 1; iter <= V - 1; iter++) {
      let updatedInPass = false;

      for (const edge of this.edges) {
        const u = edge.from;
        const v = edge.to;
        const w = edge.weight;

        if (distances[u] !== Infinity && distances[u] + w < distances[v]) {
          distances[v] = distances[u] + w;
          visited.add(v);
          updatedInPass = true;

          steps.push({
            currentNode: v,
            visitedNodes: Array.from(visited),
            activeEdges: [{ from: u, to: v }],
            queue: this.formatDistances(distances),
            message: `Pass ${iter}: Relaxed edge (${u} → ${v}), dist[${v}] = ${distances[v]}`,
            explanation: [`Updated distance to node ${v} via node ${u}.`]
          });
        }
      }

      if (!updatedInPass) break;
    }

    steps.push({
      currentNode: null,
      visitedNodes: Array.from(visited),
      activeEdges: [],
      queue: this.formatDistances(distances),
      message: `Bellman-Ford Algorithm Complete`,
      explanation: [`Shortest paths calculated for all reachable vertices.`]
    });

    return steps;
  }

  formatDistances(distances) {
    return Object.keys(distances).map((node) => {
      const val = distances[node] === Infinity ? '∞' : distances[node];
      return `d(${node})=${val}`;
    });
  }
}

class GraphRenderer {
  constructor(containerId, options = {}) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.options = options;
    this.isDirected = options.isDirected || false;
    this.nodes = [];
    this.edges = [];
    this.steps = [];
    this.currentStepIndex = 0;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isPlaying = false;
    this.timer = null;
    this.draggedNode = null;
    this.dragOffset = { x: 0, y: 0 };
    this.nodePositions = {};
  }

  getTimelineMarkup() {
    if (!this.steps.length) return '';

    return `
      <div class="graph-timeline-card">
        <div class="timeline-header">
          <div>
            <p class="metric-label">Simulation timeline</p>
            <h4>Step-by-step journey</h4>
          </div>
          <span class="timeline-pill">${this.steps.length} steps</span>
        </div>
        <div class="graph-timeline-list">
          ${this.steps
            .map((step, index) => {
              const label = index + 1 === this.steps.length ? 'Finished' : `Step ${index + 1}`;
              return `
                <button class="graph-timeline-item ${index === this.currentStepIndex ? 'active' : ''}" type="button" data-step-index="${index}">
                  <span class="graph-timeline-dot"></span>
                  <span class="graph-timeline-content">
                    <strong>${label}</strong>
                    <span>${step.message || 'Step completed'}</span>
                  </span>
                </button>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  jumpToStep(index) {
    this.pause();
    this.currentStepIndex = Math.max(0, Math.min(this.steps.length - 1, index));
    this.render();
  }

  init(nodesInput, edgesInput, algorithm = 'bfs', isDirected = false, startNode = 0) {
    this.isDirected = isDirected;
    this.algorithm = algorithm;
    const engine = new GraphEngine(nodesInput, edgesInput, isDirected, startNode);
    this.nodes = engine.nodes;
    this.edges = engine.edges;
    this.steps = engine.simulate(algorithm);
    this.currentStepIndex = 0;
    this.pause();

    this.computeInitialPositions();
    this.render();
  }

  computeInitialPositions() {
    const cx = 350;
    const cy = 200;
    const radius = 140;
    const count = this.nodes.length;

    this.nodes.forEach((node, i) => {
      if (!this.nodePositions[node]) {
        const angle = (2 * Math.PI * i) / Math.max(1, count) - Math.PI / 2;
        this.nodePositions[node] = {
          x: Math.round(cx + radius * Math.cos(angle)),
          y: Math.round(cy + radius * Math.sin(angle))
        };
      }
    });
  }

  render() {
    if (!this.container) return;

    const step = this.steps[this.currentStepIndex] || {};
    const visitedSet = new Set(step.visitedNodes || []);
    const activeEdges = Array.isArray(step.activeEdges) ? step.activeEdges : [];
    const activeEdgeSet = new Set(
      activeEdges.map((e) => `${e.from}-${e.to}`)
    );
    const currentNode = step.currentNode;
    const queueSize = Array.isArray(step.queue) ? step.queue.length : 0;
    const visitedCount = visitedSet.size;
    const activeEdgeCount = activeEdges.length;

    this.container.innerHTML = `
      <div class="graph-visualizer-wrapper">
        <div class="graph-toolbar">
          <div class="toolbar-group">
            <button class="toggle-btn ${this.isDirected ? 'active' : ''}" id="toggle-directed" type="button">
              ${this.isDirected ? '→ Directed Graph' : '— Undirected Graph'}
            </button>
            <span class="toolbar-divider"></span>
            <label class="control-label" for="graph-zoom">Zoom</label>
            <input id="graph-zoom" type="range" min="0.6" max="2.0" step="0.05" value="${this.zoom}" />
            <button class="secondary-btn" id="reset-graph-view" type="button">Reset View</button>
          </div>
          <div class="toolbar-group">
            <span class="algorithm-badge">${(this.algorithm || 'bfs').toUpperCase()}</span>
          </div>
        </div>

        <div class="graph-main-canvas-shell">
          <svg class="graph-svg-canvas" viewBox="0 0 700 400" id="main-graph-svg">
            <defs>
              <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="visited-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <marker id="arrowhead" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
              </marker>
              <marker id="arrowhead-active" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
              </marker>
            </defs>

            <g transform="translate(${this.panX}, ${this.panY}) scale(${this.zoom})">
              <!-- EDGES LAYER -->
              <g class="graph-edges-layer">
                ${this.edges
                  .map((e) => {
                    const fromPos = this.nodePositions[e.from];
                    const toPos = this.nodePositions[e.to];
                    if (!fromPos || !toPos) return '';

                    const isActive =
                      activeEdgeSet.has(`${e.from}-${e.to}`) ||
                      (!this.isDirected && activeEdgeSet.has(`${e.to}-${e.from}`));

                    const edgeColor = isActive ? '#f59e0b' : '#334155';
                    const strokeWidth = isActive ? '4' : '2.5';
                    const marker = this.isDirected
                      ? isActive
                        ? 'url(#arrowhead-active)'
                        : 'url(#arrowhead)'
                      : '';

                    const midX = (fromPos.x + toPos.x) / 2;
                    const midY = (fromPos.y + toPos.y) / 2;

                    return `
                      <g class="graph-edge-group">
                        <line 
                          x1="${fromPos.x}" y1="${fromPos.y}" 
                          x2="${toPos.x}" y2="${toPos.y}" 
                          stroke="${edgeColor}" 
                          stroke-width="${strokeWidth}" 
                          stroke-linecap="round"
                          marker-end="${marker}"
                        />
                        <rect x="${midX - 14}" y="${midY - 10}" width="28" height="18" rx="5" fill="#0f172a" stroke="#1e293b" />
                        <text x="${midX}" y="${midY + 3}" fill="${isActive ? '#fbbf24' : '#94a3b8'}" font-size="11" font-weight="700" text-anchor="middle">
                          ${e.weight}
                        </text>
                      </g>
                    `;
                  })
                  .join('')}
              </g>

              <!-- NODES LAYER -->
              <g class="graph-nodes-layer">
                ${this.nodes
                  .map((node) => {
                    const pos = this.nodePositions[node];
                    if (!pos) return '';

                    const isCurrent = currentNode === node;
                    const isVisited = visitedSet.has(node);

                    let fillColor = '#1e293b';
                    let strokeColor = '#475569';
                    let filter = '';

                    if (isCurrent) {
                      fillColor = '#0284c7';
                      strokeColor = '#38bdf8';
                      filter = 'url(#glow-effect)';
                    } else if (isVisited) {
                      fillColor = '#059669';
                      strokeColor = '#34d399';
                      filter = 'url(#visited-glow)';
                    }

                    return `
                      <g class="graph-node-group" data-node="${node}" style="cursor: grab;">
                        ${
                          isCurrent
                            ? `<circle cx="${pos.x}" cy="${pos.y}" r="28" fill="none" stroke="#f59e0b" stroke-width="3.5" />`
                            : ''
                        }
                        <circle 
                          cx="${pos.x}" cy="${pos.y}" r="22" 
                          fill="${fillColor}" 
                          stroke="${strokeColor}" 
                          stroke-width="3" 
                          filter="${filter}"
                        />
                        <text 
                          x="${pos.x}" y="${pos.y + 6}" 
                          fill="#ffffff" 
                          font-size="16" 
                          font-weight="800" 
                          text-anchor="middle"
                          pointer-events="none"
                        >
                          ${node}
                        </text>
                      </g>
                    `;
                  })
                  .join('')}
              </g>
            </g>
          </svg>

          <!-- MINI MAP -->
          <div class="graph-minimap-box">
            <span class="minimap-title">Mini Map</span>
            <svg class="graph-minimap-svg" viewBox="0 0 700 400">
              <g class="minimap-edges">
                ${this.edges
                  .map((e) => {
                    const f = this.nodePositions[e.from];
                    const t = this.nodePositions[e.to];
                    return f && t
                      ? `<line x1="${f.x}" y1="${f.y}" x2="${t.x}" y2="${t.y}" stroke="#475569" stroke-width="2" />`
                      : '';
                  })
                  .join('')}
              </g>
              <g class="minimap-nodes">
                ${this.nodes
                  .map((n) => {
                    const p = this.nodePositions[n];
                    const isVis = visitedSet.has(n);
                    return p
                      ? `<circle cx="${p.x}" cy="${p.y}" r="10" fill="${isVis ? '#34d399' : '#38bdf8'}" />`
                      : '';
                  })
                  .join('')}
              </g>
              <rect x="${10 - this.panX / 4}" y="${10 - this.panY / 4}" width="${160 / this.zoom}" height="${90 / this.zoom}" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 3" />
            </svg>
          </div>
        </div>

        <!-- STATE DISPLAY PANEL -->
        <div class="graph-status-bar">
          <div class="queue-card">
            <span class="queue-label">${this.algorithm === 'dijkstra' || this.algorithm === 'bellman-ford' ? 'Distance Table' : 'Active Queue / Stack'}</span>
            <div class="queue-items-flow">
              ${
                queueSize > 0
                  ? (step.queue || [])
                      .map(
                        (item) => `<span class="queue-badge">${item}</span>`
                      )
                      .join('')
                  : '<span class="empty-queue">Empty</span>'
              }
            </div>
          </div>
          <div class="explanation-card">
            <span class="step-count">Step ${this.currentStepIndex + 1} / ${this.steps.length}</span>
            <h4 class="step-message">${step.message || 'Graph ready'}</h4>
            <ul class="step-explanation-list">
              ${(step.explanation || []).map((exp) => `<li>${exp}</li>`).join('')}
            </ul>
          </div>
        </div>

        <section class="analytics-panel">
          <div class="analytics-header">
            <div>
              <p class="metric-label">Performance analytics</p>
              <h4>Graph statistics</h4>
            </div>
            <span class="analytics-badge">Realtime</span>
          </div>
          <div class="analytics-grid">
            <div class="analytics-card">
              <span class="metric-label">Algorithm</span>
              <strong>${(this.algorithm || 'bfs').toUpperCase()}</strong>
            </div>
            <div class="analytics-card">
              <span class="metric-label">Nodes</span>
              <strong>${this.nodes.length}</strong>
            </div>
            <div class="analytics-card">
              <span class="metric-label">Edges</span>
              <strong>${this.edges.length}</strong>
            </div>
            <div class="analytics-card">
              <span class="metric-label">Visited</span>
              <strong>${visitedCount}</strong>
            </div>
            <div class="analytics-card">
              <span class="metric-label">Active Edges</span>
              <strong>${activeEdgeCount}</strong>
            </div>
            <div class="analytics-card">
              <span class="metric-label">Queue / Stack Size</span>
              <strong>${queueSize}</strong>
            </div>
            <div class="analytics-card">
              <span class="metric-label">Current Step</span>
              <strong>${this.currentStepIndex + 1}</strong>
            </div>
            <div class="analytics-card">
              <span class="metric-label">Total Steps</span>
              <strong>${this.steps.length}</strong>
            </div>
          </div>
        </section>

        ${this.getTimelineMarkup()}

        <!-- PLAYBACK CONTROLS -->
        <div class="graph-controls-panel">
          <button class="primary-btn" id="graph-play-btn" type="button">${this.isPlaying ? 'Pause' : 'Play'}</button>
          <button class="secondary-btn" id="graph-replay-btn" type="button">Replay</button>
          <button class="secondary-btn" id="graph-prev-btn" type="button">Prev Step</button>
          <button class="secondary-btn" id="graph-next-btn" type="button">Next Step</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const svg = this.container.querySelector('#main-graph-svg');
    const zoomInput = this.container.querySelector('#graph-zoom');
    const resetBtn = this.container.querySelector('#reset-graph-view');
    const toggleBtn = this.container.querySelector('#toggle-directed');
    const playBtn = this.container.querySelector('#graph-play-btn');
    const replayBtn = this.container.querySelector('#graph-replay-btn');
    const prevBtn = this.container.querySelector('#graph-prev-btn');
    const nextBtn = this.container.querySelector('#graph-next-btn');
    const timelineItems = this.container.querySelectorAll('.graph-timeline-item');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.isDirected = !this.isDirected;
        this.init(this.nodes, this.edges, this.algorithm, this.isDirected);
      });
    }

    if (zoomInput) {
      zoomInput.addEventListener('input', (e) => {
        this.zoom = Number(e.target.value);
        this.render();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.render();
      });
    }

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (this.isPlaying) this.pause();
        else this.play();
      });
    }

    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        this.pause();
        this.currentStepIndex = 0;
        this.render();
        this.play();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.jumpToStep(this.currentStepIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.jumpToStep(this.currentStepIndex + 1);
      });
    }

    timelineItems.forEach((item) => {
      item.addEventListener('click', () => {
        const nextIndex = Number(item.dataset.stepIndex || 0);
        this.jumpToStep(nextIndex);
      });
    });

    let isPanning = false;
    let panStart = { x: 0, y: 0 };

    if (svg) {
      svg.addEventListener('pointerdown', (e) => {
        const nodeGroup = e.target.closest('[data-node]');
        if (nodeGroup) {
          const nodeId = Number(nodeGroup.dataset.node);
          this.draggedNode = nodeId;
          const pos = this.nodePositions[nodeId];
          const rect = svg.getBoundingClientRect();
          const svgX = (e.clientX - rect.left - this.panX) / this.zoom;
          const svgY = (e.clientY - rect.top - this.panY) / this.zoom;
          this.dragOffset = { x: svgX - pos.x, y: svgY - pos.y };
        } else {
          isPanning = true;
          panStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
        }
      });

      svg.addEventListener('pointermove', (e) => {
        if (this.draggedNode !== null) {
          const rect = svg.getBoundingClientRect();
          const svgX = (e.clientX - rect.left - this.panX) / this.zoom;
          const svgY = (e.clientY - rect.top - this.panY) / this.zoom;
          this.nodePositions[this.draggedNode] = {
            x: Math.round(svgX - this.dragOffset.x),
            y: Math.round(svgY - this.dragOffset.y)
          };
          this.render();
        } else if (isPanning) {
          this.panX = e.clientX - panStart.x;
          this.panY = e.clientY - panStart.y;
          this.render();
        }
      });

      const stopDrag = () => {
        this.draggedNode = null;
        isPanning = false;
      };

      svg.addEventListener('pointerup', stopDrag);
      svg.addEventListener('pointerleave', stopDrag);
    }
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    const tick = () => {
      if (!this.isPlaying) return;
      if (this.currentStepIndex >= this.steps.length - 1) {
        this.pause();
        return;
      }
      this.currentStepIndex += 1;
      this.render();
      this.timer = setTimeout(tick, 750);
    };
    this.timer = setTimeout(tick, 750);
    this.render();
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const playBtn = this.container?.querySelector('#graph-play-btn');
    if (playBtn) playBtn.textContent = 'Play';
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GraphEngine, GraphRenderer };
}
