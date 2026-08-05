const form = document.getElementById('simulator-form');
const results = document.getElementById('results');
const graphPanel = document.getElementById('graph-panel');
const graphCanvas = document.getElementById('graph-canvas');
const infoSidebar = document.getElementById('info-sidebar');
const themeToggle = document.getElementById('theme-toggle');
const loginForm = document.getElementById('login-form');
const authShell = document.getElementById('auth-shell');
const appShell = document.getElementById('app-shell');
const toggleAuth = document.getElementById('toggle-auth');
const authTitle = document.getElementById('auth-title');
const authSubmit = document.getElementById('auth-submit');
const authSwitchText = document.getElementById('auth-switch-text');
const logoutBtn = document.getElementById('logout-btn');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const algorithmSelect = document.getElementById('algorithm');
const operationSelect = document.getElementById('operation');
const valuesInput = document.getElementById('values');
const valuesGroup = document.getElementById('values-group');
const valuesLabel = document.getElementById('values-label');
const valuesHint = document.getElementById('values-hint');
const targetInput = document.getElementById('target');
const targetGroup = document.getElementById('target-group');
const targetHint = document.getElementById('target-hint');
const positionInput = document.getElementById('position');
const positionGroup = document.getElementById('position-group');
const keyInput = document.getElementById('key');
const keyGroup = document.getElementById('key-group');
const valueInput = document.getElementById('value');
const valueGroup = document.getElementById('value-group');
const wordInput = document.getElementById('word');
const wordGroup = document.getElementById('word-group');
const edgesInput = document.getElementById('edges');
const edgesGroup = document.getElementById('edges-group');
const runButton = document.getElementById('run-simulation-btn');
const validationMessage = document.getElementById('validation-message');
const explorerInfo = document.getElementById('explorer-info');
const openSimulatorBtn = document.getElementById('open-simulator-btn');
const openSimulatorCtaBtn = document.getElementById('open-simulator-cta');
const openExplorerBtn = document.getElementById('open-explorer-btn');
const theoryTitle = document.getElementById('theory-title');
const theoryDescription = document.getElementById('theory-description');
const theoryExample = document.getElementById('theory-example');
const theoryList = document.getElementById('theory-list');
const formHint = document.getElementById('form-hint');
const operationGroup = document.getElementById('operation-group');
const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
const commandTrigger = document.getElementById('command-trigger');
const commandPalette = document.getElementById('command-palette');
const commandInput = document.getElementById('command-input');
const algorithmCounter = document.getElementById('algorithm-counter');
const particleLayer = document.getElementById('particles-layer');
const targetLabel = document.getElementById('target-label');
const loadingScreen = document.getElementById('loading-screen');
const resultsPanel = document.getElementById('results');
const currentStreakValue = document.getElementById('current-streak-value');
const liveSimulationsValue = document.getElementById('live-simulations-value');
const weeklyGoalValue = document.getElementById('weekly-goal-value');
const avgCompletionValue = document.getElementById('avg-completion-value');
const conceptsProgressCount = document.getElementById('concepts-progress-count');
const conceptsProgressBar = document.getElementById('concepts-progress-bar');
const simulationsProgressCount = document.getElementById('simulations-progress-count');
const simulationsProgressBar = document.getElementById('simulations-progress-bar');
const recentActivityList = document.getElementById('recent-activity-list');
const learningStreakCount = document.getElementById('learning-streak-count');
const showcaseName = document.getElementById('showcase-name');
const showcaseStep = document.getElementById('showcase-step');
const showcaseAction = document.getElementById('showcase-action');
const showcaseTime = document.getElementById('showcase-time');
const showcaseSpace = document.getElementById('showcase-space');
const showcaseVisual = document.getElementById('showcase-visual');
const showcasePosition = document.getElementById('showcase-position');
const showcaseProgressFill = document.getElementById('showcase-progress-fill');
const showcasePlay = document.getElementById('showcase-play');
const showcaseNext = document.getElementById('showcase-next');
const showcaseChips = Array.from(document.querySelectorAll('.showcase-chip'));

const dashboardState = {
  runs: 0,
  completionTotal: 0,
  streakDays: 0,
  lastRunDate: null,
  weeklyRuns: 0,
  weeklyTarget: 10,
  weeklyPeriodStart: null,
  conceptsSeen: 0,
  seenAlgorithms: [],
  weeklyConceptTarget: 24,
  weeklySimulationTarget: 15,
  recentActivity: []
};

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function isYesterday(prevKey, todayKey) {
  const previous = new Date(`${prevKey}T00:00:00`);
  const today = new Date(`${todayKey}T00:00:00`);
  const diff = Math.round((today - previous) / (1000 * 60 * 60 * 24));
  return diff === 1;
}

function getWeekStart(date) {
  const current = new Date(date);
  const day = current.getDay();
  const diff = (day + 6) % 7;
  current.setDate(current.getDate() - diff);
  current.setHours(0, 0, 0, 0);
  return getDateKey(current);
}

function saveDashboardState() {
  localStorage.setItem('algoverse-dashboard', JSON.stringify(dashboardState));
}

function loadDashboardState() {
  const stored = localStorage.getItem('algoverse-dashboard');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      Object.assign(dashboardState, parsed);
      dashboardState.seenAlgorithms = Array.isArray(parsed.seenAlgorithms) ? parsed.seenAlgorithms : [];
      dashboardState.recentActivity = Array.isArray(parsed.recentActivity) ? parsed.recentActivity : [];
    } catch {
      // ignore corrupt state
    }
  }

  const todayKey = getDateKey(new Date());
  const weekStart = getWeekStart(new Date());
  if (dashboardState.weeklyPeriodStart !== weekStart) {
    dashboardState.weeklyPeriodStart = weekStart;
    dashboardState.weeklyRuns = 0;
  }

  updateDashboardCards();
  renderRecentActivity();
}

function getWeeklyGoalPercent() {
  return Math.min(100, Math.round((dashboardState.weeklyRuns / Math.max(dashboardState.weeklyTarget, 1)) * 100));
}

function getAvgCompletion() {
  if (dashboardState.runs === 0) return 0;
  return Math.round(dashboardState.completionTotal / dashboardState.runs);
}

function updateMomentumProgress() {
  const conceptWidth = Math.min(100, Math.round((dashboardState.conceptsSeen / Math.max(dashboardState.weeklyConceptTarget, 1)) * 100));
  const simulationWidth = Math.min(100, Math.round((dashboardState.runs / Math.max(dashboardState.weeklySimulationTarget, 1)) * 100));

  if (conceptsProgressCount) {
    conceptsProgressCount.textContent = `${dashboardState.conceptsSeen}/${dashboardState.weeklyConceptTarget}`;
  }
  if (conceptsProgressBar) {
    conceptsProgressBar.style.width = `${conceptWidth}%`;
  }
  if (simulationsProgressCount) {
    simulationsProgressCount.textContent = `${dashboardState.runs}/${dashboardState.weeklySimulationTarget}`;
  }
  if (simulationsProgressBar) {
    simulationsProgressBar.style.width = `${simulationWidth}%`;
  }
}

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.round(diffHours / 24);
  return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
}

function renderRecentActivity() {
  if (!recentActivityList) return;
  if (!dashboardState.recentActivity.length) {
    recentActivityList.innerHTML = `
      <div class="list-item">
        <div>
          <strong>No activity yet</strong>
          <p>Run a simulation to populate this feed.</p>
        </div>
      </div>
    `;
    return;
  }

  recentActivityList.innerHTML = dashboardState.recentActivity
    .slice(0, 5)
    .map((item) => `
      <div class="list-item">
        <div>
          <strong>${item.title}</strong>
          <p>${item.detail} • ${formatRelativeTime(item.timestamp)}</p>
        </div>
      </div>
    `)
    .join('');
}

function recordConceptView(algorithm) {
  if (!algorithm) return;
  if (!dashboardState.seenAlgorithms.includes(algorithm)) {
    dashboardState.seenAlgorithms.push(algorithm);
    dashboardState.conceptsSeen += 1;
    saveDashboardState();
    updateMomentumProgress();
  }
}

function addRecentActivity(title, detail) {
  dashboardState.recentActivity.unshift({
    title,
    detail,
    timestamp: Date.now()
  });
  dashboardState.recentActivity = dashboardState.recentActivity.slice(0, 5);
  saveDashboardState();
  renderRecentActivity();
}

function updateDashboardCards() {
  if (currentStreakValue) {
    currentStreakValue.textContent = `${dashboardState.streakDays} days`;
  }
  if (learningStreakCount) {
    learningStreakCount.textContent = `${dashboardState.streakDays} day${dashboardState.streakDays === 1 ? '' : 's'} streak`;
  }
  if (liveSimulationsValue) {
    liveSimulationsValue.textContent = `${dashboardState.runs} runs`;
  }
  if (weeklyGoalValue) {
    weeklyGoalValue.textContent = `${getWeeklyGoalPercent()}%`;
  }
  if (avgCompletionValue) {
    avgCompletionValue.textContent = `${getAvgCompletion()}%`;
  }
  updateMomentumProgress();
}

function recordSimulationRun(completion = 100) {
  const today = new Date();
  const todayKey = getDateKey(today);
  const weekStart = getWeekStart(today);

  if (dashboardState.weeklyPeriodStart !== weekStart) {
    dashboardState.weeklyPeriodStart = weekStart;
    dashboardState.weeklyRuns = 0;
  }

  if (dashboardState.lastRunDate === todayKey) {
    // same day, continue streak
  } else if (dashboardState.lastRunDate && isYesterday(dashboardState.lastRunDate, todayKey)) {
    dashboardState.streakDays += 1;
  } else {
    dashboardState.streakDays = 1;
  }

  dashboardState.runs += 1;
  dashboardState.weeklyRuns += 1;
  dashboardState.completionTotal += completion;
  dashboardState.lastRunDate = todayKey;

  saveDashboardState();
  updateDashboardCards();
}

function initializeDashboardMetrics() {
  loadDashboardState();
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? '🌙 Dark' : '☀️ Light';
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
}

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
});

setTheme('dark');

function createParticles() {
  if (!particleLayer) return;
  particleLayer.innerHTML = '';
  const count = window.innerWidth < 768 ? 20 : 36;

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.width = `${4 + Math.random() * 7}px`;
    particle.style.height = particle.style.width;
    particle.style.opacity = `${0.2 + Math.random() * 0.6}`;
    particle.style.animationDuration = `${6 + Math.random() * 8}s`;
    particle.style.animationDelay = `${Math.random() * 4}s`;
    particleLayer.appendChild(particle);
  }
}

window.addEventListener('resize', createParticles);
createParticles();
initializeDashboardMetrics();

// ===== Live Algorithm Showcase =====
// This section is isolated to the showcase card only and keeps the rest of the dashboard untouched.
const showcaseAlgorithms = [
  {
    name: 'Bubble Sort',
    time: 'O(n²)',
    space: 'O(1)',
    frames: [
      { kind: 'compare', i: 0, j: 1 },
      { kind: 'swap', i: 0, j: 1 },
      { kind: 'compare', i: 1, j: 2 },
      { kind: 'compare', i: 2, j: 3 },
      { kind: 'swap', i: 2, j: 3 },
      { kind: 'compare', i: 3, j: 4 },
      { kind: 'swap', i: 3, j: 4 },
      { kind: 'compare', i: 0, j: 1 },
      { kind: 'compare', i: 1, j: 2 },
      { kind: 'swap', i: 1, j: 2 },
      { kind: 'compare', i: 2, j: 3 },
      { kind: 'swap', i: 2, j: 3 },
      { kind: 'compare', i: 0, j: 1 },
      { kind: 'swap', i: 0, j: 1 },
      { kind: 'compare', i: 0, j: 1 }
    ],
    render: (frame) => buildBubbleVisual(frame)
  },
  {
    name: 'Binary Search',
    time: 'O(log n)',
    space: 'O(1)',
    frames: [
      { kind: 'mid' },
      { kind: 'left' },
      { kind: 'found' }
    ],
    render: (frame) => buildBinaryVisual(frame)
  },
  {
    name: 'Stack',
    time: 'O(1)',
    space: 'O(1)',
    frames: [
      { kind: 'push' },
      { kind: 'pop' }
    ],
    render: (frame) => buildStackVisual(frame)
  },
  {
    name: 'Queue',
    time: 'O(1)',
    space: 'O(1)',
    frames: [
      { kind: 'enqueue' },
      { kind: 'dequeue' }
    ],
    render: (frame) => buildQueueVisual(frame)
  }
];

let showcaseIndex = 0;
let showcasePlaying = false;
let showcaseAnimationFrame = null;
let showcaseAnimationStart = 0;
let showcaseAnimationFrameIndex = 0;
let showcaseAnimationDuration = 10000;
let showcaseAnimationActive = false;

function buildBubbleVisual(frame) {
  const values = [8, 5, 9, 1, 6];
  const maxValue = 9;
  const maxHeight = 180;
  const i = typeof frame.i === 'number' ? frame.i : 0;
  const j = typeof frame.j === 'number' ? frame.j : 1;
  const isCompare = frame.kind === 'compare';
  const isSwap = frame.kind === 'swap';
  const displayValues = values.slice();
  if (isSwap) {
    [displayValues[i], displayValues[j]] = [displayValues[j], displayValues[i]];
  }

  const barElements = displayValues.map((value, index) => {
    const height = (value / maxValue) * maxHeight;
    const isActive = isCompare && (index === i || index === j);
    const isSwapping = isSwap && (index === i || index === j);

    return `
      <div class="showcase-bar-wrapper" data-index="${index}">
        <div class="showcase-vertical-bar ${isActive ? 'glowing' : ''} ${isSwapping ? 'swapping' : ''}" style="height: ${height}px;">
          <span class="bar-value">${value}</span>
        </div>
      </div>
    `;
  }).join('');
  
  return `
    <div class="showcase-bubble-premium">
      <div class="bars-container">
        ${barElements}
      </div>
    </div>
  `;
}

function buildBinaryVisual(frame) {
  const values = [1, 3, 5, 7, 9, 11];
  const active = frame.kind === 'mid' ? [3] : frame.kind === 'left' ? [0, 1, 2] : [3];
  const lowIndex = 0;
  const midIndex = 3;
  const highIndex = 5;
  
  return `
    <div class="showcase-search-wrapper">
      <div class="showcase-search">
        ${values.map((value, index) => `
          <div class="showcase-pill-container">
            ${index === lowIndex ? '<div class="pointer-label low-pointer">LOW</div>' : ''}
            ${index === midIndex ? '<div class="pointer-label mid-pointer">MID</div>' : ''}
            ${index === highIndex ? '<div class="pointer-label high-pointer">HIGH</div>' : ''}
            <div class="showcase-pill ${active.includes(index) ? 'active' : ''} ${frame.kind === 'found' && index === 3 ? 'found' : ''}">${value}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function buildStackVisual(frame) {
  return `
    <div class="showcase-stack stack-flipped">
      <div class="stack-top-label">TOP</div>
      <div class="showcase-stack-slot ${frame.kind === 'push' ? 'glow dropping' : 'exit dropping'}">9</div>
      <div class="showcase-stack-slot ${frame.kind === 'push' ? 'active dropping-delay-1' : 'pop dropping-delay-1'}">5</div>
      <div class="showcase-stack-slot ${frame.kind === 'push' ? 'active dropping-delay-2' : '' } dropping-delay-2">3</div>
      <div class="showcase-stack-base"></div>
    </div>
  `;
}

function buildQueueVisual(frame) {
  return `
    <div class="showcase-queue-wrapper">
      <div class="queue-label queue-front-label">FRONT</div>
      <div class="showcase-queue">
        <div class="showcase-queue-cell ${frame.kind === 'enqueue' ? 'active' : ''}">1</div>
        <div class="showcase-queue-cell ${frame.kind === 'enqueue' ? 'active' : 'fade'}">3</div>
        <div class="showcase-queue-cell ${frame.kind === 'enqueue' ? 'glow' : 'exit'}">5</div>
      </div>
      <div class="queue-label queue-rear-label">REAR</div>
    </div>
  `;
}

function updateShowcaseUI(index) {
  const current = showcaseAlgorithms[index];
  if (!current || !showcaseName || !showcaseStep || !showcaseAction || !showcaseTime || !showcaseSpace || !showcaseVisual || !showcasePosition) {
    return;
  }

  showcaseName.textContent = current.name;
  showcaseStep.textContent = current.step || '';
  showcaseAction.textContent = current.action || '';
  showcaseTime.textContent = current.time;
  showcaseSpace.textContent = current.space;
  showcasePosition.textContent = `${index + 1} / ${showcaseAlgorithms.length}`;
  showcaseProgressFill.style.width = `${((index + 1) / showcaseAlgorithms.length) * 100}%`;

  showcaseChips.forEach((chip, chipIndex) => {
    chip.classList.toggle('active', chipIndex === index);
  });
}

function renderShowcaseFrame(index, frameIndex) {
  const current = showcaseAlgorithms[index];
  if (!current || !showcaseVisual) {
    return;
  }

  const frame = current.frames[Math.min(frameIndex, current.frames.length - 1)] || current.frames[0];
  showcaseStep.textContent = frame.step || '';
  showcaseAction.textContent = frame.action || '';
  showcaseVisual.innerHTML = current.render(frame);
  showcaseVisual.classList.remove('is-changing');
  void showcaseVisual.offsetWidth;
  showcaseVisual.classList.add('is-changing');
}

function setShowcaseButtonState() {
  if (!showcasePlay) {
    return;
  }

  showcasePlay.disabled = showcaseAnimationActive;
  showcasePlay.textContent = showcaseAnimationActive ? '⏳ Running' : '▶ Play';
  showcasePlay.setAttribute('aria-label', showcaseAnimationActive ? 'Showcase is running' : 'Play showcase');

  const showcaseHeader = document.querySelector('.showcase-header');
  if (showcaseHeader) {
    showcaseHeader.classList.toggle('showcase-playing', showcaseAnimationActive);
  }
}

function stopShowcaseAnimation() {
  if (showcaseAnimationFrame) {
    window.cancelAnimationFrame(showcaseAnimationFrame);
    showcaseAnimationFrame = null;
  }

  showcaseAnimationActive = false;
  setShowcaseButtonState();
}

function runShowcaseAnimation() {
  const current = showcaseAlgorithms[showcaseIndex];
  if (!current) {
    return;
  }

  showcaseAnimationActive = true;
  setShowcaseButtonState();
  updateShowcaseUI(showcaseIndex);
  showcaseAnimationFrameIndex = 0;
  showcaseAnimationDuration = 10000;
  showcaseAnimationStart = performance.now();
  renderShowcaseFrame(showcaseIndex, 0);

  const tick = (timestamp) => {
    if (!showcasePlaying) {
      return;
    }

    const elapsed = timestamp - showcaseAnimationStart;
    const frameIndex = Math.min(current.frames.length - 1, Math.floor(elapsed / 900));

    if (frameIndex !== showcaseAnimationFrameIndex) {
      showcaseAnimationFrameIndex = frameIndex;
      renderShowcaseFrame(showcaseIndex, frameIndex);
    }

    if (elapsed < showcaseAnimationDuration) {
      showcaseAnimationFrame = window.requestAnimationFrame(tick);
    } else {
      showcaseAnimationFrame = null;
      showcaseAnimationActive = false;
      setShowcaseButtonState();
      showcaseIndex = (showcaseIndex + 1) % showcaseAlgorithms.length;
      updateShowcaseUI(showcaseIndex);
      renderShowcaseFrame(showcaseIndex, 0);
      window.setTimeout(() => {
        if (showcasePlaying) {
          runShowcaseAnimation();
        }
      }, 220);
    }
  };

  showcaseAnimationFrame = window.requestAnimationFrame(tick);
}

function setShowcasePlaying(isPlaying) {
  showcasePlaying = isPlaying;

  if (!showcasePlaying) {
    stopShowcaseAnimation();
    return;
  }

  runShowcaseAnimation();
}

function goShowcase(index) {
  stopShowcaseAnimation();
  showcaseIndex = (index + showcaseAlgorithms.length) % showcaseAlgorithms.length;
  updateShowcaseUI(showcaseIndex);
  renderShowcaseFrame(showcaseIndex, 0);

  if (showcasePlaying) {
    runShowcaseAnimation();
  }
}

if (showcasePlay) {
  showcasePlay.addEventListener('click', () => {
    setShowcasePlaying(!showcasePlaying);
  });
}

if (showcaseNext) {
  showcaseNext.addEventListener('click', () => {
    goShowcase(showcaseIndex + 1);
  });
}

showcaseChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const targetIndex = Number(chip.dataset.index || 0);
    goShowcase(targetIndex);
  });
});

updateShowcaseUI(0);
renderShowcaseFrame(0, 0);

window.addEventListener('load', () => {
  if (loadingScreen) {
    window.setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 600);
  }
});

let isSignup = false;

function saveSession(email) {
  localStorage.setItem('algoverse-user', JSON.stringify({ email }));
}

function loadSession() {
  const saved = localStorage.getItem('algoverse-user');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function showApp(email) {
  profileName.textContent = email.split('@')[0] || 'Student';
  profileEmail.textContent = email;
  authShell.hidden = true;
  appShell.hidden = false;
}

function showAuth() {
  authShell.hidden = false;
  appShell.hidden = true;
}

function setAuthMode(signup) {
  isSignup = signup;
  authTitle.textContent = signup ? 'Create your AlgoVerse account' : 'Sign in to AlgoVerse Pro';
  authSubmit.textContent = signup ? 'Create account' : 'Enter workspace';
  authSwitchText.textContent = signup ? 'Already have an account?' : 'New here?';
  toggleAuth.textContent = signup ? 'Sign in' : 'Create account';
}

toggleAuth.addEventListener('click', () => {
  setAuthMode(!isSignup);
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || password.length < 4) {
    alert('Please enter a valid email and password.');
    return;
  }

  if (isSignup) {
    saveSession(email);
    showApp(email);
  } else {
    const existing = loadSession();
    if (existing && existing.email === email) {
      showApp(email);
    } else {
      saveSession(email);
      showApp(email);
    }
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('algoverse-user');
  showAuth();
});

const savedUser = loadSession();
if (savedUser) {
  showApp(savedUser.email);
} else {
  showAuth();
  setAuthMode(false);
}

function updateTheoryCard(card) {
  theoryTitle.textContent = card.dataset.title || 'Bubble Sort';
  theoryDescription.textContent = card.dataset.theory || 'Bubble Sort compares neighboring values and swaps them until the array is fully ordered.';
  theoryExample.textContent = card.dataset.example || 'Example: 5, 3, 4 → 3, 4, 5 after repeated passes.';
  const points = (card.dataset.points || '').split(';').map((item) => item.trim()).filter(Boolean);
  theoryList.innerHTML = points.map((item) => `<li>${item}</li>`).join('');

  const detailIds = [
    ['theory-definition', 'definition'],
    ['theory-visualization', 'visualization'],
    ['theory-complexity', 'complexity'],
    ['theory-related-algorithms', 'related-algorithms']
  ];

  detailIds.forEach(([elementId, datasetKey]) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = card.dataset[datasetKey] || 'Not available for this algorithm.';
    }
  });

  explorerInfo.innerHTML = `
    <strong>${card.dataset.title}</strong><br />
    <span>${card.dataset.summary}</span>
  `;

  if (card.dataset.supported === 'true') {
    results.innerHTML = `<p class="empty">${card.dataset.title} is ready for live simulation.</p>`;
  } else {
    results.innerHTML = `<p class="empty">${card.dataset.title} is highlighted as a study approach. Use the simulator form for supported algorithms.</p>`;
  }

  recordConceptView(card.dataset.algorithm || card.dataset.title);
}

document.querySelectorAll('.algorithm-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.algorithm-card').forEach((button) => button.classList.remove('active'));
    card.classList.add('active');

    algorithmSelect.value = card.dataset.algorithm || 'bubble';
    operationSelect.value = card.dataset.operation || 'none';
    valuesInput.value = card.dataset.values || '';
    targetInput.value = card.dataset.target || '';

    updateTheoryCard(card);
  });
});

function showPanel(targetId) {
  document.querySelectorAll('.panel-section').forEach((section) => {
    section.hidden = section.id !== targetId;
  });
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.target === targetId));
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => showPanel(button.dataset.target));
});

function openSimulatorPanel() {
  const activeCard = document.querySelector('.algorithm-card.active');
  if (!activeCard) return;
  updateTheoryCard(activeCard);
  showPanel('simulator-panel');
}

openSimulatorBtn.addEventListener('click', openSimulatorPanel);

if (openSimulatorCtaBtn) {
  openSimulatorCtaBtn.addEventListener('click', openSimulatorPanel);
}

openExplorerBtn.addEventListener('click', () => {
  showPanel('theory-panel');
});

document.getElementById('continue-learning-btn').addEventListener('click', () => {
  showPanel('theory-panel');
});

document.querySelectorAll('.quick-action[data-target]').forEach((button) => {
  button.addEventListener('click', () => {
    showPanel(button.dataset.target);
  });
});

commandTrigger.addEventListener('click', () => {
  commandPalette.hidden = false;
  commandInput.focus();
});

commandPalette.addEventListener('click', (event) => {
  if (event.target === commandPalette) {
    commandPalette.hidden = true;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    commandPalette.hidden = false;
    commandInput.focus();
  }

  if (event.altKey && event.key.toLowerCase() === 't') {
    event.preventDefault();
    const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }

  if (event.altKey && event.key.toLowerCase() === 's') {
    event.preventDefault();
    document.getElementById('simulator-panel').hidden = false;
    showPanel('simulator-panel');
  }

  if (event.altKey && event.key.toLowerCase() === 'h') {
    event.preventDefault();
    showPanel('home-panel');
  }

  if (event.key === 'Escape') {
    commandPalette.hidden = true;
  }
});

commandInput.addEventListener('input', () => {
  const query = commandInput.value.trim().toLowerCase();
  document.querySelectorAll('.command-item').forEach((item) => {
    const text = item.textContent.toLowerCase();
    const matched = !query || text.includes(query) || item.dataset.target.includes(query);
    item.hidden = !matched;
  });
});

document.querySelectorAll('.command-item').forEach((item) => {
  item.addEventListener('click', () => {
    showPanel(item.dataset.target);
    commandPalette.hidden = true;
  });
});

commandInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const visibleItem = document.querySelector('.command-item:not([hidden])');
    if (visibleItem) {
      event.preventDefault();
      showPanel(visibleItem.dataset.target);
      commandPalette.hidden = true;
    }
  }
});

const initialCard = document.querySelector('.algorithm-card.active');
if (initialCard) {
  updateTheoryCard(initialCard);
}

if (algorithmCounter) {
  let start = null;
  const duration = 1400;
  const target = 12;

  const tick = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    algorithmCounter.textContent = `${Math.round(eased * target)}+`;

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    } else {
      algorithmCounter.textContent = `${target}+`;
    }
  };

  window.requestAnimationFrame(tick);
}

showPanel('home-panel');

const algorithmFieldConfig = {
  bubble: {
    valuesLabel: 'Array Values (comma-separated)',
    valuesHint: 'Example: 8,3,6,1,9,2',
    showValues: true,
    showTarget: false,
    showOperation: false,
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Enter an array of values to sort.',
  },
  'binary-search': {
    valuesLabel: 'Sorted Array Values (comma-separated)',
    valuesHint: 'Example: 1,2,3,4,5,6',
    targetLabel: 'Target value',
    targetHint: 'Example: 4',
    showValues: true,
    showTarget: true,
    showOperation: false,
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Array must already be sorted.',
  },
  heap: {
    valuesLabel: 'Array Values (comma-separated)',
    valuesHint: 'Example: 8,3,6,1,9,2',
    showValues: true,
    showTarget: false,
    showOperation: true,
    operationOptions: [
      { value: 'heap-sort', label: 'Heap Sort' },
    ],
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Heap Sort is supported with the array values provided.',
  },
  'selection-sort': {
    valuesLabel: 'Array Values (comma-separated)',
    valuesHint: 'Example: 8,3,6,1,9,2',
    showValues: true,
    showTarget: false,
    showOperation: false,
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Selection sort repeatedly selects the smallest remaining element.',
  },
  'insertion-sort': {
    valuesLabel: 'Array Values (comma-separated)',
    valuesHint: 'Example: 8,3,6,1,9,2',
    showValues: true,
    showTarget: false,
    showOperation: false,
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Insertion sort builds the sorted list one item at a time.',
  },
  'quick-sort': {
    valuesLabel: 'Array Values (comma-separated)',
    valuesHint: 'Example: 8,3,6,1,9,2',
    showValues: true,
    showTarget: false,
    showOperation: false,
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Quick sort uses divide and conquer to sort the array quickly.',
  },
  'merge-sort': {
    valuesLabel: 'Array Values (comma-separated)',
    valuesHint: 'Example: 8,3,6,1,9,2',
    showValues: true,
    showTarget: false,
    showOperation: false,
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Merge sort divides the array and merges sorted halves.',
  },
  'linear-search': {
    valuesLabel: 'Array Values (comma-separated)',
    valuesHint: 'Example: 8,3,6,1,9,2',
    targetLabel: 'Search value',
    targetHint: 'Example: 5',
    showValues: true,
    showTarget: true,
    showOperation: false,
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Enter an array and a value to search for with linear search.',
  },
  stack: {
    valuesLabel: 'Initial Stack Values (comma-separated)',
    valuesHint: 'Example: 5,8,1,9,2',
    targetLabel: 'Push value',
    targetHint: 'Example: 25',
    showValues: true,
    showTarget: true,
    showOperation: true,
    operationOptions: [
      { value: 'push', label: 'Push' },
      { value: 'pop', label: 'Pop' },
    ],
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Set initial stack values and choose push or pop.',
  },
  queue: {
    valuesLabel: 'Initial Queue Values (comma-separated)',
    valuesHint: 'Example: 5,8,1,9,2',
    targetLabel: 'Enqueue value',
    targetHint: 'Example: 12',
    showValues: true,
    showTarget: true,
    showOperation: true,
    operationOptions: [
      { value: 'enqueue', label: 'Enqueue' },
      { value: 'dequeue', label: 'Dequeue' },
    ],
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Set initial queue values and choose enqueue or dequeue.',
  },
  'linked-list': {
    valuesLabel: 'Current List Values (comma-separated)',
    valuesHint: 'Example: 1,2,3,4',
    targetLabel: 'Node value',
    targetHint: 'Example: 15',
    showValues: true,
    showTarget: true,
    showOperation: true,
    operationOptions: [
      { value: 'insert', label: 'Insert' },
      { value: 'delete', label: 'Delete' },
      { value: 'search', label: 'Search' },
    ],
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Choose insert, delete, or search and provide the node value.',
  },
  graph: {
    valuesLabel: 'Vertices (comma-separated)',
    valuesHint: 'Example: 0,1,2,3,4',
    showValues: true,
    showTarget: false,
    showOperation: true,
    operationOptions: [
      { value: 'bfs', label: 'BFS' },
      { value: 'dfs', label: 'DFS' },
      { value: 'dijkstra', label: 'Dijkstra' },
      { value: 'prim', label: "Prim's MST" },
      { value: 'kruskal', label: "Kruskal's MST" },
      { value: 'bellman-ford', label: 'Bellman-Ford' },
    ],
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: true,
    formHint: 'Provide vertices and edges for the graph operation.',
  },
  bfs: {
    valuesLabel: 'Vertices (comma-separated)',
    valuesHint: 'Example: 0,1,2,3,4',
    showValues: true,
    showTarget: false,
    showOperation: false,
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: true,
    formHint: 'Provide vertices and edges for BFS traversal.',
  },
  dfs: {
    valuesLabel: 'Vertices (comma-separated)',
    valuesHint: 'Example: 0,1,2,3,4',
    showValues: true,
    showTarget: false,
    showOperation: false,
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: true,
    formHint: 'Provide vertices and edges for DFS traversal.',
  },
  dijkstra: {
    valuesLabel: 'Vertices (comma-separated)',
    valuesHint: 'Example: 0,1,2,3,4',
    showValues: true,
    showTarget: false,
    showOperation: false,
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: true,
    formHint: 'Provide vertices and weighted edges for Dijkstra.',
  },
  prim: {
    valuesLabel: 'Vertices (comma-separated)',
    valuesHint: 'Example: 0,1,2,3',
    showValues: true,
    showTarget: false,
    showOperation: false,
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: true,
    formHint: 'Provide vertices and edges to build the MST.',
  },
  kruskal: {
    valuesLabel: 'Vertices (comma-separated)',
    valuesHint: 'Example: 0,1,2,3',
    showValues: true,
    showTarget: false,
    showOperation: false,
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: true,
    formHint: 'Provide vertices and weighted edges to build the MST.',
  },
  'bellman-ford': {
    valuesLabel: 'Vertices (comma-separated)',
    valuesHint: 'Example: 0,1,2,3',
    showValues: true,
    showTarget: false,
    showOperation: false,
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: true,
    formHint: 'Provide vertices and weighted edges for Bellman-Ford.',
  },
  bst: {
    valuesLabel: 'Tree values (comma-separated)',
    valuesHint: 'Example: 10,5,15,3,7',
    targetLabel: 'Value',
    targetHint: 'Example: 15',
    showValues: true,
    showTarget: true,
    showOperation: true,
    operationOptions: [
      { value: 'insert', label: 'Insert' },
      { value: 'delete', label: 'Delete' },
      { value: 'search', label: 'Search' },
      { value: 'inorder', label: 'Inorder' },
      { value: 'preorder', label: 'Preorder' },
      { value: 'postorder', label: 'Postorder' },
      { value: 'bfs', label: 'Level Order' },
    ],
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Choose a BST operation and provide values as needed.',
  },
  avl: {
    valuesLabel: 'Tree values (comma-separated)',
    valuesHint: 'Example: 10,5,15,3,7',
    targetLabel: 'Value',
    targetHint: 'Example: 15',
    showValues: true,
    showTarget: true,
    showOperation: true,
    operationOptions: [
      { value: 'insert', label: 'Insert' },
      { value: 'delete', label: 'Delete' },
      { value: 'search', label: 'Search' },
      { value: 'inorder', label: 'Inorder' },
      { value: 'preorder', label: 'Preorder' },
      { value: 'postorder', label: 'Postorder' },
      { value: 'bfs', label: 'Level Order' },
    ],
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Choose an AVL tree operation and provide values as needed.',
  },
  'red-black': {
    valuesLabel: 'Tree values (comma-separated)',
    valuesHint: 'Example: 10,5,15,3,7',
    targetLabel: 'Value',
    targetHint: 'Example: 15',
    showValues: true,
    showTarget: true,
    showOperation: true,
    operationOptions: [
      { value: 'insert', label: 'Insert' },
      { value: 'delete', label: 'Delete' },
      { value: 'search', label: 'Search' },
      { value: 'inorder', label: 'Inorder' },
      { value: 'preorder', label: 'Preorder' },
      { value: 'postorder', label: 'Postorder' },
      { value: 'bfs', label: 'Level Order' },
    ],
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Choose a red-black tree operation and provide values as needed.',
  },
  'heap-tree': {
    valuesLabel: 'Tree values (comma-separated)',
    valuesHint: 'Example: 10,5,15,3,7',
    targetLabel: 'Value',
    targetHint: 'Example: 15',
    showValues: true,
    showTarget: true,
    showOperation: true,
    operationOptions: [
      { value: 'insert', label: 'Insert' },
      { value: 'delete', label: 'Delete' },
      { value: 'search', label: 'Search' },
      { value: 'inorder', label: 'Inorder' },
      { value: 'preorder', label: 'Preorder' },
      { value: 'postorder', label: 'Postorder' },
      { value: 'bfs', label: 'Level Order' },
    ],
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: false,
    showEdges: false,
    formHint: 'Choose a heap tree operation and provide values as needed.',
  },
  trie: {
    valuesLabel: 'Word list (comma-separated)',
    valuesHint: 'Example: cat,dog,car',
    targetLabel: 'Word',
    targetHint: 'Example: hello',
    showValues: true,
    showTarget: false,
    showOperation: true,
    operationOptions: [
      { value: 'insert', label: 'Insert Word' },
      { value: 'search', label: 'Search Word' },
      { value: 'delete', label: 'Delete Word' },
      { value: 'prefix', label: 'Prefix Search' },
    ],
    showPosition: false,
    showKey: false,
    showValue: false,
    showWord: true,
    showEdges: false,
    formHint: 'Provide words and select a trie operation.',
  },
};

function showField(element, visible) {
  if (!element) return;
  element.hidden = !visible;
}

function populateOperationOptions(options = []) {
  operationSelect.innerHTML = options
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join('');
}

function updateAlgorithmFields() {
  const algorithm = algorithmSelect.value;
  const config = algorithmFieldConfig[algorithm] || algorithmFieldConfig.bubble;

  valuesLabel.textContent = config.valuesLabel || 'Values (comma-separated)';
  valuesInput.placeholder = config.valuesHint || '8,3,6,1,9,2';
  valuesHint.textContent = config.valuesHint || '';
  targetLabel.textContent = config.targetLabel || 'Target value';
  targetInput.placeholder = config.targetHint || '6';
  targetHint.textContent = config.targetHint || '';
  formHint.textContent = config.formHint || 'Choose the correct inputs for the selected algorithm.';

  showField(valuesGroup, config.showValues);
  showField(targetGroup, config.showTarget);
  showField(operationGroup, config.showOperation);
  showField(positionGroup, config.showPosition);
  showField(keyGroup, config.showKey);
  showField(valueGroup, config.showValue);
  showField(wordGroup, config.showWord);
  showField(edgesGroup, config.showEdges);

  if (config.showOperation) {
    populateOperationOptions(config.operationOptions || []);
  }

  updateOperationFields();
}

function updateOperationFields() {
  const algorithm = algorithmSelect.value;
  const operation = operationSelect.value;

  // Reset fields that can change based on the operation
  if (algorithm !== 'trie') {
    showField(wordGroup, false);
  }

  if (algorithm === 'stack') {
    const showTarget = operation === 'push';
    showField(targetGroup, showTarget);
    targetLabel.textContent = 'Push value';
    targetHint.textContent = 'Example: 25';
  }

  if (algorithm === 'queue') {
    const showTarget = operation === 'enqueue';
    showField(targetGroup, showTarget);
    targetLabel.textContent = 'Enqueue value';
    targetHint.textContent = 'Example: 15';
  }

  if (algorithm === 'linked-list') {
    const showTarget = ['insert', 'delete', 'search'].includes(operation);
    showField(targetGroup, showTarget);
    showField(positionGroup, false);
    targetLabel.textContent = operation === 'search' ? 'Search value' : 'Value';
    targetHint.textContent = 'Example: 15';
  }

  if (algorithm === 'bst' || algorithm === 'avl' || algorithm === 'red-black' || algorithm === 'heap-tree') {
    const showTarget = ['insert', 'delete', 'search'].includes(operation);
    showField(targetGroup, showTarget);
    targetLabel.textContent = operation === 'search' ? 'Search value' : 'Value';
    targetHint.textContent = 'Example: 15';
  }

  if (algorithm === 'trie') {
    showField(wordGroup, true);
    showField(targetGroup, false);
  }
}

targetInput.addEventListener('input', validateForm);
valuesInput.addEventListener('input', validateForm);
positionInput?.addEventListener('input', validateForm);
wordInput?.addEventListener('input', validateForm);
operationSelect.addEventListener('change', () => {
  updateOperationFields();
  validateForm();
});
algorithmSelect.addEventListener('change', () => {
  updateAlgorithmFields();
  validateForm();
});

function validateForm() {
  const algorithm = algorithmSelect.value;
  const values = valuesInput.value.trim();
  const target = targetInput.value.trim();
  const operation = operationSelect.value;
  const position = positionInput?.value.trim();
  const word = wordInput?.value.trim();
  const edges = edgesInput?.value.trim();

  validationMessage.textContent = '';
  runButton.disabled = false;

  if (!values && valuesGroup && !valuesGroup.hidden) {
    validationMessage.textContent = 'Enter array values.';
    runButton.disabled = true;
    return;
  }

  if (algorithm === 'binary-search' && !target) {
    validationMessage.textContent = 'Enter target value.';
    runButton.disabled = true;
    return;
  }

  if (algorithm === 'linear-search' && !target) {
    validationMessage.textContent = 'Enter a target value to search.';
    runButton.disabled = true;
    return;
  }

  if (algorithm === 'stack' && operation === 'push' && !target) {
    validationMessage.textContent = 'Enter value to push.';
    runButton.disabled = true;
    return;
  }

  if (algorithm === 'queue' && operation === 'enqueue' && !target) {
    validationMessage.textContent = 'Enter value to enqueue.';
    runButton.disabled = true;
    return;
  }

  if (algorithm === 'linked-list' && ['insert', 'delete', 'search'].includes(operation) && !target) {
    validationMessage.textContent = operation === 'search' ? 'Enter value to search.' : 'Enter a value.';
    runButton.disabled = true;
    return;
  }

  if (['bst', 'avl', 'red-black', 'heap-tree'].includes(algorithm) && ['insert', 'delete', 'search'].includes(operation) && !target) {
    validationMessage.textContent = 'Enter a value.';
    runButton.disabled = true;
    return;
  }

  if (algorithm === 'trie' && !word) {
    validationMessage.textContent = 'Enter a word.';
    runButton.disabled = true;
    return;
  }

  if (['graph', 'bfs', 'dfs', 'dijkstra', 'prim', 'kruskal', 'bellman-ford'].includes(algorithm) && !edges) {
    validationMessage.textContent = 'Enter graph edges.';
    runButton.disabled = true;
    return;
  }
}

updateAlgorithmFields();
validateForm();

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const algorithm = document.getElementById('algorithm').value;
  const values = document.getElementById('values').value.trim();
  const operation = document.getElementById('operation').value;
  const word = document.getElementById('word')?.value.trim();
  const target = algorithm === 'trie' ? word : document.getElementById('target').value.trim();
  const edges = document.getElementById('edges')?.value?.trim() || '';

  if (!values) {
    results.innerHTML = '<p class="empty">Please enter at least one value to simulate.</p>';
    graphPanel.hidden = true;
    infoSidebar.innerHTML = '<h4>Simulation note</h4><p>Enter a comma-separated list of values before running the simulator.</p>';
    return;
  }

  results.innerHTML = '<p class="empty">Running simulation...</p>';

  const isGraphAlgo = ['graph', 'bfs', 'dfs', 'dijkstra', 'prim', 'kruskal', 'bellman-ford'].includes(algorithm) ||
                      ['bfs', 'dfs', 'dijkstra', 'prim', 'kruskal', 'bellman-ford'].includes(operation);

  if (isGraphAlgo) {
    results.hidden = true;
    graphPanel.hidden = false;
    renderGraphVisualizer(values, edges, algorithm, operation);
    addRecentActivity(
      algorithm === 'graph' ? 'Graph simulation' : algorithm.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      `${operation.replace(/-/g, ' ')}`.trim() || 'Run'
    );
    recordSimulationRun(100);
    return;
  }

  results.hidden = false;
  graphPanel.hidden = true;

  try {
    const response = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm, values, target, operation, edges })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Unknown error');
    }

    const responseAlgorithm = data.meta?.algorithm || algorithm;
    renderResults(data.output, responseAlgorithm);
    addRecentActivity(
      responseAlgorithm.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      target || operation || 'Run'
    );
    recordSimulationRun(100);
  } catch (error) {
    results.innerHTML = `<p class="empty">${error.message}</p>`;
  }
});

let activeBubblePlayback = null;
let activeBinaryPlayback = null;
let activeSortPlayback = null;
let activeLinearPlayback = null;

function attachTimeline(steps, onSelectStep, currentIndex = 0) {
  const timelineHost = document.createElement('div');
  timelineHost.className = 'timeline-host';
  timelineHost.innerHTML = `
    <div class="timeline-card">
      <div class="timeline-header">
        <div>
          <p class="metric-label">Simulation timeline</p>
          <h4>Step-by-step journey</h4>
        </div>
        <span class="timeline-pill">${steps.length} steps</span>
      </div>
      <div class="timeline-list">
        ${steps
          .map((step, index) => {
            const label = index + 1 === steps.length ? 'Finished' : `Step ${index + 1}`;
            const message = step.message || 'Step completed';
            return `
              <button class="timeline-item ${index === currentIndex ? 'active' : ''}" type="button" data-step-index="${index}">
                <span class="timeline-dot"></span>
                <span class="timeline-content">
                  <strong>${label}</strong>
                  <span>${message}</span>
                </span>
              </button>
            `;
          })
          .join('')}
      </div>
    </div>
  `;

  const timelineItems = Array.from(timelineHost.querySelectorAll('.timeline-item'));
  function updateSelection(nextIndex) {
    timelineItems.forEach((entry) => {
      entry.classList.toggle('active', Number(entry.dataset.stepIndex || 0) === nextIndex);
    });
  }

  timelineItems.forEach((item) => {
    item.addEventListener('click', () => {
      const nextIndex = Number(item.dataset.stepIndex || 0);
      onSelectStep(nextIndex);
      updateSelection(nextIndex);
    });
  });

  timelineHost.updateSelection = updateSelection;
  timelineHost.updateSelection(currentIndex);
  return timelineHost;
}

function formatAnalyticsValue(value, formatter) {
  if (typeof formatter === 'function') {
    return formatter(value);
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return value;
}

function animateAnalyticsCounter(element, targetValue, formatter) {
  if (!element) return;
  const previousValue = Number(element.dataset.value ?? 0);
  const targetNumber = typeof targetValue === 'number' ? targetValue : Number(targetValue);

  if (typeof targetValue !== 'number' || Number.isNaN(targetNumber)) {
    element.textContent = formatAnalyticsValue(targetValue, formatter);
    element.dataset.value = String(targetValue);
    return;
  }

  const startValue = Number.isFinite(previousValue) ? previousValue : 0;
  const startTime = performance.now();
  const duration = 320;

  const step = (now) => {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = startValue + (targetNumber - startValue) * eased;
    element.textContent = formatAnalyticsValue(Number(currentValue.toFixed(targetNumber % 1 === 0 ? 0 : 1)), formatter);
    element.dataset.value = String(targetNumber);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

function getAlgorithmProfile(algorithm, operation) {
  const normalizedAlgorithm = (algorithm || '').toLowerCase();
  const normalizedOperation = (operation || '').toLowerCase();

  if (normalizedAlgorithm === 'bubble') {
    return {
      memory: 'O(1) aux',
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
      stable: 'Yes',
      inPlace: 'Yes',
      recursive: 'No'
    };
  }

  if (normalizedAlgorithm === 'selection-sort' || normalizedAlgorithm === 'insertion-sort') {
    return {
      memory: 'O(1) aux',
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
      stable: normalizedAlgorithm === 'insertion-sort' ? 'Yes' : 'No',
      inPlace: 'Yes',
      recursive: 'No'
    };
  }

  if (normalizedAlgorithm === 'quick-sort') {
    return {
      memory: 'O(log n) aux',
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
      stable: 'No',
      inPlace: 'Yes',
      recursive: 'Yes'
    };
  }

  if (normalizedAlgorithm === 'linear-search') {
    return {
      memory: 'O(1) aux',
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
      stable: 'N/A',
      inPlace: 'Yes',
      recursive: 'No'
    };
  }

  if (normalizedAlgorithm === 'binary-search') {
    return {
      memory: 'O(1) aux',
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
      stable: 'N/A',
      inPlace: 'Yes',
      recursive: normalizedOperation === 'recursive' ? 'Yes' : 'No'
    };
  }

  if (normalizedAlgorithm === 'stack' || normalizedAlgorithm === 'queue') {
    return {
      memory: 'O(n) storage',
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
      stable: 'N/A',
      inPlace: 'Yes',
      recursive: 'No'
    };
  }

  if (normalizedAlgorithm === 'linked-list') {
    return {
      memory: 'O(n) nodes',
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
      stable: 'Yes',
      inPlace: 'Yes',
      recursive: 'No'
    };
  }

  if (normalizedAlgorithm === 'heap' || normalizedAlgorithm === 'heap-sort' || normalizedAlgorithm === 'heap-tree') {
    return {
      memory: 'O(1) aux',
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      stable: 'No',
      inPlace: 'Yes',
      recursive: 'No'
    };
  }

  if (['bst', 'avl', 'trie', 'red-black'].includes(normalizedAlgorithm)) {
    return {
      memory: 'O(n) nodes',
      best: normalizedAlgorithm === 'trie' ? 'O(m)' : 'O(log n)',
      average: normalizedAlgorithm === 'trie' ? 'O(m)' : 'O(log n)',
      worst: normalizedAlgorithm === 'trie' ? 'O(m)' : 'O(n)',
      stable: 'N/A',
      inPlace: 'No',
      recursive: normalizedAlgorithm === 'trie' ? 'No' : 'Yes'
    };
  }

  if (['graph', 'bfs', 'dfs', 'dijkstra', 'prim', 'kruskal', 'bellman-ford'].includes(normalizedAlgorithm)) {
    return {
      memory: 'O(V + E)',
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
      stable: 'N/A',
      inPlace: 'No',
      recursive: normalizedAlgorithm === 'dfs' ? 'Yes' : 'No'
    };
  }

  return {
    memory: 'O(1)',
    best: 'O(1)',
    average: 'O(1)',
    worst: 'O(1)',
    stable: 'N/A',
    inPlace: 'Yes',
    recursive: 'No'
  };
}

function drawAnalyticsChart(canvas, steps, currentIndex) {
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const width = Math.max(260, canvas.clientWidth || 280);
  const height = Math.max(120, canvas.clientHeight || 140);
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  const padding = { top: 16, right: 16, bottom: 24, left: 24 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  context.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  context.lineWidth = 1;
  for (let row = 0; row <= 4; row += 1) {
    const y = padding.top + (plotHeight / 4) * row;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
  }

  const series = steps.map((step, index) => {
    const previousValues = index > 0 && Array.isArray(steps[index - 1]?.values) ? steps[index - 1].values : [];
    const currentValues = Array.isArray(step.values) ? step.values : [];
    const swaps = previousValues.length > 0 ? currentValues.filter((value, idx) => previousValues[idx] !== value).length : 0;
    return {
      comparisons: index + 1,
      swaps
    };
  });

  const maxValue = Math.max(...series.map((point) => Math.max(point.comparisons, point.swaps, 1)), 1);
  const visiblePoints = series.slice(0, Math.max(1, currentIndex + 1));
  const buildPath = (key) => {
    const path = new Path2D();
    visiblePoints.forEach((point, index) => {
      const x = padding.left + (plotWidth / Math.max(1, Math.max(visiblePoints.length - 1, 1))) * index;
      const y = padding.top + plotHeight - (point[key] / maxValue) * plotHeight;
      if (index === 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    });
    return path;
  };

  context.strokeStyle = '#38bdf8';
  context.lineWidth = 2.2;
  context.stroke(buildPath('comparisons'));

  context.strokeStyle = '#f59e0b';
  context.lineWidth = 2.2;
  context.stroke(buildPath('swaps'));

  context.fillStyle = '#cbd5e1';
  context.font = '12px Inter, sans-serif';
  context.fillText('Comparisons', padding.left, 12);
  context.fillStyle = '#fbbf24';
  context.fillText('Swaps', width - 72, 12);
}

function attachAnalyticsPanel(parent, { algorithm, operation, steps, elapsedMs = 0, comparisons = 0, swaps = 0, currentPass = 1, currentStep = 1 }) {
  const profile = getAlgorithmProfile(algorithm, operation);
  const panel = document.createElement('section');
  panel.className = 'analytics-panel';
  panel.innerHTML = `
    <div class="analytics-header">
      <div>
        <p class="metric-label">Performance analytics</p>
        <h4>Live statistics</h4>
      </div>
      <span class="analytics-badge">Realtime</span>
    </div>
    <div class="analytics-grid">
      <div class="analytics-card">
        <span class="metric-label">Execution Time</span>
        <strong data-role="execution-time">0.0s</strong>
      </div>
      <div class="analytics-card">
        <span class="metric-label">Memory</span>
        <strong data-role="memory">${profile.memory}</strong>
      </div>
      <div class="analytics-card">
        <span class="metric-label">Comparisons</span>
        <strong data-role="comparisons">0</strong>
      </div>
      <div class="analytics-card">
        <span class="metric-label">Swaps</span>
        <strong data-role="swaps">0</strong>
      </div>
      <div class="analytics-card">
        <span class="metric-label">Current Pass</span>
        <strong data-role="current-pass">1</strong>
      </div>
      <div class="analytics-card">
        <span class="metric-label">Current Step</span>
        <strong data-role="current-step">1</strong>
      </div>
      <div class="analytics-card">
        <span class="metric-label">Best Case</span>
        <strong data-role="best-case">${profile.best}</strong>
      </div>
      <div class="analytics-card">
        <span class="metric-label">Average Case</span>
        <strong data-role="average-case">${profile.average}</strong>
      </div>
      <div class="analytics-card">
        <span class="metric-label">Worst Case</span>
        <strong data-role="worst-case">${profile.worst}</strong>
      </div>
      <div class="analytics-card">
        <span class="metric-label">Stable</span>
        <strong data-role="stable">${profile.stable}</strong>
      </div>
      <div class="analytics-card">
        <span class="metric-label">In-place</span>
        <strong data-role="in-place">${profile.inPlace}</strong>
      </div>
      <div class="analytics-card">
        <span class="metric-label">Recursive</span>
        <strong data-role="recursive">${profile.recursive}</strong>
      </div>
    </div>
    <div class="analytics-chart-shell">
      <canvas class="analytics-canvas" aria-label="Performance chart"></canvas>
    </div>
  `;

  parent.appendChild(panel);

  const elements = {
    executionTime: panel.querySelector('[data-role="execution-time"]'),
    memory: panel.querySelector('[data-role="memory"]'),
    comparisons: panel.querySelector('[data-role="comparisons"]'),
    swaps: panel.querySelector('[data-role="swaps"]'),
    currentPass: panel.querySelector('[data-role="current-pass"]'),
    currentStep: panel.querySelector('[data-role="current-step"]'),
    bestCase: panel.querySelector('[data-role="best-case"]'),
    averageCase: panel.querySelector('[data-role="average-case"]'),
    worstCase: panel.querySelector('[data-role="worst-case"]'),
    stable: panel.querySelector('[data-role="stable"]'),
    inPlace: panel.querySelector('[data-role="in-place"]'),
    recursive: panel.querySelector('[data-role="recursive"]'),
    canvas: panel.querySelector('.analytics-canvas')
  };

  function update(nextValues = {}) {
    const mergedValues = {
      elapsedMs: elapsedMs,
      comparisons,
      swaps,
      currentPass,
      currentStep,
      ...nextValues
    };

    animateAnalyticsCounter(elements.executionTime, `${(mergedValues.elapsedMs / 1000).toFixed(1)}s`, (value) => `${Number(value).toFixed(1)}s`);
    animateAnalyticsCounter(elements.comparisons, mergedValues.comparisons, (value) => `${Math.round(value)}`);
    animateAnalyticsCounter(elements.swaps, mergedValues.swaps, (value) => `${Math.round(value)}`);
    animateAnalyticsCounter(elements.currentPass, mergedValues.currentPass, (value) => `${Math.round(value)}`);
    animateAnalyticsCounter(elements.currentStep, mergedValues.currentStep, (value) => `${Math.round(value)}`);
    if (elements.memory) {
      elements.memory.textContent = profile.memory;
    }
    if (elements.bestCase) {
      elements.bestCase.textContent = profile.best;
    }
    if (elements.averageCase) {
      elements.averageCase.textContent = profile.average;
    }
    if (elements.worstCase) {
      elements.worstCase.textContent = profile.worst;
    }
    if (elements.stable) {
      elements.stable.textContent = profile.stable;
    }
    if (elements.inPlace) {
      elements.inPlace.textContent = profile.inPlace;
    }
    if (elements.recursive) {
      elements.recursive.textContent = profile.recursive;
    }
    drawAnalyticsChart(elements.canvas, steps, Math.max(0, Math.min(steps.length - 1, mergedValues.currentStep - 1)));
  }

  return { update };
}

function renderResults(output, responseAlgorithm) {
  const steps = Array.isArray(output) ? output : [output];
  const algorithm = responseAlgorithm || document.getElementById('algorithm').value;
  const operation = document.getElementById('operation').value;
  const target = document.getElementById('target')?.value.trim();
  const complexity = getComplexityLabel(algorithm, operation);

  if (['selection-sort', 'insertion-sort', 'quick-sort', 'merge-sort'].includes(algorithm) && steps.length > 0) {
    renderSortVisualizer(steps, complexity, algorithm);
    return;
  }

  if (algorithm === 'linear-search' && steps.length > 0) {
    renderLinearSearchVisualizer(steps, complexity, target);
    return;
  }

  // Route graph algorithms to interactive graph visualizer
  if ((['graph', 'bfs', 'dfs', 'dijkstra', 'prim', 'kruskal', 'bellman-ford'].includes(algorithm) ||
       ['bfs', 'dfs', 'dijkstra', 'prim', 'kruskal', 'bellman-ford'].includes(operation))) {
    const edgesVal = document.getElementById('edges')?.value?.trim() || '';
    results.hidden = true;
    graphPanel.hidden = false;
    renderGraphVisualizer(valuesInput.value.trim(), edgesVal, algorithm, operation);
    return;
  }

  // Route tree algorithms to the tree visualizer
  if (['bst', 'avl', 'trie', 'heap-tree', 'red-black'].includes(algorithm) && steps.length > 0) {
    renderTreeVisualizer(steps, complexity, algorithm, valuesInput.value.trim(), operation);
    return;
  }

  if (algorithm === 'bubble' && steps.length > 0) {
    renderBubbleVisualizer(steps, complexity);
    return;
  }

  if (algorithm === 'binary-search' && steps.length > 0) {
    const valuesInputStr = document.getElementById('values').value.trim();
    const targetInputStr = document.getElementById('target').value.trim();
    renderBinarySearchVisualizer(steps, complexity, valuesInputStr, targetInputStr);
    return;
  }

  if (algorithm === 'stack' && steps.length > 0) {
    renderStackVisualizer(steps, complexity, operation);
    return;
  }

  if (algorithm === 'queue' && steps.length > 0) {
    renderQueueVisualizer(steps, complexity, operation);
    return;
  }

  if (algorithm === 'linked-list' && steps.length > 0) {
    renderLinkedListVisualizer(steps, complexity, operation);
    return;
  }

  if ((algorithm === 'heap' || algorithm === 'heap-sort') && steps.length > 0) {
    renderHeapVisualizer(steps, complexity);
    return;
  }

  const summary = `
    <div class="dashboard-summary">
      <div class="metric-card">
        <span class="metric-label">Steps</span>
        <strong>${steps.length}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Mode</span>
        <strong>${algorithm}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Complexity</span>
        <strong>${complexity}</strong>
      </div>
    </div>
  `;

  const cards = steps
    .map((step, index) => {
      const values = Array.isArray(step.values) ? step.values : [];
      const message = step.message || 'Step completed';
      const explanations = Array.isArray(step.explanation) ? step.explanation : [];
      const progress = Math.round(((index + 1) / Math.max(steps.length, 1)) * 100);
      return `
        <article class="step-card step-${index + 1}">
          <div class="step-header">
            <h3>Step ${index + 1}</h3>
            <span class="progress-badge">${progress}%</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
          <p>${message}</p>
          <div>${values.map((value) => `<span class="array-pill">${value}</span>`).join('')}</div>
          <ul class="explanation-list">
            ${explanations.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </article>
      `;
    })
    .join('');

  results.innerHTML = summary + cards;
}

function renderBubbleVisualizer(steps, complexity) {
  if (activeBubblePlayback && typeof activeBubblePlayback.stop === 'function') {
    activeBubblePlayback.stop();
  }

  const initialValues = Array.isArray(steps[0]?.values) ? steps[0].values : [];
  const maxValue = Math.max(...initialValues, 1);
  const state = {
    steps,
    currentIndex: 0,
    isPlaying: false,
    speed: 1,
    timer: null,
    elapsedMs: 0,
    comparisons: 0,
    swaps: 0,
    lastValues: initialValues.slice()
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'bubble-visualizer';
  wrapper.innerHTML = `
    <div class="bubble-summary-grid">
      <div class="metric-card">
        <span class="metric-label">Pass</span>
        <strong data-role="pass">1</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Comparisons</span>
        <strong data-role="comparisons">0</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Swaps</span>
        <strong data-role="swaps">0</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Complexity</span>
        <strong>${complexity}</strong>
      </div>
    </div>
    <div class="bubble-controls">
      <div class="bubble-buttons">
        <button class="primary-btn" type="button" data-action="play">Play</button>
        <button class="secondary-btn" type="button" data-action="replay">Replay</button>
        <button class="secondary-btn" type="button" data-action="prev">Previous Step</button>
        <button class="secondary-btn" type="button" data-action="next">Next Step</button>
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="bubble-timeline">Timeline</label>
        <input class="bubble-timeline" id="bubble-timeline" type="range" min="0" max="${Math.max(steps.length - 1, 0)}" value="0" />
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="bubble-speed">Speed</label>
        <input class="bubble-speed" id="bubble-speed" type="range" min="0.5" max="2.5" step="0.25" value="1" />
      </div>
    </div>
    <div class="bubble-stage">
      <div class="bubble-bars" aria-label="Bubble sort array bars"></div>
      <div class="bubble-status-card">
        <p class="metric-label">Current step</p>
        <h3 data-role="current-step">1 / ${steps.length}</h3>
        <p class="bubble-message"></p>
        <p class="bubble-explanation"></p>
        <div class="bubble-progress-track">
          <div class="bubble-progress-fill"></div>
        </div>
        <div class="bubble-metrics">
          <span class="bubble-pill">Timer <strong data-role="timer">0.0s</strong></span>
          <span class="bubble-pill">Total steps <strong>${steps.length}</strong></span>
        </div>
      </div>
    </div>
  `;

  results.innerHTML = '';
  results.appendChild(wrapper);

  const timeline = attachTimeline(steps, (nextIndex) => {
    setIndex(nextIndex);
  }, state.currentIndex);
  wrapper.appendChild(timeline);

  const analytics = attachAnalyticsPanel(wrapper, {
    algorithm: 'bubble',
    operation: 'sort',
    steps,
    elapsedMs: state.elapsedMs,
    comparisons: state.comparisons,
    swaps: state.swaps,
    currentPass: 1,
    currentStep: 1
  });

  const passEl = wrapper.querySelector('[data-role="pass"]');
  const comparisonEl = wrapper.querySelector('[data-role="comparisons"]');
  const swapEl = wrapper.querySelector('[data-role="swaps"]');
  const currentStepEl = wrapper.querySelector('[data-role="current-step"]');
  const timerEl = wrapper.querySelector('[data-role="timer"]');
  const messageEl = wrapper.querySelector('.bubble-message');
  const explanationEl = wrapper.querySelector('.bubble-explanation');
  const barsContainer = wrapper.querySelector('.bubble-bars');
  const progressFill = wrapper.querySelector('.bubble-progress-fill');
  const timelineInput = wrapper.querySelector('.bubble-timeline');
  const speedInput = wrapper.querySelector('.bubble-speed');
  const playButton = wrapper.querySelector('[data-action="play"]');
  const replayButton = wrapper.querySelector('[data-action="replay"]');
  const prevButton = wrapper.querySelector('[data-action="prev"]');
  const nextButton = wrapper.querySelector('[data-action="next"]');

  function clampIndex(index) {
    return Math.max(0, Math.min(steps.length - 1, index));
  }

  function deriveView(index) {
    const values = Array.isArray(steps[index]?.values) ? steps[index].values : [];
    const previousValues = index > 0 && Array.isArray(steps[index - 1]?.values) ? steps[index - 1].values : null;
    const pairIndex = Math.max(0, index % Math.max(1, values.length - 1));
    const comparisonPair = [pairIndex, pairIndex + 1];
    const swappedIndices = [];

    if (previousValues) {
      values.forEach((value, idx) => {
        if (previousValues[idx] !== value) {
          swappedIndices.push(idx);
        }
      });
    }

    const passNumber = Math.floor(index / Math.max(1, values.length - 1)) + 1;
    const sortedCount = Math.min(Math.max(0, values.length - 1), passNumber);

    return { values, previousValues, comparisonPair, swappedIndices, passNumber, sortedCount };
  }

  function updateView() {
    const index = state.currentIndex;
    if (timeline && typeof timeline.updateSelection === 'function') {
      timeline.updateSelection(index);
    }
    const view = deriveView(index);
    const values = view.values;
    const maxHeight = Math.max(...values, 1);
    barsContainer.innerHTML = '';

    values.forEach((value, idx) => {
      const bar = document.createElement('div');
      bar.className = 'bubble-bar';
      const ratio = Math.max(0.16, (value / Math.max(maxHeight, maxValue)));
      bar.style.height = `${ratio * 100}%`;
      bar.style.setProperty('--bar-value', String(value));
      if (view.comparisonPair.includes(idx)) {
        bar.classList.add('comparison');
      }
      if (view.swappedIndices.includes(idx)) {
        bar.classList.add('swap');
      }
      if (idx >= values.length - view.sortedCount) {
        bar.classList.add('sorted');
      } else {
        bar.classList.add('unsorted');
      }
      const label = document.createElement('span');
      label.className = 'bubble-bar-label';
      label.textContent = value;
      bar.appendChild(label);
      barsContainer.appendChild(bar);
    });

    passEl.textContent = view.passNumber;
    comparisonEl.textContent = String(index + 1);
    swapEl.textContent = String(state.swaps);
    currentStepEl.textContent = `${index + 1} / ${steps.length}`;
    progressFill.style.width = `${((index + 1) / Math.max(steps.length, 1)) * 100}%`;
    timelineInput.value = String(index);
    timerEl.textContent = `${(state.elapsedMs / 1000).toFixed(1)}s`;
    const currentStep = index >= 0 && index < steps.length ? steps[index] : null;
    messageEl.textContent = currentStep?.message || 'Step completed';

    const explanationItems = Array.isArray(currentStep?.explanation) ? currentStep.explanation : [];
    explanationEl.innerHTML = explanationItems.length
      ? `<ul class="bubble-explanation-list">${explanationItems.map((item) => `<li>${item}</li>`).join('')}</ul>`
      : '<p>No explanation available.</p>';

    playButton.textContent = state.isPlaying ? 'Pause' : 'Play';
    analytics.update({
      elapsedMs: state.elapsedMs,
      comparisons: state.comparisons,
      swaps: state.swaps,
      currentPass: view.passNumber,
      currentStep: index + 1
    });
  }

  function updateStats() {
    state.comparisons = state.currentIndex + 1;
    const previousValues = state.currentIndex > 0 && Array.isArray(steps[state.currentIndex - 1]?.values) ? steps[state.currentIndex - 1].values : null;
    const currentValues = Array.isArray(steps[state.currentIndex]?.values) ? steps[state.currentIndex].values : [];
    if (previousValues) {
      const changes = currentValues.filter((value, idx) => previousValues[idx] !== value).length;
      state.swaps = changes > 0 ? state.swaps + 1 : state.swaps;
    }
    comparisonEl.textContent = String(state.comparisons);
    swapEl.textContent = String(state.swaps);
  }

  function setIndex(index) {
    state.currentIndex = clampIndex(index);
    updateStats();
    updateView();
  }

  function pause() {
    state.isPlaying = false;
    if (state.timer) {
      window.clearTimeout(state.timer);
      state.timer = null;
    }
    updateView();
  }

  function play() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    updateView();
    const tick = () => {
      if (!state.isPlaying) return;
      state.elapsedMs += 1000 / Math.max(state.speed, 0.25);
      state.comparisons = state.currentIndex + 1;
      if (state.currentIndex >= steps.length - 1) {
        pause();
        return;
      }
      state.currentIndex += 1;
      updateStats();
      updateView();
      state.timer = window.setTimeout(tick, 800 / Math.max(state.speed, 0.25));
    };
    state.timer = window.setTimeout(tick, 800 / Math.max(state.speed, 0.25));
  }

  function replay() {
    pause();
    state.currentIndex = 0;
    state.elapsedMs = 0;
    state.comparisons = 0;
    state.swaps = 0;
    state.lastValues = initialValues.slice();
    updateView();
    play();
  }

  playButton.addEventListener('click', () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  });

  replayButton.addEventListener('click', replay);
  prevButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex - 1);
  });
  nextButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex + 1);
  });

  timelineInput.addEventListener('input', (event) => {
    pause();
    setIndex(Number(event.target.value));
  });

  speedInput.addEventListener('input', (event) => {
    state.speed = Number(event.target.value);
    if (state.isPlaying) {
      pause();
      play();
    }
  });

  activeBubblePlayback = {
    stop: pause
  };

  setIndex(0);
}

function renderSortVisualizer(steps, complexity, algorithm) {
  if (activeSortPlayback && typeof activeSortPlayback.stop === 'function') {
    activeSortPlayback.stop();
  }

  const initialValues = Array.isArray(steps[0]?.values) ? steps[0].values : [];
  const state = {
    steps,
    currentIndex: 0,
    isPlaying: false,
    speed: 1,
    timer: null,
    elapsedMs: 0,
    comparisons: 0,
    swaps: 0,
    algorithm
  };

  const recursionTitle = algorithm === 'quick-sort'
    ? 'Quick Sort Recursion'
    : algorithm === 'merge-sort'
      ? 'Merge Sort Progress'
      : 'Algorithm Progress';
  const recursionSubtitle = algorithm === 'quick-sort'
    ? 'Active range + pivot'
    : algorithm === 'merge-sort'
      ? 'Active merge range'
      : 'Progress details';

  const wrapper = document.createElement('div');
  wrapper.className = 'bubble-visualizer';
  wrapper.innerHTML = `
    <div class="bubble-summary-grid">
      <div class="metric-card">
        <span class="metric-label">Algorithm</span>
        <strong>${algorithm.replace('-', ' ').toUpperCase()}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Comparisons</span>
        <strong data-role="comparisons">0</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Swaps</span>
        <strong data-role="swaps">0</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Complexity</span>
        <strong>${complexity}</strong>
      </div>
    </div>
    <div class="bubble-controls">
      <div class="bubble-buttons">
        <button class="primary-btn" type="button" data-action="play">Play</button>
        <button class="secondary-btn" type="button" data-action="replay">Replay</button>
        <button class="secondary-btn" type="button" data-action="prev">Previous Step</button>
        <button class="secondary-btn" type="button" data-action="next">Next Step</button>
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="sort-timeline">Timeline</label>
        <input class="bubble-timeline" id="sort-timeline" type="range" min="0" max="${Math.max(steps.length - 1, 0)}" value="0" />
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="sort-speed">Speed</label>
        <input class="bubble-speed" id="sort-speed" type="range" min="0.5" max="2.5" step="0.25" value="1" />
      </div>
    </div>
    <div class="bubble-stage bubble-sort-stage">
      <div class="bubble-panel-card bubble-array-panel">
        <div class="bubble-panel-header">
          <h4>Array</h4>
          <span class="metric-label">Live values</span>
        </div>
        <div class="bubble-bars" aria-label="Sort array bars"></div>
      </div>
      <div class="bubble-panel-card bubble-recursion-panel">
        <div class="bubble-panel-header">
          <h4>${recursionTitle}</h4>
          <span class="metric-label">${recursionSubtitle}</span>
        </div>
        <div class="bubble-recursion-info">
          <p class="bubble-message"></p>
          <p class="bubble-explanation"></p>
        </div>
        <div class="bubble-status-card bubble-status-compact">
          <p class="metric-label">Current step</p>
          <h3 data-role="current-step">1 / ${steps.length}</h3>
          <div class="bubble-progress-track">
            <div class="bubble-progress-fill"></div>
          </div>
          <div class="bubble-metrics">
            <span class="bubble-pill">Timer <strong data-role="timer">0.0s</strong></span>
            <span class="bubble-pill">Total steps <strong>${steps.length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  `;

  results.innerHTML = '';
  results.appendChild(wrapper);

  const timeline = attachTimeline(steps, (nextIndex) => {
    setIndex(nextIndex);
  }, state.currentIndex);
  wrapper.appendChild(timeline);

  const analytics = attachAnalyticsPanel(wrapper, {
    algorithm,
    operation: 'sort',
    steps,
    elapsedMs: state.elapsedMs,
    comparisons: state.comparisons,
    swaps: state.swaps,
    currentPass: 1,
    currentStep: 1
  });

  const comparisonEl = wrapper.querySelector('[data-role="comparisons"]');
  const swapEl = wrapper.querySelector('[data-role="swaps"]');
  const currentStepEl = wrapper.querySelector('[data-role="current-step"]');
  const timerEl = wrapper.querySelector('[data-role="timer"]');
  const messageEl = wrapper.querySelector('.bubble-message');
  const explanationEl = wrapper.querySelector('.bubble-explanation');
  const barsContainer = wrapper.querySelector('.bubble-bars');
  const progressFill = wrapper.querySelector('.bubble-progress-fill');
  const timelineInput = wrapper.querySelector('#sort-timeline');
  const speedInput = wrapper.querySelector('#sort-speed');
  const playButton = wrapper.querySelector('[data-action="play"]');
  const replayButton = wrapper.querySelector('[data-action="replay"]');
  const prevButton = wrapper.querySelector('[data-action="prev"]');
  const nextButton = wrapper.querySelector('[data-action="next"]');

  function clampIndex(index) {
    return Math.max(0, Math.min(steps.length - 1, index));
  }

  function deriveView(index) {
    const values = Array.isArray(steps[index]?.values) ? steps[index].values : [];
    const previousValues = index > 0 && Array.isArray(steps[index - 1]?.values) ? steps[index - 1].values : null;
    const changedIndices = [];
    if (previousValues) {
      values.forEach((value, idx) => {
        if (previousValues[idx] != value) {
          changedIndices.push(idx);
        }
      });
    }
    return { values, changedIndices, step: steps[index] || {} };
  }

  function updateView() {
    const index = state.currentIndex;
    if (timeline && typeof timeline.updateSelection === 'function') {
      timeline.updateSelection(index);
    }
    const view = deriveView(index);
    const values = view.values;
    const currentStep = view.step;
    const maxValue = Math.max(...values, 1);
    barsContainer.innerHTML = '';

    values.forEach((value, idx) => {
      const bar = document.createElement('div');
      bar.className = 'bubble-bar';
      const ratio = Math.max(0.16, (value / Math.max(maxValue, 1)));
      bar.style.height = `${ratio * 100}%`;
      if (view.changedIndices.includes(idx)) {
        bar.classList.add('swap');
      }
      if (['quick-sort', 'merge-sort'].includes(algorithm) && view.step.low >= 0 && view.step.high >= 0 && idx >= view.step.low && idx <= view.step.high) {
        bar.classList.add('active-range');
      }
      if (algorithm === 'quick-sort' && view.step.pivot >= 0 && idx === view.step.pivot) {
        bar.classList.add('pivot');
      }
      const label = document.createElement('span');
      label.className = 'bubble-bar-label';
      label.textContent = value;
      bar.appendChild(label);
      barsContainer.appendChild(bar);
    });

    comparisonEl.textContent = String(index + 1);
    swapEl.textContent = String(state.swaps);
    currentStepEl.textContent = `${index + 1} / ${steps.length}`;
    progressFill.style.width = `${((index + 1) / Math.max(steps.length, 1)) * 100}%`;
    timelineInput.value = String(index);
    timerEl.textContent = `${(state.elapsedMs / 1000).toFixed(1)}s`;
    messageEl.textContent = currentStep?.message || 'Sorting in progress';
    const explanationItems = Array.isArray(currentStep?.explanation) ? currentStep.explanation : [];
    explanationEl.innerHTML = explanationItems.length
      ? `<ul class="bubble-explanation-list">${explanationItems.map((item) => `<li>${item}</li>`).join('')}</ul>`
      : '<p>No explanation available.</p>';
    playButton.textContent = state.isPlaying ? 'Pause' : 'Play';
    analytics.update({
      elapsedMs: state.elapsedMs,
      comparisons: state.comparisons,
      swaps: state.swaps,
      currentPass: index + 1,
      currentStep: index + 1
    });
  }

  function updateStats() {
    const previousValues = state.currentIndex > 0 && Array.isArray(steps[state.currentIndex - 1]?.values)
      ? steps[state.currentIndex - 1].values
      : null;
    const currentValues = Array.isArray(steps[state.currentIndex]?.values) ? steps[state.currentIndex].values : [];
    if (previousValues) {
      const changes = currentValues.reduce((count, value, idx) => count + (previousValues[idx] !== value ? 1 : 0), 0);
      state.swaps += changes > 0 ? 1 : 0;
    }
  }

  function setIndex(index) {
    state.currentIndex = clampIndex(index);
    state.comparisons = state.currentIndex + 1;
    updateStats();
    updateView();
  }

  function pause() {
    state.isPlaying = false;
    if (state.timer) {
      window.clearTimeout(state.timer);
      state.timer = null;
    }
    updateView();
  }

  function play() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    updateView();
    const tick = () => {
      if (!state.isPlaying) return;
      state.elapsedMs += 1000 / Math.max(state.speed, 0.25);
      if (state.currentIndex >= steps.length - 1) {
        pause();
        return;
      }
      state.currentIndex += 1;
      updateStats();
      updateView();
      state.timer = window.setTimeout(tick, 850 / Math.max(state.speed, 0.25));
    };
    state.timer = window.setTimeout(tick, 850 / Math.max(state.speed, 0.25));
  }

  function replay() {
    pause();
    state.currentIndex = 0;
    state.elapsedMs = 0;
    state.comparisons = 0;
    state.swaps = 0;
    updateView();
    play();
  }

  playButton.addEventListener('click', () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  });

  replayButton.addEventListener('click', replay);
  prevButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex - 1);
  });
  nextButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex + 1);
  });

  timelineInput.addEventListener('input', (event) => {
    pause();
    setIndex(Number(event.target.value));
  });

  speedInput.addEventListener('input', (event) => {
    state.speed = Number(event.target.value);
    if (state.isPlaying) {
      pause();
      play();
    }
  });

  activeSortPlayback = {
    stop: pause
  };

  setIndex(0);
}

function renderLinearSearchVisualizer(steps, complexity, targetInput) {
  if (activeLinearPlayback && typeof activeLinearPlayback.stop === 'function') {
    activeLinearPlayback.stop();
  }

  const values = Array.isArray(steps[0]?.values) ? steps[0].values : [];
  const target = Number(targetInput);
  const state = {
    steps,
    values,
    currentIndex: 0,
    isPlaying: false,
    speed: 1,
    timer: null,
    elapsedMs: 0,
    comparisons: 0,
    target
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'bubble-visualizer';
  wrapper.innerHTML = `
    <div class="bubble-summary-grid">
      <div class="metric-card">
        <span class="metric-label">Search</span>
        <strong>Linear Search</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Comparisons</span>
        <strong data-role="comparisons">0</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Target</span>
        <strong>${Number.isNaN(target) ? '—' : target}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Complexity</span>
        <strong>${complexity}</strong>
      </div>
    </div>
    <div class="bubble-controls">
      <div class="bubble-buttons">
        <button class="primary-btn" type="button" data-action="play">Play</button>
        <button class="secondary-btn" type="button" data-action="replay">Replay</button>
        <button class="secondary-btn" type="button" data-action="prev">Previous Step</button>
        <button class="secondary-btn" type="button" data-action="next">Next Step</button>
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="search-timeline">Timeline</label>
        <input class="bubble-timeline" id="search-timeline" type="range" min="0" max="${Math.max(steps.length - 1, 0)}" value="0" />
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="search-speed">Speed</label>
        <input class="bubble-speed" id="search-speed" type="range" min="0.5" max="2.5" step="0.25" value="1" />
      </div>
    </div>
    <div class="bubble-stage">
      <div class="bubble-bars" aria-label="Search array bars"></div>
      <div class="bubble-status-card">
        <p class="metric-label">Current step</p>
        <h3 data-role="current-step">1 / ${steps.length}</h3>
        <p class="bubble-message"></p>
        <p class="bubble-explanation"></p>
        <div class="bubble-progress-track">
          <div class="bubble-progress-fill"></div>
        </div>
        <div class="bubble-metrics">
          <span class="bubble-pill">Timer <strong data-role="timer">0.0s</strong></span>
          <span class="bubble-pill">Total steps <strong>${steps.length}</strong></span>
        </div>
      </div>
    </div>
  `;

  results.innerHTML = '';
  results.appendChild(wrapper);

  const timeline = attachTimeline(steps, (nextIndex) => {
    setIndex(nextIndex);
  }, state.currentIndex);
  wrapper.appendChild(timeline);

  const analytics = attachAnalyticsPanel(wrapper, {
    algorithm: 'linear-search',
    operation: 'search',
    steps,
    elapsedMs: state.elapsedMs,
    comparisons: state.comparisons,
    swaps: 0,
    currentPass: 1,
    currentStep: 1
  });

  const comparisonEl = wrapper.querySelector('[data-role="comparisons"]');
  const currentStepEl = wrapper.querySelector('[data-role="current-step"]');
  const timerEl = wrapper.querySelector('[data-role="timer"]');
  const messageEl = wrapper.querySelector('.bubble-message');
  const explanationEl = wrapper.querySelector('.bubble-explanation');
  const barsContainer = wrapper.querySelector('.bubble-bars');
  const progressFill = wrapper.querySelector('.bubble-progress-fill');
  const timelineInput = wrapper.querySelector('#search-timeline');
  const speedInput = wrapper.querySelector('#search-speed');
  const playButton = wrapper.querySelector('[data-action="play"]');
  const replayButton = wrapper.querySelector('[data-action="replay"]');
  const prevButton = wrapper.querySelector('[data-action="prev"]');
  const nextButton = wrapper.querySelector('[data-action="next"]');

  function clampIndex(index) {
    return Math.max(0, Math.min(steps.length - 1, index));
  }

  function updateView() {
    const index = state.currentIndex;
    if (timeline && typeof timeline.updateSelection === 'function') {
      timeline.updateSelection(index);
    }
    const values = state.values;
    const maxValue = Math.max(...values, 1);
    barsContainer.innerHTML = '';

    values.forEach((value, idx) => {
      const bar = document.createElement('div');
      bar.className = 'bubble-bar';
      const ratio = Math.max(0.16, (value / Math.max(maxValue, 1)));
      bar.style.height = `${ratio * 100}%`;
      if (idx === index) {
        bar.classList.add('comparison');
      }
      if (steps[index]?.message === 'Target found' && idx === index) {
        bar.classList.add('swap');
      }
      const label = document.createElement('span');
      label.className = 'bubble-bar-label';
      label.textContent = value;
      bar.appendChild(label);
      barsContainer.appendChild(bar);
    });

    comparisonEl.textContent = String(index + 1);
    currentStepEl.textContent = `${index + 1} / ${steps.length}`;
    progressFill.style.width = `${((index + 1) / Math.max(steps.length, 1)) * 100}%`;
    timelineInput.value = String(index);
    timerEl.textContent = `${(state.elapsedMs / 1000).toFixed(1)}s`;
    const currentStep = steps[index] || null;
    messageEl.textContent = currentStep?.message || 'Searching...';
    const explanationItems = Array.isArray(currentStep?.explanation) ? currentStep.explanation : [];
    explanationEl.innerHTML = explanationItems.length
      ? `<ul class="bubble-explanation-list">${explanationItems.map((item) => `<li>${item}</li>`).join('')}</ul>`
      : '<p>No explanation available.</p>';
    playButton.textContent = state.isPlaying ? 'Pause' : 'Play';
    analytics.update({
      elapsedMs: state.elapsedMs,
      comparisons: state.currentIndex + 1,
      swaps: 0,
      currentPass: state.currentIndex + 1,
      currentStep: index + 1
    });
  }

  function setIndex(index) {
    state.currentIndex = clampIndex(index);
    updateView();
  }

  function pause() {
    state.isPlaying = false;
    if (state.timer) {
      window.clearTimeout(state.timer);
      state.timer = null;
    }
    updateView();
  }

  function play() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    updateView();
    const tick = () => {
      if (!state.isPlaying) return;
      state.elapsedMs += 1000 / Math.max(state.speed, 0.25);
      if (state.currentIndex >= steps.length - 1) {
        pause();
        return;
      }
      state.currentIndex += 1;
      updateView();
      state.timer = window.setTimeout(tick, 850 / Math.max(state.speed, 0.25));
    };
    state.timer = window.setTimeout(tick, 850 / Math.max(state.speed, 0.25));
  }

  function replay() {
    pause();
    state.currentIndex = 0;
    state.elapsedMs = 0;
    updateView();
    play();
  }

  playButton.addEventListener('click', () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  });

  replayButton.addEventListener('click', replay);
  prevButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex - 1);
  });
  nextButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex + 1);
  });

  timelineInput.addEventListener('input', (event) => {
    pause();
    setIndex(Number(event.target.value));
  });

  speedInput.addEventListener('input', (event) => {
    state.speed = Number(event.target.value);
    if (state.isPlaying) {
      pause();
      play();
    }
  });

  activeLinearPlayback = {
    stop: pause
  };

  setIndex(0);
}

function renderBinarySearchVisualizer(steps, complexity, valuesInput, targetInput) {
  if (activeBinaryPlayback && typeof activeBinaryPlayback.stop === 'function') {
    activeBinaryPlayback.stop();
  }

  const parsedValues = valuesInput
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item));
  const values = parsedValues.length > 0 ? parsedValues : Array.isArray(steps[0]?.values) ? steps[0].values : [];
  const target = Number(targetInput);

  const derivedStates = [];
  let low = 0;
  let high = Math.max(values.length - 1, 0);
  let currentIndex = 0;

  while (currentIndex < Math.max(steps.length, 1)) {
    const mid = low > high ? -1 : Math.floor((low + high) / 2);
    const activeRange = [low, high];
    const discardedIndices = [];

    values.forEach((value, idx) => {
      if (idx < Math.min(...activeRange) || idx > Math.max(...activeRange)) {
        discardedIndices.push(idx);
      }
    });

    derivedStates.push({
      low,
      high,
      mid,
      found: mid >= 0 && values[mid] === target,
      discardedIndices,
      activeRange
    });

    if (mid < 0 || values[mid] === target) {
      break;
    }

    if (target < values[mid]) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }

    currentIndex += 1;
  }

  if (derivedStates.length < Math.max(steps.length, 1)) {
    const lastState = derivedStates[derivedStates.length - 1] || { low: 0, high: Math.max(values.length - 1, 0), mid: -1, found: false, discardedIndices: [], activeRange: [0, Math.max(values.length - 1, 0)] };
    derivedStates.push({
      ...lastState,
      found: true,
      mid: lastState.mid >= 0 ? lastState.mid : 0
    });
  }

  const state = {
    steps,
    values,
    derivedStates,
    currentIndex: 0,
    isPlaying: false,
    speed: 1,
    timer: null,
    elapsedMs: 0,
    comparisons: 0,
    target
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'binary-visualizer';
  wrapper.innerHTML = `
    <div class="binary-summary-grid">
      <div class="metric-card">
        <span class="metric-label">Comparisons</span>
        <strong data-role="comparisons">0</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Low Pointer</span>
        <strong data-role="low">0</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Mid Pointer</span>
        <strong data-role="mid">0</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">High Pointer</span>
        <strong data-role="high">0</strong>
      </div>
    </div>
    <div class="binary-controls">
      <div class="bubble-buttons">
        <button class="primary-btn" type="button" data-action="play">Play</button>
        <button class="secondary-btn" type="button" data-action="replay">Replay</button>
        <button class="secondary-btn" type="button" data-action="prev">Previous Step</button>
        <button class="secondary-btn" type="button" data-action="next">Next Step</button>
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="binary-timeline">Timeline</label>
        <input class="bubble-timeline" id="binary-timeline" type="range" min="0" max="${Math.max(derivedStates.length - 1, 0)}" value="0" />
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="binary-speed">Speed</label>
        <input class="bubble-speed" id="binary-speed" type="range" min="0.5" max="2.5" step="0.25" value="1" />
      </div>
    </div>
    <div class="binary-legend">
      <span class="binary-legend-chip search">Current Search Space</span>
      <span class="binary-legend-chip discarded">Discarded Region</span>
      <span class="binary-legend-chip low">Low Pointer</span>
      <span class="binary-legend-chip mid">Mid Pointer</span>
      <span class="binary-legend-chip high">High Pointer</span>
    </div>
    <div class="binary-stage">
      <div class="binary-array-panel">
        <div class="binary-array-track" aria-label="Binary search array track"></div>
        <div class="binary-range-track">
          <div class="binary-range-fill"></div>
          <div class="binary-range-marker low"></div>
          <div class="binary-range-marker mid"></div>
          <div class="binary-range-marker high"></div>
        </div>
      </div>
      <div class="binary-status-card">
        <p class="metric-label">Current step</p>
        <h3 data-role="current-step">1 / ${derivedStates.length}</h3>
        <p class="binary-message"></p>
        <p class="binary-explanation"></p>
        <div class="binary-progress-track">
          <div class="binary-progress-fill"></div>
        </div>
        <div class="binary-metrics">
          <span class="bubble-pill">Timer <strong data-role="timer">0.0s</strong></span>
          <span class="bubble-pill">Target <strong>${Number.isNaN(target) ? '—' : target}</strong></span>
        </div>
      </div>
    </div>
  `;

  results.innerHTML = '';
  results.appendChild(wrapper);

  const timeline = attachTimeline(steps, (nextIndex) => {
    setIndex(nextIndex);
  }, state.currentIndex);
  wrapper.appendChild(timeline);

  const analytics = attachAnalyticsPanel(wrapper, {
    algorithm: 'binary-search',
    operation: 'search',
    steps,
    elapsedMs: state.elapsedMs,
    comparisons: state.comparisons,
    swaps: 0,
    currentPass: 1,
    currentStep: 1
  });

  const comparisonEl = wrapper.querySelector('[data-role="comparisons"]');
  const lowEl = wrapper.querySelector('[data-role="low"]');
  const midEl = wrapper.querySelector('[data-role="mid"]');
  const highEl = wrapper.querySelector('[data-role="high"]');
  const currentStepEl = wrapper.querySelector('[data-role="current-step"]');
  const timerEl = wrapper.querySelector('[data-role="timer"]');
  const messageEl = wrapper.querySelector('.binary-message');
  const explanationEl = wrapper.querySelector('.binary-explanation');
  const arrayTrack = wrapper.querySelector('.binary-array-track');
  const rangeFill = wrapper.querySelector('.binary-range-fill');
  const lowMarker = wrapper.querySelector('.binary-range-marker.low');
  const midMarker = wrapper.querySelector('.binary-range-marker.mid');
  const highMarker = wrapper.querySelector('.binary-range-marker.high');
  const progressFill = wrapper.querySelector('.binary-progress-fill');
  const timelineInput = wrapper.querySelector('#binary-timeline');
  const speedInput = wrapper.querySelector('#binary-speed');
  const playButton = wrapper.querySelector('[data-action="play"]');
  const replayButton = wrapper.querySelector('[data-action="replay"]');
  const prevButton = wrapper.querySelector('[data-action="prev"]');
  const nextButton = wrapper.querySelector('[data-action="next"]');

  function clampIndex(index) {
    return Math.max(0, Math.min(derivedStates.length - 1, index));
  }

  function updateView() {
    const activeState = derivedStates[state.currentIndex] || derivedStates[0];
    if (timeline && typeof timeline.updateSelection === 'function') {
      timeline.updateSelection(state.currentIndex);
    }
    const total = Math.max(derivedStates.length, 1);
    const activeValues = state.values;
    const maxValue = Math.max(...activeValues, 1);
    const activeRangeStart = Math.min(activeState.low, activeState.high);
    const activeRangeEnd = Math.max(activeState.low, activeState.high);
    const activeWidth = activeRangeEnd - activeRangeStart + 1;

    arrayTrack.innerHTML = '';
    activeValues.forEach((value, idx) => {
      const cell = document.createElement('div');
      cell.className = 'binary-cell';
      if (idx >= activeRangeStart && idx <= activeRangeEnd) {
        cell.classList.add('search-space');
      } else {
        cell.classList.add('discarded');
      }
      if (idx === activeState.low) cell.classList.add('low');
      if (idx === activeState.mid) cell.classList.add('mid');
      if (idx === activeState.high) cell.classList.add('high');
      if (activeState.found && idx === activeState.mid) cell.classList.add('found');
      cell.style.setProperty('--bar-height', `${Math.max(20, (value / Math.max(maxValue, 1)) * 100)}%`);
      cell.innerHTML = `
        <span class="binary-cell-index">${idx}</span>
        <strong>${value}</strong>
        <span class="binary-cell-markers">
          ${idx === activeState.low ? 'L' : ''}
          ${idx === activeState.mid ? 'M' : ''}
          ${idx === activeState.high ? 'H' : ''}
        </span>
      `;
      arrayTrack.appendChild(cell);
    });

    const trackLength = Math.max(activeValues.length - 1, 1);
    const startPercent = activeRangeStart / trackLength * 100;
    const endPercent = activeRangeEnd / trackLength * 100;
    rangeFill.style.left = `${startPercent}%`;
    rangeFill.style.width = `${Math.max(8, endPercent - startPercent)}%`;
    lowMarker.style.left = `${(activeState.low / Math.max(trackLength, 1)) * 100}%`;
    midMarker.style.left = `${(activeState.mid / Math.max(trackLength, 1)) * 100}%`;
    highMarker.style.left = `${(activeState.high / Math.max(trackLength, 1)) * 100}%`;

    comparisonEl.textContent = String(state.currentIndex + 1);
    lowEl.textContent = String(activeState.low);
    midEl.textContent = activeState.mid >= 0 ? String(activeState.mid) : '—';
    highEl.textContent = String(activeState.high);
    currentStepEl.textContent = `${state.currentIndex + 1} / ${total}`;
    progressFill.style.width = `${((state.currentIndex + 1) / Math.max(total, 1)) * 100}%`;
    timelineInput.value = String(state.currentIndex);
    timerEl.textContent = `${(state.elapsedMs / 1000).toFixed(1)}s`;
    const currentStep = state.currentIndex >= 0 && state.currentIndex < steps.length ? steps[state.currentIndex] : null;
    messageEl.textContent = currentStep?.message || 'Search in progress';
    const explanationItems = Array.isArray(currentStep?.explanation) ? currentStep.explanation : [];
    explanationEl.innerHTML = explanationItems.length
      ? `<ul class="bubble-explanation-list">${explanationItems.map((item) => `<li>${item}</li>`).join('')}</ul>`
      : '<p>No explanation available.</p>';
    playButton.textContent = state.isPlaying ? 'Pause' : 'Play';
    analytics.update({
      elapsedMs: state.elapsedMs,
      comparisons: state.currentIndex + 1,
      swaps: 0,
      currentPass: state.currentIndex + 1,
      currentStep: state.currentIndex + 1
    });
  }

  function setIndex(index) {
    state.currentIndex = clampIndex(index);
    state.comparisons = state.currentIndex + 1;
    updateView();
  }

  function pause() {
    state.isPlaying = false;
    if (state.timer) {
      window.clearTimeout(state.timer);
      state.timer = null;
    }
    updateView();
  }

  function play() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    updateView();
    const tick = () => {
      if (!state.isPlaying) return;
      state.elapsedMs += 1000 / Math.max(state.speed, 0.25);
      state.comparisons = state.currentIndex + 1;
      if (state.currentIndex >= derivedStates.length - 1) {
        pause();
        return;
      }
      state.currentIndex += 1;
      updateView();
      state.timer = window.setTimeout(tick, 750 / Math.max(state.speed, 0.25));
    };
    state.timer = window.setTimeout(tick, 750 / Math.max(state.speed, 0.25));
  }

  function replay() {
    pause();
    state.currentIndex = 0;
    state.elapsedMs = 0;
    state.comparisons = 0;
    updateView();
    play();
  }

  playButton.addEventListener('click', () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  });

  replayButton.addEventListener('click', replay);
  prevButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex - 1);
  });
  nextButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex + 1);
  });

  timelineInput.addEventListener('input', (event) => {
    pause();
    setIndex(Number(event.target.value));
  });

  speedInput.addEventListener('input', (event) => {
    state.speed = Number(event.target.value);
    if (state.isPlaying) {
      pause();
      play();
    }
  });

  activeBinaryPlayback = {
    stop: pause
  };

  setIndex(0);
}

function renderStackVisualizer(steps, complexity, operation) {
  const initialValues = Array.isArray(steps[0]?.values) ? steps[0].values : [];
  const memorySize = Math.max(6, initialValues.length + 2);
  const state = {
    steps,
    currentIndex: 0,
    isPlaying: false,
    speed: 1,
    timer: null,
    elapsedMs: 0,
    comparisons: 0,
    operation: operation || 'push',
    memorySize
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'stack-visualizer';
  wrapper.innerHTML = `
    <div class="stack-summary-grid">
      <div class="metric-card">
        <span class="metric-label">Operation</span>
        <strong data-role="operation">${state.operation}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Top Pointer</span>
        <strong data-role="top-index">-</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Size</span>
        <strong data-role="size">0</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Complexity</span>
        <strong>${complexity}</strong>
      </div>
    </div>
    <div class="stack-controls">
      <div class="bubble-buttons">
        <button class="primary-btn" type="button" data-action="play">Play</button>
        <button class="secondary-btn" type="button" data-action="replay">Replay</button>
        <button class="secondary-btn" type="button" data-action="prev">Previous Step</button>
        <button class="secondary-btn" type="button" data-action="next">Next Step</button>
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="stack-timeline">Timeline</label>
        <input class="bubble-timeline" id="stack-timeline" type="range" min="0" max="${Math.max(steps.length - 1, 0)}" value="0" />
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="stack-speed">Speed</label>
        <input class="bubble-speed" id="stack-speed" type="range" min="0.5" max="2.5" step="0.25" value="1" />
      </div>
    </div>
    <div class="stack-stage">
      <div class="stack-memory-card">
        <div class="stack-frame">
          <div class="stack-top-indicator">TOP</div>
          <div class="stack-slots"></div>
        </div>
      </div>
      <div class="stack-status-card">
        <p class="metric-label">Current step</p>
        <h3 data-role="current-step">1 / ${steps.length}</h3>
        <p class="stack-message"></p>
        <p class="stack-explanation"></p>
        <div class="stack-progress-track">
          <div class="stack-progress-fill"></div>
        </div>
        <div class="stack-metrics">
          <span class="bubble-pill">Timer <strong data-role="timer">0.0s</strong></span>
          <span class="bubble-pill">Capacity <strong>${memorySize}</strong></span>
        </div>
      </div>
    </div>
  `;

  results.innerHTML = '';
  results.appendChild(wrapper);

  const timeline = attachTimeline(steps, (nextIndex) => {
    setIndex(nextIndex);
  }, state.currentIndex);
  wrapper.appendChild(timeline);

  const analytics = attachAnalyticsPanel(wrapper, {
    algorithm: 'stack',
    operation: state.operation,
    steps,
    elapsedMs: state.elapsedMs,
    comparisons: state.comparisons,
    swaps: 0,
    currentPass: 1,
    currentStep: 1
  });

  const operationEl = wrapper.querySelector('[data-role="operation"]');
  const topIndexEl = wrapper.querySelector('[data-role="top-index"]');
  const sizeEl = wrapper.querySelector('[data-role="size"]');
  const currentStepEl = wrapper.querySelector('[data-role="current-step"]');
  const timerEl = wrapper.querySelector('[data-role="timer"]');
  const messageEl = wrapper.querySelector('.stack-message');
  const explanationEl = wrapper.querySelector('.stack-explanation');
  const slotsContainer = wrapper.querySelector('.stack-slots');
  const progressFill = wrapper.querySelector('.stack-progress-fill');
  const timelineInput = wrapper.querySelector('#stack-timeline');
  const speedInput = wrapper.querySelector('#stack-speed');
  const playButton = wrapper.querySelector('[data-action="play"]');
  const replayButton = wrapper.querySelector('[data-action="replay"]');
  const prevButton = wrapper.querySelector('[data-action="prev"]');
  const nextButton = wrapper.querySelector('[data-action="next"]');

  function clampIndex(index) {
    return Math.max(0, Math.min(steps.length - 1, index));
  }

  function deriveStep(index) {
    const values = Array.isArray(steps[index]?.values) ? steps[index].values : [];
    const previousValues = index > 0 && Array.isArray(steps[index - 1]?.values) ? steps[index - 1].values : [];
    const topIndex = values.length > 0 ? values.length - 1 : previousValues.length > 0 ? previousValues.length - 1 : -1;
    const action = state.operation === 'pop'
      ? 'pop'
      : state.operation === 'peek'
        ? 'peek'
        : 'push';
    const isOverflow = action === 'push' && values.length >= memorySize;
    const isUnderflow = (action === 'pop' || action === 'peek') && values.length === 0;
    return { values, previousValues, topIndex, action, isOverflow, isUnderflow };
  }

  function updateView() {
    const index = state.currentIndex;
    if (timeline && typeof timeline.updateSelection === 'function') {
      timeline.updateSelection(index);
    }
    const step = deriveStep(index);
    const values = step.values;
    const total = Math.max(steps.length, 1);
    slotsContainer.innerHTML = '';

    for (let slotIndex = 0; slotIndex < state.memorySize; slotIndex += 1) {
      const cell = document.createElement('div');
      cell.className = 'stack-slot';
      const value = values[slotIndex];
      if (typeof value !== 'undefined') {
        cell.classList.add('filled');
        cell.innerHTML = `<span class="stack-value">${value}</span>`;
      } else {
        cell.innerHTML = '<span class="stack-empty">empty</span>';
      }
      if (slotIndex === step.topIndex) {
        cell.classList.add('top');
      }
      if (step.action === 'push' && slotIndex === values.length - 1 && values.length > 0) {
        cell.classList.add('highlight');
      }
      if (step.action === 'pop' && slotIndex === Math.max(values.length, 0)) {
        cell.classList.add('remove');
      }
      if (step.action === 'peek' && slotIndex === step.topIndex) {
        cell.classList.add('peek');
      }
      if (step.isOverflow) {
        cell.classList.add('overflow');
      }
      if (step.isUnderflow) {
        cell.classList.add('underflow');
      }
      slotsContainer.appendChild(cell);
    }

    operationEl.textContent = state.operation;
    topIndexEl.textContent = step.topIndex >= 0 ? String(step.topIndex) : '—';
    sizeEl.textContent = String(values.length);
    currentStepEl.textContent = `${index + 1} / ${total}`;
    progressFill.style.width = `${((index + 1) / Math.max(total, 1)) * 100}%`;
    timelineInput.value = String(index);
    timerEl.textContent = `${(state.elapsedMs / 1000).toFixed(1)}s`;
    const currentStep = index >= 0 && index < steps.length ? steps[index] : null;
    messageEl.textContent = currentStep?.message || 'Stack ready';
    const explanationItems = Array.isArray(currentStep?.explanation) ? currentStep.explanation : [];
    explanationEl.innerHTML = explanationItems.length
      ? `<ul class="bubble-explanation-list">${explanationItems.map((item) => `<li>${item}</li>`).join('')}</ul>`
      : '<p>No explanation available.</p>';
    playButton.textContent = state.isPlaying ? 'Pause' : 'Play';
    analytics.update({
      elapsedMs: state.elapsedMs,
      comparisons: state.comparisons,
      swaps: 0,
      currentPass: index + 1,
      currentStep: index + 1
    });
  }

  function setIndex(index) {
    state.currentIndex = clampIndex(index);
    state.comparisons = state.currentIndex + 1;
    updateView();
  }

  function pause() {
    state.isPlaying = false;
    if (state.timer) {
      window.clearTimeout(state.timer);
      state.timer = null;
    }
    updateView();
  }

  function play() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    updateView();
    const tick = () => {
      if (!state.isPlaying) return;
      state.elapsedMs += 1000 / Math.max(state.speed, 0.25);
      state.comparisons = state.currentIndex + 1;
      if (state.currentIndex >= steps.length - 1) {
        pause();
        return;
      }
      state.currentIndex += 1;
      updateView();
      state.timer = window.setTimeout(tick, 750 / Math.max(state.speed, 0.25));
    };
    state.timer = window.setTimeout(tick, 750 / Math.max(state.speed, 0.25));
  }

  function replay() {
    pause();
    state.currentIndex = 0;
    state.elapsedMs = 0;
    state.comparisons = 0;
    updateView();
    play();
  }

  playButton.addEventListener('click', () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  });

  replayButton.addEventListener('click', replay);
  prevButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex - 1);
  });
  nextButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex + 1);
  });

  timelineInput.addEventListener('input', (event) => {
    pause();
    setIndex(Number(event.target.value));
  });

  speedInput.addEventListener('input', (event) => {
    state.speed = Number(event.target.value);
    if (state.isPlaying) {
      pause();
      play();
    }
  });

  setIndex(0);
}

function renderQueueVisualizer(steps, complexity, operation) {
  const initialValues = Array.isArray(steps[0]?.values) ? steps[0].values : [];
  const maxSize = Math.max(6, initialValues.length + 2);
  const state = {
    steps,
    currentIndex: 0,
    isPlaying: false,
    speed: 1,
    timer: null,
    elapsedMs: 0,
    comparisons: 0,
    operation: operation || 'enqueue',
    maxSize
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'queue-visualizer';
  wrapper.innerHTML = `
    <div class="queue-summary-grid">
      <div class="metric-card">
        <span class="metric-label">Operation</span>
        <strong data-role="operation">${state.operation}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Front Pointer</span>
        <strong data-role="front">-</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Rear Pointer</span>
        <strong data-role="rear">-</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Complexity</span>
        <strong>${complexity}</strong>
      </div>
    </div>
    <div class="queue-controls">
      <div class="bubble-buttons">
        <button class="primary-btn" type="button" data-action="play">Play</button>
        <button class="secondary-btn" type="button" data-action="replay">Replay</button>
        <button class="secondary-btn" type="button" data-action="prev">Previous Step</button>
        <button class="secondary-btn" type="button" data-action="next">Next Step</button>
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="queue-timeline">Timeline</label>
        <input class="bubble-timeline" id="queue-timeline" type="range" min="0" max="${Math.max(steps.length - 1, 0)}" value="0" />
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="queue-speed">Speed</label>
        <input class="bubble-speed" id="queue-speed" type="range" min="0.5" max="2.5" step="0.25" value="1" />
      </div>
    </div>
    <div class="queue-legend">
      <span class="binary-legend-chip search">Current Size</span>
      <span class="binary-legend-chip discarded">Maximum Size</span>
      <span class="binary-legend-chip low">Front</span>
      <span class="binary-legend-chip mid">Rear</span>
      <span class="binary-legend-chip enqueue">Enqueue</span>
      <span class="binary-legend-chip dequeue">Dequeue</span>
    </div>
    <div class="queue-stage">
      <div class="queue-canvas-card">
        <div class="queue-track"></div>
        <div class="queue-circular-card">
          <div class="queue-circular-ring"></div>
        </div>
      </div>
      <div class="queue-status-card">
        <p class="metric-label">Current step</p>
        <h3 data-role="current-step">1 / ${steps.length}</h3>
        <p class="queue-message"></p>
        <p class="queue-explanation"></p>
        <p class="queue-helper">Circular queue uses a fixed-size buffer and wraps the rear pointer when it reaches the end.</p>
        <div class="queue-progress-track">
          <div class="queue-progress-fill"></div>
        </div>
        <div class="queue-metrics">
          <span class="bubble-pill">Timer <strong data-role="timer">0.0s</strong></span>
          <span class="bubble-pill">Capacity <strong>${maxSize}</strong></span>
          <span class="bubble-pill">Size <strong data-role="size">0</strong></span>
        </div>
      </div>
    </div>
  `;

  results.innerHTML = '';
  results.appendChild(wrapper);

  const timeline = attachTimeline(steps, (nextIndex) => {
    setIndex(nextIndex);
  }, state.currentIndex);
  wrapper.appendChild(timeline);

  const analytics = attachAnalyticsPanel(wrapper, {
    algorithm: 'queue',
    operation: state.operation,
    steps,
    elapsedMs: state.elapsedMs,
    comparisons: state.comparisons,
    swaps: 0,
    currentPass: 1,
    currentStep: 1
  });

  const operationEl = wrapper.querySelector('[data-role="operation"]');
  const frontEl = wrapper.querySelector('[data-role="front"]');
  const rearEl = wrapper.querySelector('[data-role="rear"]');
  const sizeEl = wrapper.querySelector('[data-role="size"]');
  const currentStepEl = wrapper.querySelector('[data-role="current-step"]');
  const timerEl = wrapper.querySelector('[data-role="timer"]');
  const messageEl = wrapper.querySelector('.queue-message');
  const explanationEl = wrapper.querySelector('.queue-explanation');
  const track = wrapper.querySelector('.queue-track');
  const circularRing = wrapper.querySelector('.queue-circular-ring');
  const progressFill = wrapper.querySelector('.queue-progress-fill');
  const timelineInput = wrapper.querySelector('#queue-timeline');
  const speedInput = wrapper.querySelector('#queue-speed');
  const playButton = wrapper.querySelector('[data-action="play"]');
  const replayButton = wrapper.querySelector('[data-action="replay"]');
  const prevButton = wrapper.querySelector('[data-action="prev"]');
  const nextButton = wrapper.querySelector('[data-action="next"]');

  function clampIndex(index) {
    return Math.max(0, Math.min(steps.length - 1, index));
  }

  function deriveState(index) {
    const values = Array.isArray(steps[index]?.values) ? steps[index].values : [];
    const previousValues = index > 0 && Array.isArray(steps[index - 1]?.values) ? steps[index - 1].values : [];
    const size = values.length;
    const front = size > 0 ? 0 : previousValues.length > 0 ? 0 : -1;
    const rear = size > 0 ? size - 1 : previousValues.length > 0 ? previousValues.length - 1 : -1;
    const action = state.operation === 'dequeue' ? 'dequeue' : 'enqueue';
    const enqueueIndex = action === 'enqueue' && values.length > previousValues.length ? values.length - 1 : -1;
    const dequeueIndex = action === 'dequeue' && previousValues.length > values.length ? 0 : -1;
    const isFull = previousValues.length >= state.maxSize && action === 'enqueue';
    const isEmpty = size === 0;
    const isUnderflow = action === 'dequeue' && previousValues.length === 0;
    const nextRearIndex = action === 'enqueue' && !isFull
      ? (rear >= 0 ? (rear + 1) % state.maxSize : 0)
      : -1;
    return { values, previousValues, size, front, rear, action, enqueueIndex, dequeueIndex, isFull, isEmpty, isUnderflow, nextRearIndex };
  }

  function updateView() {
    const index = state.currentIndex;
    if (timeline && typeof timeline.updateSelection === 'function') {
      timeline.updateSelection(index);
    }
    const stepState = deriveState(index);
    const total = Math.max(steps.length, 1);

    track.style.setProperty('--queue-slots', state.maxSize);
    track.innerHTML = '';
    for (let slotIndex = 0; slotIndex < state.maxSize; slotIndex += 1) {
      const slot = document.createElement('div');
      slot.className = 'queue-slot';
      const value = stepState.values[slotIndex];
      const pointerLabel = slotIndex === stepState.front ? 'Front' : slotIndex === stepState.rear ? 'Rear' : '';
      if (typeof value !== 'undefined') {
        slot.classList.add('filled');
        slot.innerHTML = `<span class="queue-value">${value}</span>${pointerLabel ? `<span class="queue-pointer">${pointerLabel}</span>` : ''}`;
      } else {
        slot.innerHTML = `<span class="queue-empty">empty</span>${pointerLabel ? `<span class="queue-pointer">${pointerLabel}</span>` : ''}`;
      }
      if (slotIndex === stepState.front) slot.classList.add('front');
      if (slotIndex === stepState.rear) slot.classList.add('rear');
      if (stepState.action === 'enqueue' && slotIndex === stepState.enqueueIndex && stepState.enqueueIndex >= 0) slot.classList.add('enqueue');
      if (stepState.action === 'dequeue' && slotIndex === stepState.dequeueIndex && stepState.dequeueIndex >= 0) slot.classList.add('dequeue');
      if (stepState.action === 'dequeue' && stepState.dequeueIndex >= 0 && slotIndex > stepState.dequeueIndex && slot.classList.contains('filled')) slot.classList.add('shift');
      if (stepState.isFull) slot.classList.add('full');
      if (stepState.isUnderflow) slot.classList.add('underflow');
      track.appendChild(slot);
    }

    circularRing.innerHTML = '';
    for (let slotIndex = 0; slotIndex < state.maxSize; slotIndex += 1) {
      const node = document.createElement('div');
      node.className = 'queue-circular-node';
      const value = stepState.values[slotIndex];
      if (typeof value !== 'undefined') {
        node.textContent = value;
        node.classList.add('filled');
      }
      if (slotIndex === stepState.front) node.classList.add('front');
      if (slotIndex === stepState.rear) node.classList.add('rear');
      if (slotIndex === stepState.nextRearIndex && stepState.nextRearIndex >= 0) node.classList.add('next-rear');
      if (stepState.action === 'enqueue' && slotIndex === stepState.enqueueIndex && stepState.enqueueIndex >= 0) node.classList.add('enqueue');
      if (stepState.action === 'dequeue' && slotIndex === stepState.dequeueIndex && stepState.dequeueIndex >= 0) node.classList.add('dequeue');
      if (stepState.action === 'dequeue' && stepState.dequeueIndex >= 0 && slotIndex > stepState.dequeueIndex && node.classList.contains('filled')) node.classList.add('shift');
      const angle = (slotIndex / state.maxSize) * 360;
      node.style.transform = `rotate(${angle}deg) translate(108px) rotate(${-angle}deg)`;
      circularRing.appendChild(node);
    }

    operationEl.textContent = state.operation;
    frontEl.textContent = stepState.front >= 0 ? String(stepState.front) : '—';
    rearEl.textContent = stepState.rear >= 0 ? String(stepState.rear) : '—';
    sizeEl.textContent = String(stepState.size);
    currentStepEl.textContent = `${index + 1} / ${total}`;
    progressFill.style.width = `${((index + 1) / Math.max(total, 1)) * 100}%`;
    timelineInput.value = String(index);
    timerEl.textContent = `${(state.elapsedMs / 1000).toFixed(1)}s`;
    const currentStep = index >= 0 && index < steps.length ? steps[index] : null;
    let statusMessage = currentStep?.message || 'Queue ready';
    const explanationItems = Array.isArray(currentStep?.explanation) ? [...currentStep.explanation] : [];

    if (stepState.isFull) {
      statusMessage = 'Overflow: cannot enqueue because queue is at max capacity';
      explanationItems.unshift('The queue is full and cannot accept a new element until an existing element is dequeued.');
    }
    if (stepState.isUnderflow) {
      statusMessage = 'Underflow: cannot dequeue from an empty queue';
      explanationItems.unshift('The queue is empty, so there is no front element to remove.');
    }

    messageEl.textContent = statusMessage;
    explanationEl.innerHTML = explanationItems.length
      ? `<ul class="bubble-explanation-list">${explanationItems.map((item) => `<li>${item}</li>`).join('')}</ul>`
      : '<p>No explanation available.</p>';
    playButton.textContent = state.isPlaying ? 'Pause' : 'Play';
    analytics.update({
      elapsedMs: state.elapsedMs,
      comparisons: state.comparisons,
      swaps: 0,
      currentPass: index + 1,
      currentStep: index + 1
    });
  }

  function setIndex(index) {
    state.currentIndex = clampIndex(index);
    state.comparisons = state.currentIndex + 1;
    updateView();
  }

  function pause() {
    state.isPlaying = false;
    if (state.timer) {
      window.clearTimeout(state.timer);
      state.timer = null;
    }
    updateView();
  }

  function play() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    updateView();
    const tick = () => {
      if (!state.isPlaying) return;
      state.elapsedMs += 1000 / Math.max(state.speed, 0.25);
      state.comparisons = state.currentIndex + 1;
      if (state.currentIndex >= steps.length - 1) {
        pause();
        return;
      }
      state.currentIndex += 1;
      updateView();
      state.timer = window.setTimeout(tick, 750 / Math.max(state.speed, 0.25));
    };
    state.timer = window.setTimeout(tick, 750 / Math.max(state.speed, 0.25));
  }

  function replay() {
    pause();
    state.currentIndex = 0;
    state.elapsedMs = 0;
    state.comparisons = 0;
    updateView();
    play();
  }

  playButton.addEventListener('click', () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  });

  replayButton.addEventListener('click', replay);
  prevButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex - 1);
  });
  nextButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex + 1);
  });

  timelineInput.addEventListener('input', (event) => {
    pause();
    setIndex(Number(event.target.value));
  });

  speedInput.addEventListener('input', (event) => {
    state.speed = Number(event.target.value);
    if (state.isPlaying) {
      pause();
      play();
    }
  });

  setIndex(0);
}

function renderLinkedListVisualizer(steps, complexity, operation) {
  const state = {
    steps,
    currentIndex: 0,
    isPlaying: false,
    speed: 1,
    timer: null,
    elapsedMs: 0,
    comparisons: 0,
    operation: operation || 'insert'
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'linked-list-visualizer';
  wrapper.innerHTML = `
    <div class="linked-list-summary-grid">
      <div class="metric-card">
        <span class="metric-label">Operation</span>
        <strong data-role="operation">${state.operation}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Head</span>
        <strong data-role="head">0</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Tail</span>
        <strong data-role="tail">0</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Complexity</span>
        <strong>${complexity}</strong>
      </div>
    </div>
    <div class="linked-list-controls">
      <div class="bubble-buttons">
        <button class="primary-btn" type="button" data-action="play">Play</button>
        <button class="secondary-btn" type="button" data-action="replay">Replay</button>
        <button class="secondary-btn" type="button" data-action="prev">Previous Step</button>
        <button class="secondary-btn" type="button" data-action="next">Next Step</button>
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="linked-list-timeline">Timeline</label>
        <input class="bubble-timeline" id="linked-list-timeline" type="range" min="0" max="${Math.max(steps.length - 1, 0)}" value="0" />
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="linked-list-speed">Speed</label>
        <input class="bubble-speed" id="linked-list-speed" type="range" min="0.5" max="2.5" step="0.25" value="1" />
      </div>
    </div>
    <div class="linked-list-stage">
      <div class="linked-list-svg-card">
        <svg class="linked-list-svg" viewBox="0 0 720 260" role="img" aria-label="Linked list visualization"></svg>
      </div>
      <div class="linked-list-status-card">
        <p class="metric-label">Current step</p>
        <h3 data-role="current-step">1 / ${steps.length}</h3>
        <p class="linked-list-message"></p>
        <p class="linked-list-explanation"></p>
        <div class="linked-list-progress-track">
          <div class="linked-list-progress-fill"></div>
        </div>
        <div class="linked-list-metrics">
          <span class="bubble-pill">Timer <strong data-role="timer">0.0s</strong></span>
          <span class="bubble-pill">Nodes <strong data-role="count">0</strong></span>
        </div>
      </div>
    </div>
  `;

  results.innerHTML = '';
  results.appendChild(wrapper);

  const timeline = attachTimeline(steps, (nextIndex) => {
    setIndex(nextIndex);
  }, state.currentIndex);
  wrapper.appendChild(timeline);

  const analytics = attachAnalyticsPanel(wrapper, {
    algorithm: 'linked-list',
    operation: state.operation,
    steps,
    elapsedMs: state.elapsedMs,
    comparisons: state.comparisons,
    swaps: 0,
    currentPass: 1,
    currentStep: 1
  });

  const operationEl = wrapper.querySelector('[data-role="operation"]');
  const headEl = wrapper.querySelector('[data-role="head"]');
  const tailEl = wrapper.querySelector('[data-role="tail"]');
  const countEl = wrapper.querySelector('[data-role="count"]');
  const currentStepEl = wrapper.querySelector('[data-role="current-step"]');
  const timerEl = wrapper.querySelector('[data-role="timer"]');
  const messageEl = wrapper.querySelector('.linked-list-message');
  const explanationEl = wrapper.querySelector('.linked-list-explanation');
  const svg = wrapper.querySelector('.linked-list-svg');
  const progressFill = wrapper.querySelector('.linked-list-progress-fill');
  const timelineInput = wrapper.querySelector('#linked-list-timeline');
  const speedInput = wrapper.querySelector('#linked-list-speed');
  const playButton = wrapper.querySelector('[data-action="play"]');
  const replayButton = wrapper.querySelector('[data-action="replay"]');
  const prevButton = wrapper.querySelector('[data-action="prev"]');
  const nextButton = wrapper.querySelector('[data-action="next"]');

  function clampIndex(index) {
    return Math.max(0, Math.min(steps.length - 1, index));
  }

  function deriveState(index) {
    const values = Array.isArray(steps[index]?.values) ? steps[index].values : [];
    const action = state.operation === 'delete' ? 'delete' : state.operation === 'reverse' ? 'reverse' : 'insert';
    const head = values.length > 0 ? 0 : -1;
    const tail = values.length > 0 ? values.length - 1 : -1;
    return { values, action, head, tail };
  }

  function updateView() {
    const index = state.currentIndex;
    if (timeline && typeof timeline.updateSelection === 'function') {
      timeline.updateSelection(index);
    }
    const stepState = deriveState(index);
    const values = stepState.values;
    const total = Math.max(steps.length, 1);
    const width = 720;
    const height = 260;
    const nodeWidth = 84;
    const nodeHeight = 56;
    const gap = 24;
    const startX = 60;
    
    // Show all nodes with staggered animations
    const positions = values.map((value, valueIndex) => ({
      x: startX + valueIndex * (nodeWidth + gap),
      y: 130
    }));

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = '';

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerUnits', 'strokeWidth');
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
    arrowPath.setAttribute('fill', '#38bdf8');
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    svg.appendChild(defs);

    const headLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    headLabel.setAttribute('x', '36');
    headLabel.setAttribute('y', '70');
    headLabel.setAttribute('fill', '#7dd3fc');
    headLabel.setAttribute('font-size', '14');
    headLabel.setAttribute('font-weight', '700');
    headLabel.textContent = 'HEAD';
    svg.appendChild(headLabel);

    const tailLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tailLabel.setAttribute('x', `${Math.max(60, startX + (values.length - 1) * (nodeWidth + gap) + 46)}`);
    tailLabel.setAttribute('y', '70');
    tailLabel.setAttribute('fill', '#fbbf24');
    tailLabel.setAttribute('font-size', '14');
    tailLabel.setAttribute('font-weight', '700');
    tailLabel.textContent = 'TAIL';
    svg.appendChild(tailLabel);

    positions.forEach((position, index) => {
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeGroup.setAttribute('class', 'linked-list-node-group');
      // Apply cascading animation to all nodes
      nodeGroup.setAttribute('data-animation', 'insert');
      nodeGroup.setAttribute('style', `animation-delay: ${index * 0.15}s`);
      
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', position.x);
      rect.setAttribute('y', position.y - nodeHeight / 2);
      rect.setAttribute('width', nodeWidth);
      rect.setAttribute('height', nodeHeight);
      rect.setAttribute('rx', '16');
      rect.setAttribute('fill', index === stepState.head ? '#0f766e' : index === values.length - 1 ? '#92400e' : '#1e293b');
      rect.setAttribute('stroke', index === 0 ? '#38bdf8' : '#64748b');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('class', 'linked-list-node-rect node-insert-anim');
      rect.setAttribute('style', `animation-delay: ${index * 0.15}s`);
      nodeGroup.appendChild(rect);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', position.x + nodeWidth / 2);
      label.setAttribute('y', position.y + 6);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'white');
      label.setAttribute('font-size', '18');
      label.setAttribute('font-weight', '700');
      label.textContent = values[index];
      nodeGroup.appendChild(label);

      const indexLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      indexLabel.setAttribute('x', position.x + nodeWidth / 2);
      indexLabel.setAttribute('y', position.y + 34);
      indexLabel.setAttribute('text-anchor', 'middle');
      indexLabel.setAttribute('fill', '#cbd5e1');
      indexLabel.setAttribute('font-size', '12');
      indexLabel.textContent = index === stepState.head ? 'head' : index === values.length - 1 ? 'tail' : '';
      nodeGroup.appendChild(indexLabel);

      svg.appendChild(nodeGroup);

      if (index < values.length - 1) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', position.x + nodeWidth);
        line.setAttribute('y1', position.y);
        line.setAttribute('x2', position.x + nodeWidth + gap - 8);
        line.setAttribute('y2', position.y);
        line.setAttribute('stroke', '#38bdf8');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('marker-end', 'url(#arrowhead)');
        line.setAttribute('style', `animation-delay: ${index * 0.15}s`);
        line.setAttribute('class', 'linked-list-arrow-anim');
        svg.appendChild(line);
      }
    });

    operationEl.textContent = state.operation;
    headEl.textContent = values.length > 0 ? String(values[0]) : '—';
    tailEl.textContent = values.length > 0 ? String(values[values.length - 1]) : '—';
    countEl.textContent = String(values.length);
    currentStepEl.textContent = `${index + 1} / ${total}`;
    progressFill.style.width = `${((index + 1) / Math.max(total, 1)) * 100}%`;
    timelineInput.value = String(index);
    timerEl.textContent = `${(state.elapsedMs / 1000).toFixed(1)}s`;
    const currentStep = index >= 0 && index < steps.length ? steps[index] : null;
    messageEl.textContent = currentStep?.message || 'Linked list ready';
    const explanationItems = Array.isArray(currentStep?.explanation) ? currentStep.explanation : [];
    explanationEl.innerHTML = explanationItems.length
      ? `<ul class="bubble-explanation-list">${explanationItems.map((item) => `<li>${item}</li>`).join('')}</ul>`
      : '<p>No explanation available.</p>';
    playButton.textContent = state.isPlaying ? 'Pause' : 'Play';
    analytics.update({
      elapsedMs: state.elapsedMs,
      comparisons: state.comparisons,
      swaps: 0,
      currentPass: index + 1,
      currentStep: index + 1
    });
  }

  function setIndex(index) {
    state.currentIndex = clampIndex(index);
    state.comparisons = state.currentIndex + 1;
    updateView();
  }

  function pause() {
    state.isPlaying = false;
    if (state.timer) {
      window.clearTimeout(state.timer);
      state.timer = null;
    }
    updateView();
  }

  function play() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    updateView();
    const tick = () => {
      if (!state.isPlaying) return;
      state.elapsedMs += 1000 / Math.max(state.speed, 0.25);
      if (state.currentIndex >= steps.length - 1) {
        pause();
        return;
      }
      state.currentIndex += 1;
      updateView();
      state.timer = window.setTimeout(tick, 750 / Math.max(state.speed, 0.25));
    };
    state.timer = window.setTimeout(tick, 750 / Math.max(state.speed, 0.25));
  }

  function replay() {
    pause();
    state.currentIndex = 0;
    state.elapsedMs = 0;
    state.comparisons = 0;
    updateView();
    play();
  }

  playButton.addEventListener('click', () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  });

  replayButton.addEventListener('click', replay);
  prevButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex - 1);
  });
  nextButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex + 1);
  });

  timelineInput.addEventListener('input', (event) => {
    pause();
    setIndex(Number(event.target.value));
  });

  speedInput.addEventListener('input', (event) => {
    state.speed = Number(event.target.value);
    if (state.isPlaying) {
      pause();
      play();
    }
  });

  setIndex(0);
}

function renderHeapVisualizer(steps, complexity) {
  const state = {
    steps,
    currentIndex: 0,
    isPlaying: false,
    speed: 1,
    timer: null,
    elapsedMs: 0,
    comparisons: 0,
    swaps: 0,
    operation: 'heap-sort'
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'heap-visualizer';
  wrapper.innerHTML = `
    <div class="heap-summary-grid">
      <div class="metric-card">
        <span class="metric-label">Mode</span>
        <strong>Heap Sort</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Root</span>
        <strong data-role="root">0</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Parent</span>
        <strong data-role="parent">—</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Complexity</span>
        <strong>${complexity}</strong>
      </div>
    </div>
    <div class="heap-controls">
      <div class="bubble-buttons">
        <button class="primary-btn" type="button" data-action="play">Play</button>
        <button class="secondary-btn" type="button" data-action="replay">Replay</button>
        <button class="secondary-btn" type="button" data-action="prev">Previous Step</button>
        <button class="secondary-btn" type="button" data-action="next">Next Step</button>
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="heap-timeline">Timeline</label>
        <input class="bubble-timeline" id="heap-timeline" type="range" min="0" max="${Math.max(steps.length - 1, 0)}" value="0" />
      </div>
      <div class="bubble-control-group">
        <label class="bubble-control-label" for="heap-speed">Speed</label>
        <input class="bubble-speed" id="heap-speed" type="range" min="0.5" max="2.5" step="0.25" value="1" />
      </div>
    </div>
    <div class="heap-stage">
      <div class="heap-panel-card">
        <div class="heap-panel-header">
          <h4>Array</h4>
          <span class="metric-label">Live values</span>
        </div>
        <div class="heap-array-track"></div>
      </div>
      <div class="heap-panel-card">
        <div class="heap-panel-header">
          <h4>Heap Tree</h4>
          <span class="metric-label">Parent • child focus</span>
        </div>
        <svg class="heap-tree-svg" viewBox="0 0 560 260" role="img" aria-label="Heap tree visualization"></svg>
      </div>
    </div>
    <div class="heap-status-card">
      <p class="metric-label">Current step</p>
      <h3 data-role="current-step">1 / ${steps.length}</h3>
      <p class="heap-message"></p>
      <p class="heap-explanation"></p>
      <div class="heap-progress-track">
        <div class="heap-progress-fill"></div>
      </div>
      <div class="heap-metrics">
        <span class="bubble-pill">Timer <strong data-role="timer">0.0s</strong></span>
        <span class="bubble-pill">Active node <strong data-role="active-node">—</strong></span>
      </div>
    </div>
  `;

  results.innerHTML = '';
  results.appendChild(wrapper);

  const timeline = attachTimeline(steps, (nextIndex) => {
    state.currentIndex = Math.max(0, Math.min(steps.length - 1, nextIndex));
    updateView();
  }, 0);
  wrapper.appendChild(timeline);

  const analytics = attachAnalyticsPanel(wrapper, {
    algorithm: 'heap',
    operation: 'sort',
    steps,
    elapsedMs: state.elapsedMs,
    comparisons: state.comparisons,
    swaps: 0,
    currentPass: 1,
    currentStep: 1
  });

  const rootEl = wrapper.querySelector('[data-role="root"]');
  const parentEl = wrapper.querySelector('[data-role="parent"]');
  const activeNodeEl = wrapper.querySelector('[data-role="active-node"]');
  const currentStepEl = wrapper.querySelector('[data-role="current-step"]');
  const timerEl = wrapper.querySelector('[data-role="timer"]');
  const messageEl = wrapper.querySelector('.heap-message');
  const explanationEl = wrapper.querySelector('.heap-explanation');
  const arrayTrack = wrapper.querySelector('.heap-array-track');
  const treeSvg = wrapper.querySelector('.heap-tree-svg');
  const progressFill = wrapper.querySelector('.heap-progress-fill');
  const timelineInput = wrapper.querySelector('#heap-timeline');
  const speedInput = wrapper.querySelector('#heap-speed');
  const playButton = wrapper.querySelector('[data-action="play"]');
  const replayButton = wrapper.querySelector('[data-action="replay"]');
  const prevButton = wrapper.querySelector('[data-action="prev"]');
  const nextButton = wrapper.querySelector('[data-action="next"]');

  function clampIndex(index) {
    return Math.max(0, Math.min(steps.length - 1, index));
  }

  function calculateHeapPositions(values, width, height, nodeSize = 56, topPadding = 40) {
    const positions = [];
    const length = values.length;
    const maxLevel = length > 0 ? Math.floor(Math.log2(length)) : 0;
    const totalLevels = Math.max(maxLevel, 1);
    const availableHeight = Math.max(height - topPadding - nodeSize, 1);
    const levelGap = availableHeight / (totalLevels + 1);

    for (let valueIndex = 0; valueIndex < length; valueIndex += 1) {
      const level = Math.floor(Math.log2(valueIndex + 1));
      const position = valueIndex - (2 ** level - 1);
      const nodesInLevel = 2 ** level;
      const horizontalGap = width / (nodesInLevel + 1);
      const x = horizontalGap * (position + 1) - nodeSize / 2;
      const y = topPadding + level * levelGap;
      positions.push({ valueIndex, value: values[valueIndex], x, y, level });
    }

    return positions;
  }

  function deriveMeta(index) {
    const step = index >= 0 && index < steps.length ? steps[index] : (steps[0] || {});
    const values = Array.isArray(step.values) ? step.values : [];
    const message = String(step.message || '');
    const explanationItems = Array.isArray(step.explanation) ? step.explanation : [];
    const match = message.match(/index\s+(\d+)/i);
    const heapifyIndex = match ? Number(match[1]) : null;
    const parentIndex = heapifyIndex !== null ? heapifyIndex : 0;
    const childIndices = [];
    if (heapifyIndex !== null) {
      const left = 2 * heapifyIndex + 1;
      const right = 2 * heapifyIndex + 2;
      if (left < values.length) childIndices.push(left);
      if (right < values.length) childIndices.push(right);
    }
    const previousValues = index > 0 && Array.isArray(steps[index - 1]?.values) ? steps[index - 1].values : [];
    const swapIndices = [];
    if (message.includes('Swap during heapify') || message.includes('Extract max')) {
      values.forEach((value, valueIndex) => {
        if (previousValues[valueIndex] !== undefined && previousValues[valueIndex] !== value) {
          swapIndices.push(valueIndex);
        }
      });
    }
    const isExtraction = message.includes('Extract max');
    const isSwap = message.includes('Swap during heapify');
    return { values, message, explanationItems, parentIndex, childIndices, swapIndices, isExtraction, isSwap };
  }

  function updateView() {
    const index = state.currentIndex;
    if (timeline && typeof timeline.updateSelection === 'function') {
      timeline.updateSelection(index);
    }
    const meta = deriveMeta(index);
    const values = meta.values;
    const total = Math.max(steps.length, 1);
    const maxValue = Math.max(...values, 1);

    arrayTrack.innerHTML = '';
    values.forEach((value, valueIndex) => {
      const bar = document.createElement('div');
      bar.className = 'heap-array-bar';
      const ratio = Math.max(0.18, value / Math.max(maxValue, 1));
      bar.style.height = `${ratio * 100}%`;
      if (meta.parentIndex === valueIndex) bar.classList.add('parent');
      if (meta.childIndices.includes(valueIndex)) bar.classList.add('child');
      if (meta.swapIndices.includes(valueIndex)) bar.classList.add('swap');
      if (valueIndex === 0) bar.classList.add('root');
      if (meta.isExtraction && valueIndex === values.length - 1) bar.classList.add('extracted');
      const label = document.createElement('span');
      label.className = 'heap-array-label';
      label.textContent = value;
      bar.appendChild(label);
      arrayTrack.appendChild(bar);
    });

    treeSvg.innerHTML = '';
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'heap-arrow');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M0,0 L0,6 L9,3 z');
    path.setAttribute('fill', '#38bdf8');
    marker.appendChild(path);
    defs.appendChild(marker);
    treeSvg.appendChild(defs);

    const viewBox = treeSvg.viewBox.baseVal || { width: 560, height: 260 };
    const width = viewBox.width || 560;
    const height = viewBox.height || 260;
    const nodeSize = 56;
    const nodes = calculateHeapPositions(values, width, height, nodeSize, 40);

    nodes.forEach((node) => {
      const parentIndex = Math.floor((node.valueIndex - 1) / 2);
      if (parentIndex >= 0 && nodes[parentIndex]) {
        const edge = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        edge.setAttribute('x1', nodes[parentIndex].x + nodeSize / 2);
        edge.setAttribute('y1', nodes[parentIndex].y + nodeSize / 2);
        edge.setAttribute('x2', node.x + nodeSize / 2);
        edge.setAttribute('y2', node.y + nodeSize / 2);
        edge.setAttribute('stroke', '#64748b');
        edge.setAttribute('stroke-width', '2');
        edge.setAttribute('marker-end', 'url(#heap-arrow)');
        treeSvg.appendChild(edge);
      }
    });

    nodes.forEach((node) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', node.x);
      rect.setAttribute('y', node.y);
      rect.setAttribute('width', nodeSize);
      rect.setAttribute('height', nodeSize);
      rect.setAttribute('rx', '14');
      rect.setAttribute('fill',
        node.valueIndex === 0
          ? '#0f766e'
          : meta.parentIndex === node.valueIndex
            ? '#f59e0b'
            : meta.childIndices.includes(node.valueIndex)
              ? '#38bdf8'
              : meta.swapIndices.includes(node.valueIndex)
                ? '#ef4444'
                : '#1e293b'
      );
      rect.setAttribute('stroke', node.valueIndex === 0 ? '#5eead4' : '#94a3b8');
      rect.setAttribute('stroke-width', '2');
      group.appendChild(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x + nodeSize / 2);
      text.setAttribute('y', node.y + nodeSize / 2 + 2);
      text.setAttribute('fill', 'white');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', '16');
      text.setAttribute('font-weight', '700');
      text.textContent = node.value;
      group.appendChild(text);
      treeSvg.appendChild(group);
    });

    rootEl.textContent = '0';
    parentEl.textContent = meta.parentIndex !== null ? String(meta.parentIndex) : '—';
    activeNodeEl.textContent = meta.parentIndex !== null ? String(meta.parentIndex) : '0';
    currentStepEl.textContent = `${index + 1} / ${total}`;
    progressFill.style.width = `${((index + 1) / Math.max(total, 1)) * 100}%`;
    timelineInput.value = String(index);
    timerEl.textContent = `${(state.elapsedMs / 1000).toFixed(1)}s`;
    const currentStep = index >= 0 && index < steps.length ? steps[index] : null;
    messageEl.textContent = currentStep?.message || 'Heap sort ready';
    explanationEl.innerHTML = meta.explanationItems.length
      ? `<ul class="bubble-explanation-list">${meta.explanationItems.map((item) => `<li>${item}</li>`).join('')}</ul>`
      : '<p>No explanation available.</p>';
    playButton.textContent = state.isPlaying ? 'Pause' : 'Play';
    analytics.update({
      elapsedMs: state.elapsedMs,
      comparisons: state.comparisons,
      swaps: state.swaps,
      currentPass: index + 1,
      currentStep: index + 1
    });
  }

  function setIndex(index) {
    state.currentIndex = clampIndex(index);
    updateView();
  }

  function pause() {
    state.isPlaying = false;
    if (state.timer) {
      window.clearTimeout(state.timer);
      state.timer = null;
    }
    updateView();
  }

  function play() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    updateView();
    const tick = () => {
      if (!state.isPlaying) return;
      state.elapsedMs += 1000 / Math.max(state.speed, 0.25);
      if (state.currentIndex >= steps.length - 1) {
        pause();
        return;
      }
      state.currentIndex += 1;
      updateView();
      state.timer = window.setTimeout(tick, 750 / Math.max(state.speed, 0.25));
    };
    state.timer = window.setTimeout(tick, 750 / Math.max(state.speed, 0.25));
  }

  function replay() {
    pause();
    state.currentIndex = 0;
    state.elapsedMs = 0;
    updateView();
    play();
  }

  playButton.addEventListener('click', () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  });

  replayButton.addEventListener('click', replay);
  prevButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex - 1);
  });
  nextButton.addEventListener('click', () => {
    pause();
    setIndex(state.currentIndex + 1);
  });

  timelineInput.addEventListener('input', (event) => {
    pause();
    setIndex(Number(event.target.value));
  });

  speedInput.addEventListener('input', (event) => {
    state.speed = Number(event.target.value);
    if (state.isPlaying) {
      pause();
      play();
    }
  });

  setIndex(0);
}

function renderTreeVisualizer(steps, complexity, algorithm, valuesInput, operation) {
  const treeType = (algorithm || 'bst').toLowerCase();
  const wrapper = document.createElement('div');
  wrapper.className = 'tree-visualizer';
  wrapper.innerHTML = `
    <div class="tree-summary-grid">
      <div class="metric-card">
        <span class="metric-label">Mode</span>
        <strong>${treeType.toUpperCase()}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Animation</span>
        <strong>${operation === 'delete' ? 'Deletion' : operation === 'traverse' ? 'Traversal' : 'Insertion'}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Steps</span>
        <strong>${steps.length}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Complexity</span>
        <strong>${complexity}</strong>
      </div>
    </div>
    <div class="tree-controls">
      <div class="bubble-buttons">
        <button class="primary-btn" type="button" data-action="play">Play</button>
        <button class="secondary-btn" type="button" data-action="replay">Replay</button>
        <button class="secondary-btn" type="button" data-action="prev">Previous Step</button>
        <button class="secondary-btn" type="button" data-action="next">Next Step</button>
      </div>
      <div class="tree-toolbar">
        <label class="bubble-control-label" for="tree-zoom">Zoom</label>
        <input id="tree-zoom" type="range" min="0.75" max="2.25" step="0.05" value="1" />
        <button class="secondary-btn" type="button" data-action="reset-view">Reset view</button>
      </div>
    </div>
    <div class="tree-canvas-shell">
      <svg class="tree-canvas" viewBox="0 0 960 560" role="img" aria-label="Tree visualization"></svg>
    </div>
    <div class="tree-status-card">
      <p class="metric-label">Current step</p>
      <h3 data-role="current-step">1 / ${steps.length}</h3>
      <p class="tree-message"></p>
      <p class="tree-explanation"></p>
    </div>
  `;

  results.innerHTML = '';
  results.appendChild(wrapper);

  const timeline = attachTimeline(steps, (nextIndex) => {
    index = Math.max(0, Math.min(steps.length - 1, nextIndex));
    renderFrame();
  }, 0);
  wrapper.appendChild(timeline);

  const analytics = attachAnalyticsPanel(wrapper, {
    algorithm,
    operation,
    steps,
    elapsedMs: 0,
    comparisons: 0,
    swaps: 0,
    currentPass: 1,
    currentStep: 1
  });

  const svg = wrapper.querySelector('.tree-canvas');
  const currentStepEl = wrapper.querySelector('[data-role="current-step"]');
  const messageEl = wrapper.querySelector('.tree-message');
  const explanationEl = wrapper.querySelector('.tree-explanation');
  const zoomInput = wrapper.querySelector('#tree-zoom');
  const playButton = wrapper.querySelector('[data-action="play"]');
  const replayButton = wrapper.querySelector('[data-action="replay"]');
  const prevButton = wrapper.querySelector('[data-action="prev"]');
  const nextButton = wrapper.querySelector('[data-action="next"]');
  const resetButton = wrapper.querySelector('[data-action="reset-view"]');

  let index = 0;
  let isPlaying = false;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let timer = null;

  function buildNodeLayout(node, x, y, depth, parentValue = null) {
    if (!node) return [];
    const layout = [];
    layout.push({ ...node, x, y, depth, parentValue });
    const gap = Math.max(60, 220 - depth * 18);
    if (node.left) layout.push(...buildNodeLayout(node.left, x - gap, y + 90, depth + 1, node.value));
    if (node.right) layout.push(...buildNodeLayout(node.right, x + gap, y + 90, depth + 1, node.value));
    return layout;
  }

  function renderFrame() {
    if (timeline && typeof timeline.updateSelection === 'function') {
      timeline.updateSelection(index);
    }
    const step = index >= 0 && index < steps.length ? steps[index] : (steps[0] || {});
    const snapshot = step.snapshot || {};
    const nodes = [];

    const root = snapshot;
    if (root) {
      const layout = buildNodeLayout(root, 480, 80, 0);
      layout.forEach((entry) => nodes.push(entry));
    }

    svg.innerHTML = '';
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', '0');
    background.setAttribute('y', '0');
    background.setAttribute('width', '960');
    background.setAttribute('height', '560');
    background.setAttribute('fill', 'rgba(2,6,23,0.92)');
    svg.appendChild(background);

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${panX} ${panY}) scale(${zoom})`);
    svg.appendChild(group);

    nodes.forEach((node) => {
      if (!node.value && node.value !== 0) return;
      const parentNode = nodes.find((candidate) => candidate.value === node.parentValue);
      if (parentNode) {
        const edge = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        edge.setAttribute('x1', parentNode.x);
        edge.setAttribute('y1', parentNode.y + 26);
        edge.setAttribute('x2', node.x);
        edge.setAttribute('y2', node.y - 26);
        edge.setAttribute('stroke', node.color === 'red' ? '#fb7185' : step.meta?.accent === 'rotation' ? '#f59e0b' : '#38bdf8');
        edge.setAttribute('stroke-width', step.meta?.accent === 'rotation' ? '3.4' : '2.4');
        edge.setAttribute('stroke-linecap', 'round');
        edge.setAttribute('stroke-dasharray', step.meta?.accent === 'rotation' ? '6 6' : '');
        group.appendChild(edge);
      }
    });

    nodes.forEach((node) => {
      if (!node.value && node.value !== 0) return;
      const isActive = step.meta?.activeValue === node.value || node.value === step.value;
      const isRotation = step.meta?.accent === 'rotation' && isActive;
      const isRedBlack = treeType === 'red-black' && node.color === 'red';
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', node.x - 30);
      rect.setAttribute('y', node.y - 30);
      rect.setAttribute('width', 60);
      rect.setAttribute('height', 60);
      rect.setAttribute('rx', '18');
      rect.setAttribute('fill', isRedBlack ? '#ef4444' : isRotation ? '#f59e0b' : isActive ? '#0ea5e9' : '#0f766e');
      rect.setAttribute('stroke', isRotation ? '#fef3c7' : '#e2e8f0');
      rect.setAttribute('stroke-width', isRotation ? '4' : '3');
      group.appendChild(rect);
      if (isRotation) {
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring.setAttribute('cx', node.x);
        ring.setAttribute('cy', node.y);
        ring.setAttribute('r', '40');
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', '#fde68a');
        ring.setAttribute('stroke-width', '4');
        ring.setAttribute('stroke-dasharray', '8 6');
        group.appendChild(ring);
      }
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x);
      text.setAttribute('y', node.y + 6);
      text.setAttribute('fill', isRedBlack ? '#fff7ed' : 'white');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '20');
      text.setAttribute('font-weight', '700');
      text.textContent = node.value;
      group.appendChild(text);
      if (isRotation && step.meta?.rotationHint) {
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', node.x);
        label.setAttribute('y', node.y + 74);
        label.setAttribute('fill', '#fde68a');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '13');
        label.setAttribute('font-weight', '700');
        label.textContent = step.meta.rotationHint;
        group.appendChild(label);
      }
    });

    currentStepEl.textContent = `${index + 1} / ${steps.length}`;
    messageEl.textContent = step.message || 'Tree animation ready';
    explanationEl.innerHTML = (step.explanation || []).map((item) => `<li>${item}</li>`).join('');
    explanationEl.innerHTML = `<ul class="tree-explain-list">${explanationEl.innerHTML}</ul>`;
    playButton.textContent = isPlaying ? 'Pause' : 'Play';
    analytics.update({
      elapsedMs: 0,
      comparisons: index + 1,
      swaps: 0,
      currentPass: index + 1,
      currentStep: index + 1
    });
  }

  function setIndex(nextIndex) {
    index = Math.max(0, Math.min(steps.length - 1, nextIndex));
    renderFrame();
  }

  function pause() {
    isPlaying = false;
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
    playButton.textContent = 'Play';
  }

  function play() {
    if (!steps.length) return;
    if (isPlaying) return;
    isPlaying = true;
    playButton.textContent = 'Pause';
    const tick = () => {
      if (!isPlaying) return;
      if (index >= steps.length - 1) {
        pause();
        return;
      }
      index += 1;
      renderFrame();
      timer = window.setTimeout(tick, 650);
    };
    timer = window.setTimeout(tick, 650);
  }

  playButton.addEventListener('click', () => {
    if (isPlaying) pause(); else play();
  });

  replayButton.addEventListener('click', () => {
    pause();
    index = 0;
    renderFrame();
    play();
  });

  prevButton.addEventListener('click', () => {
    pause();
    setIndex(index - 1);
  });

  nextButton.addEventListener('click', () => {
    pause();
    setIndex(index + 1);
  });

  resetButton.addEventListener('click', () => {
    zoom = 1;
    panX = 0;
    panY = 0;
    zoomInput.value = '1';
    renderFrame();
  });

  zoomInput.addEventListener('input', (event) => {
    zoom = Number(event.target.value);
    renderFrame();
  });

  let dragging = false;
  let dragStart = null;
  svg.addEventListener('pointerdown', (event) => {
    dragging = true;
    dragStart = { x: event.clientX, y: event.clientY };
  });
  svg.addEventListener('pointermove', (event) => {
    if (!dragging || !dragStart) return;
    panX += event.clientX - dragStart.x;
    panY += event.clientY - dragStart.y;
    dragStart = { x: event.clientX, y: event.clientY };
    renderFrame();
  });
  svg.addEventListener('pointerup', () => {
    dragging = false;
    dragStart = null;
  });

  renderFrame();
}

function getComplexityLabel(algorithm, operation) {
  if (algorithm === 'bubble') return 'O(n²)';
  if (algorithm === 'selection-sort') return 'O(n²)';
  if (algorithm === 'insertion-sort') return 'O(n²)';
  if (algorithm === 'merge-sort') return 'O(n log n)';
  if (algorithm === 'quick-sort') return 'O(n log n)';
  if (algorithm === 'linear-search') return 'O(n)';
  if (algorithm === 'binary-search') return 'O(log n)';
  if (['bst', 'avl', 'heap', 'red-black'].includes(algorithm)) return 'O(log n)';
  if (algorithm === 'trie') return 'O(m)';
  if (algorithm === 'heap' || algorithm === 'heap-sort') return 'O(n log n)';
  if (algorithm === 'stack' || algorithm === 'queue') return operation === 'push' || operation === 'enqueue' ? 'O(1)' : 'O(1)';
  if (algorithm === 'linked-list') return 'O(n)';
  if (algorithm === 'graph') return operation === 'dijkstra' ? 'O(E log V)' : 'O(V + E)';
  return 'O(1)';
}

let activeGraphRenderer = null;

function renderGraphVisualizer(nodesInputStr, edgesInputStr, algorithm, operation) {
  const effectiveAlgo = (['bfs', 'dfs', 'dijkstra', 'prim', 'kruskal', 'bellman-ford'].includes(algorithm)
    ? algorithm
    : ['bfs', 'dfs', 'dijkstra', 'prim', 'kruskal', 'bellman-ford'].includes(operation)
    ? operation
    : 'bfs').toLowerCase();

  const graphPanelElement = document.getElementById('graph-panel');
  const container = graphPanelElement?.querySelector('#graph-results-target');

  if (container && typeof GraphRenderer !== 'undefined') {
    activeGraphRenderer = new GraphRenderer(container);
    const nodes = nodesInputStr || '0,1,2,3,4';
    const edges = edgesInputStr || document.getElementById('edges')?.value?.trim() || '';
    activeGraphRenderer.init(nodes, edges, effectiveAlgo, false, 0);
  }
}
