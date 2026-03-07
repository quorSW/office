const canvas = document.getElementById('officeCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const roleOrder = [
  'Director',
  'Product Strategist',
  'Solution Architect',
  'Developer',
  'Reviewer',
  'QA',
  'Documentation',
  'Enablement'
];

const rooms = {
  director: { x: 44, y: 36, w: 210, h: 130, label: 'Director' },
  strategy: { x: 278, y: 36, w: 220, h: 130, label: 'Strategy' },
  architecture: { x: 522, y: 36, w: 190, h: 130, label: 'Architect' },
  meeting: { x: 736, y: 36, w: 180, h: 130, label: 'Meeting' },
  dev: { x: 44, y: 212, w: 320, h: 168, label: 'Dev Floor' },
  review: { x: 388, y: 212, w: 220, h: 168, label: 'Review / QA' },
  docs: { x: 632, y: 212, w: 160, h: 168, label: 'Docs' },
  coffee: { x: 816, y: 212, w: 100, h: 168, label: 'Coffee' },
  lounge: { x: 44, y: 412, w: 872, h: 104, label: 'Hall / Transit' }
};

const roleTargets = {
  Director: pointIn(rooms.director, 120, 72),
  'Product Strategist': pointIn(rooms.strategy, 90, 76),
  'Solution Architect': pointIn(rooms.architecture, 84, 76),
  Developer: pointIn(rooms.dev, 120, 94),
  Reviewer: pointIn(rooms.review, 82, 94),
  QA: pointIn(rooms.review, 152, 94),
  Documentation: pointIn(rooms.docs, 78, 94),
  Enablement: pointIn(rooms.meeting, 88, 72),
};

function pointIn(room, dx, dy) {
  return { x: room.x + dx, y: room.y + dy };
}

const agents = [
  makeAgent('Astra', 'Director', '#7dd3fc'),
  makeAgent('Nova', 'Product Strategist', '#c4b5fd'),
  makeAgent('Forge', 'Solution Architect', '#f9a8d4'),
  makeAgent('Pixel', 'Developer', '#86efac'),
  makeAgent('Shield', 'Reviewer', '#fca5a5'),
  makeAgent('Probe', 'QA', '#fde68a'),
  makeAgent('Echo', 'Documentation', '#93c5fd'),
  makeAgent('Mentor', 'Enablement', '#fdba74'),
];

function makeAgent(name, role, color) {
  const start = { x: 140 + Math.random() * 640, y: 458 + Math.random() * 32 };
  return {
    name,
    role,
    color,
    x: start.x,
    y: start.y,
    targetX: start.x,
    targetY: start.y,
    status: 'idle',
    energy: 75 + Math.floor(Math.random() * 20),
    currentTaskId: null,
    bubble: 'Жду задачу',
    stepTimer: 0,
    blink: 0,
  };
}

const state = {
  running: true,
  tasks: [
    makeTask('Собрать AI-офис', 'Сделать красивый mini app офис с агентами, задачами и логами.'),
  ],
  logs: [],
  tick: 0,
};

function makeTask(title, description) {
  return {
    id: 'task_' + Math.random().toString(36).slice(2, 8),
    title,
    description,
    stageIndex: 0,
    status: 'queue',
    currentRole: roleOrder[0],
    completed: false,
    createdAt: new Date(),
  };
}

function log(message) {
  state.logs.unshift({ time: new Date(), message });
  state.logs = state.logs.slice(0, 50);
  renderLogs();
}

function assignTargets() {
  agents.forEach(agent => {
    const activeTask = state.tasks.find(t => !t.completed && t.currentRole === agent.role && t.status === 'active');
    if (activeTask) {
      const target = roleTargets[agent.role] || pointIn(rooms.lounge, 90, 50);
      agent.targetX = target.x + rand(-18, 18);
      agent.targetY = target.y + rand(-10, 10);
      agent.status = 'working';
      agent.currentTaskId = activeTask.id;
      agent.bubble = activeTask.title;
    } else if (Math.random() < 0.0025) {
      agent.targetX = rooms.coffee.x + 36 + rand(-12, 12);
      agent.targetY = rooms.coffee.y + 90 + rand(-12, 12);
      agent.status = 'coffee';
      agent.currentTaskId = null;
      agent.bubble = 'Кофе-пауза';
    } else if (agent.status !== 'coffee') {
      agent.status = 'idle';
      agent.currentTaskId = null;
      agent.bubble = 'На связи';
      agent.targetX = pointIn(rooms.lounge, 60 + roleOrder.indexOf(agent.role) * 100, 48).x + rand(-20, 20);
      agent.targetY = pointIn(rooms.lounge, 60 + roleOrder.indexOf(agent.role) * 100, 48).y + rand(-14, 14);
    }
  });
}

function progressPipeline() {
  let task = state.tasks.find(t => !t.completed && (t.status === 'queue' || t.status === 'active'));
  if (!task) return;

  if (task.status === 'queue') {
    task.status = 'active';
    task.currentRole = roleOrder[task.stageIndex];
    log(`Задача «${task.title}» взял ${task.currentRole}.`);
    assignTargets();
    return;
  }

  const previousRole = task.currentRole;
  task.stageIndex += 1;
  if (task.stageIndex >= roleOrder.length) {
    task.completed = true;
    task.status = 'done';
    task.currentRole = 'Done';
    log(`Задача «${task.title}» завершена. Офис сработал отлично.`);
  } else {
    task.currentRole = roleOrder[task.stageIndex];
    log(`Задача «${task.title}» перешла от ${previousRole} к ${task.currentRole}.`);
  }
  assignTargets();
  renderTasks();
}

function update() {
  state.tick += 1;

  if (state.running && state.tick % 240 === 0) {
    progressPipeline();
  }

  agents.forEach(agent => {
    const dx = agent.targetX - agent.x;
    const dy = agent.targetY - agent.y;
    const dist = Math.hypot(dx, dy);
    const speed = agent.status === 'working' ? 0.9 : 0.65;

    if (dist > 1) {
      agent.x += (dx / dist) * speed;
      agent.y += (dy / dist) * speed;
      agent.stepTimer += 1;
    } else if (agent.status === 'coffee' && Math.random() < 0.003) {
      agent.status = 'idle';
      agent.bubble = 'Вернулся к работе';
    }

    if (agent.status === 'working') agent.energy = Math.max(18, agent.energy - 0.01);
    if (agent.status === 'coffee') agent.energy = Math.min(100, agent.energy + 0.04);
    if (agent.status === 'idle') agent.energy = Math.min(100, agent.energy + 0.01);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFloor();
  Object.values(rooms).forEach(drawRoom);
  drawFurniture();
  agents.forEach(drawAgent);
}

function drawFloor() {
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += 20) {
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.fillStyle = (x + y) % 40 === 0 ? '#0f1b33' : '#0c172b';
      ctx.fillRect(x, y, 20, 20);
    }
  }
}

function drawRoom(room) {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(room.x, room.y, room.w, room.h);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.strokeRect(room.x, room.y, room.w, room.h);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(room.label, room.x + 12, room.y + 22);
}

function drawFurniture() {
  // desks
  drawDesk(84, 86); drawDesk(318, 86); drawDesk(560, 86); drawDesk(120, 278); drawDesk(220, 278);
  drawDesk(432, 278); drawDesk(500, 278); drawDesk(664, 278);
  // coffee machine
  ctx.fillStyle = '#111827';
  ctx.fillRect(842, 272, 42, 54);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(850, 284, 12, 12);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(865, 306, 9, 11);
  // meeting table
  ctx.fillStyle = '#334155';
  ctx.fillRect(775, 86, 90, 36);
}

function drawDesk(x, y) {
  ctx.fillStyle = '#334155';
  ctx.fillRect(x, y, 52, 28);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 8, y + 7, 24, 14);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(x + 18, y + 28, 14, 8);
}

function drawAgent(agent) {
  const bob = Math.sin(agent.stepTimer * 0.25) * 1.2;
  const x = agent.x;
  const y = agent.y + bob;

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.fillRect(x - 7, y + 10, 14, 4);

  // body
  ctx.fillStyle = agent.color;
  ctx.fillRect(x - 6, y - 12, 12, 14);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x - 5, y - 23, 10, 10);
  ctx.fillStyle = '#111827';
  ctx.fillRect(x - 3, y - 20, 2, 2);
  ctx.fillRect(x + 1, y - 20, 2, 2);

  // status marker
  ctx.fillStyle = agent.status === 'working' ? '#22c55e' : agent.status === 'coffee' ? '#f59e0b' : '#94a3b8';
  ctx.fillRect(x - 2, y - 30, 4, 4);

  // bubble
  drawBubble(x, y - 40, shorten(agent.bubble, 20));
}

function drawBubble(x, y, text) {
  ctx.font = '11px sans-serif';
  const width = Math.max(44, ctx.measureText(text).width + 12);
  ctx.fillStyle = 'rgba(15,23,42,.92)';
  ctx.fillRect(x - width / 2, y - 13, width, 18);
  ctx.strokeStyle = '#475569';
  ctx.strokeRect(x - width / 2, y - 13, width, 18);
  ctx.fillStyle = '#e5e7eb';
  ctx.fillText(text, x - width / 2 + 6, y);
}

function renderAgents() {
  const wrap = document.getElementById('agentList');
  wrap.innerHTML = '';
  document.getElementById('teamSummary').textContent = `${agents.length} агентов`;

  agents.forEach(agent => {
    const div = document.createElement('div');
    div.className = 'agent-item';
    div.innerHTML = `
      <div class="agent-row">
        <h3>${agent.name}</h3>
        <span class="badge ${badgeClass(agent.status)}">${labelStatus(agent.status)}</span>
      </div>
      <div class="meta">${agent.role}</div>
      <div class="meta">${agent.bubble}</div>
      <div class="meter"><span style="width:${agent.energy}%"></span></div>
    `;
    wrap.appendChild(div);
  });
}

function renderTasks() {
  const board = document.getElementById('taskBoard');
  board.innerHTML = '';
  state.tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.innerHTML = `
      <h3>${task.title}</h3>
      <div class="meta">${task.description}</div>
      <div class="task-meta">
        <span>${task.completed ? 'Готово' : task.currentRole}</span>
        <span>${task.status}</span>
      </div>
    `;
    board.appendChild(div);
  });
}

function renderLogs() {
  const logList = document.getElementById('logList');
  logList.innerHTML = '';
  state.logs.forEach(item => {
    const div = document.createElement('div');
    div.className = 'log-item';
    div.innerHTML = `<div class="log-time">${item.time.toLocaleTimeString()}</div><div>${item.message}</div>`;
    logList.appendChild(div);
  });
}

function labelStatus(status) {
  return status === 'working' ? 'работает' : status === 'coffee' ? 'кофе' : 'ожидает';
}
function badgeClass(status) {
  return status === 'working' ? 'working' : status === 'coffee' ? 'break' : 'idle';
}
function rand(min, max) { return Math.random() * (max - min) + min; }
function shorten(str, max) { return str.length > max ? str.slice(0, max - 1) + '…' : str; }

function loop() {
  update();
  draw();
  if (state.tick % 20 === 0) renderAgents();
  requestAnimationFrame(loop);
}

// UI
const taskForm = document.getElementById('taskForm');
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  if (!title) return;
  const task = makeTask(title, description || 'Новая задача офиса');
  state.tasks.unshift(task);
  renderTasks();
  log(`Добавлена новая задача: «${task.title}».`);
  taskForm.reset();
});

document.getElementById('newTaskBtn').addEventListener('click', () => {
  document.getElementById('taskTitle').focus();
});
document.getElementById('clearLogBtn').addEventListener('click', () => {
  state.logs = [];
  renderLogs();
});
document.getElementById('startPipelineBtn').addEventListener('click', () => {
  progressPipeline();
});
document.getElementById('pauseBtn').addEventListener('click', (e) => {
  state.running = !state.running;
  e.target.textContent = state.running ? 'Пауза' : 'Продолжить';
  log(state.running ? 'Офис снова работает.' : 'Офис поставлен на паузу.');
});

assignTargets();
renderAgents();
renderTasks();
log('AI Office загружен. Команда готова к работе.');
requestAnimationFrame(loop);
