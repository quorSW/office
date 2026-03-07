const canvas = document.getElementById('officeCanvas');
const ctx = canvas.getContext('2d');

const office = {
  desks: [
    { id: 'director', x: 165, y: 170, w: 110, h: 64, label: 'Director' },
    { id: 'strategist', x: 315, y: 170, w: 110, h: 64, label: 'Strategist' },
    { id: 'architect', x: 465, y: 170, w: 110, h: 64, label: 'Architect' },
    { id: 'developer', x: 615, y: 170, w: 110, h: 64, label: 'Developer' },
    { id: 'reviewer', x: 165, y: 355, w: 110, h: 64, label: 'Reviewer' },
    { id: 'qa', x: 315, y: 355, w: 110, h: 64, label: 'QA' },
    { id: 'docs', x: 465, y: 355, w: 110, h: 64, label: 'Docs' },
    { id: 'enablement', x: 615, y: 355, w: 110, h: 64, label: 'Enablement' },
  ],
  coffee: { x: 790, y: 182, w: 130, h: 80, label: 'Coffee Bar' },
  lounge: { x: 790, y: 332, w: 130, h: 90, label: 'Lounge' },
  corridorYTop: 275,
  corridorYBottom: 465,
};

const agents = [
  mkAgent('Mira', 'Director', 'director', '#f472b6'),
  mkAgent('Kian', 'Strategist', 'strategist', '#f59e0b'),
  mkAgent('Aria', 'Architect', 'architect', '#67e8f9'),
  mkAgent('Nex', 'Developer', 'developer', '#4ade80'),
  mkAgent('Sora', 'Reviewer', 'reviewer', '#a78bfa'),
  mkAgent('Lyn', 'QA', 'qa', '#60a5fa'),
  mkAgent('Ivo', 'Docs', 'docs', '#facc15'),
  mkAgent('Vera', 'Enablement', 'enablement', '#fb7185'),
];

const pipeline = ['Director','Strategist','Architect','Developer','Reviewer','QA','Docs','Enablement'];
let taskId = 3;
const state = {
  running: false,
  tasks: [
    { id: 1, title: 'Telegram Mini App UI polish', step: 2, progress: 'Architect', done: false },
    { id: 2, title: 'Task routing improvements', step: 4, progress: 'Reviewer', done: false },
    { id: 3, title: 'Knowledge pack for Developer', step: 6, progress: 'Docs', done: false },
  ],
  logs: [],
  timer: null,
};

function mkAgent(name, role, deskId, color) {
  const desk = office.desks.find(d => d.id === deskId);
  return {
    name,
    role,
    deskId,
    color,
    energy: rand(68, 95),
    focus: rand(60, 94),
    status: 'idle', // idle, working, transit, break
    action: 'ждёт задачу',
    x: desk.x + desk.w / 2,
    y: desk.y + desk.h + 38,
    targetX: desk.x + desk.w / 2,
    targetY: desk.y + desk.h + 38,
    path: [],
    seated: true,
    desk,
    workTicks: rand(4, 8),
    breakTicks: 0,
    currentTask: null,
  };
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function log(msg) {
  state.logs.unshift({ msg, ts: new Date().toLocaleTimeString('ru-RU') });
  state.logs = state.logs.slice(0, 32);
  renderLogs();
}

function newTask() {
  taskId += 1;
  state.tasks.unshift({ id: taskId, title: sampleTask(), step: 0, progress: 'Director', done: false });
  log(`Создана задача #${taskId}: ${state.tasks[0].title}`);
  syncUI();
}

function sampleTask() {
  const titles = [
    'Новая пиксельная сцена переговорки',
    'Улучшить очередь задач офиса',
    'Подготовить сценарий кофе-брейков',
    'Прокачать подсказки Developer Agent',
    'Собрать отчёт по статусам команды',
    'Упростить запуск Mini App в Telegram'
  ];
  return titles[rand(0, titles.length - 1)];
}

function assignWork() {
  const active = state.tasks.find(t => !t.done);
  if (!active) return;
  const role = active.progress;
  const agent = agents.find(a => a.role === role);
  if (!agent || agent.status === 'transit' || agent.status === 'break') return;
  agent.status = 'working';
  agent.seated = true;
  agent.currentTask = active;
  agent.action = `работает над #${active.id}`;
  agent.energy = Math.max(35, agent.energy - rand(1, 3));
  agent.focus = Math.max(45, agent.focus - rand(0, 2));
  log(`${agent.role} ${agent.name} взял задачу #${active.id}`);
}

function progressTask(agent) {
  if (!agent.currentTask) return;
  agent.workTicks -= 1;
  if (agent.workTicks > 0) return;
  const task = agent.currentTask;
  const idx = pipeline.indexOf(agent.role);
  if (idx === pipeline.length - 1) {
    task.done = true;
    task.progress = 'Done';
    log(`Задача #${task.id} завершена командой`);
  } else {
    task.step += 1;
    task.progress = pipeline[idx + 1];
    log(`Задача #${task.id} передана агенту ${task.progress}`);
  }
  agent.currentTask = null;
  agent.workTicks = rand(4, 8);
  maybeBreak(agent);
}

function maybeBreak(agent) {
  if (agent.energy < 52 || Math.random() < 0.18) {
    sendTo(agent, Math.random() < 0.7 ? 'coffee' : 'lounge');
  } else {
    sendToDesk(agent);
    agent.status = 'idle';
    agent.action = 'ждёт следующую задачу';
  }
}

function sendTo(agent, zone) {
  const target = zone === 'coffee' ? office.coffee : office.lounge;
  const tx = target.x + target.w / 2 + rand(-18, 18);
  const ty = target.y + target.h - 12;
  agent.status = 'transit';
  agent.seated = false;
  agent.action = zone === 'coffee' ? 'идёт за кофе' : 'идёт отдыхать';
  agent.path = pathFromTo(agent.x, agent.y, tx, ty);
  agent.breakTicks = rand(4, 7);
}

function sendToDesk(agent) {
  const tx = agent.desk.x + agent.desk.w / 2;
  const ty = agent.desk.y + agent.desk.h + 38;
  agent.status = 'transit';
  agent.seated = false;
  agent.action = 'возвращается к столу';
  agent.path = pathFromTo(agent.x, agent.y, tx, ty);
}

function pathFromTo(x1, y1, x2, y2) {
  // corridor-constrained movement to avoid wall crossing
  const midY = y1 < office.corridorYTop ? office.corridorYTop : office.corridorYBottom;
  return [
    { x: x1, y: midY },
    { x: x2, y: midY },
    { x: x2, y: y2 },
  ];
}

function tick() {
  if (!state.running) return;
  agents.forEach(agent => {
    if (agent.status === 'transit') moveAgent(agent);
    else if (agent.status === 'working') progressTask(agent);
    else if (agent.status === 'break') {
      agent.breakTicks -= 1;
      agent.energy = Math.min(100, agent.energy + rand(2, 4));
      if (agent.breakTicks <= 0) {
        sendToDesk(agent);
      }
    }
  });

  assignWork();
  syncUI();
}

function moveAgent(agent) {
  const target = agent.path[0];
  if (!target) {
    if (nearDesk(agent)) {
      agent.status = 'idle';
      agent.seated = true;
      agent.action = 'сидит и ждёт задачу';
    } else {
      agent.status = 'break';
      agent.action = agent.y < 300 ? 'пьёт кофе' : 'отдыхает в зоне отдыха';
    }
    return;
  }

  const dx = target.x - agent.x;
  const dy = target.y - agent.y;
  const dist = Math.hypot(dx, dy);
  const speed = 2.4;
  if (dist <= speed) {
    agent.x = target.x;
    agent.y = target.y;
    agent.path.shift();
  } else {
    agent.x += (dx / dist) * speed;
    agent.y += (dy / dist) * speed;
  }
}

function nearDesk(agent) {
  const tx = agent.desk.x + agent.desk.w / 2;
  const ty = agent.desk.y + agent.desk.h + 38;
  return Math.abs(agent.x - tx) < 4 && Math.abs(agent.y - ty) < 4;
}

function render() {
  drawOffice();
  agents.forEach(drawAgent);
  requestAnimationFrame(render);
}

function drawOffice() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFloor();
  drawRooms();
  drawCorridors();
  office.desks.forEach(drawDesk);
  drawCoffeeBar();
  drawLounge();
}

function drawFloor() {
  ctx.fillStyle = '#10192b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < canvas.width; x += 28) {
    for (let y = 0; y < canvas.height; y += 28) {
      ctx.fillStyle = ((x + y) / 28) % 2 === 0 ? '#122039' : '#111b31';
      ctx.fillRect(x, y, 28, 28);
    }
  }
}

function drawRooms() {
  room(80, 90, 690, 170, 'Рабочая зона A');
  room(80, 315, 690, 170, 'Рабочая зона B');
  room(770, 90, 170, 190, 'Кофейня');
  room(770, 305, 170, 145, 'Лаунж');
}

function room(x, y, w, h, label) {
  ctx.fillStyle = 'rgba(255,255,255,.045)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = '#8ea3d1';
  ctx.font = '14px Inter';
  ctx.fillText(label, x + 10, y + 22);
}

function drawCorridors() {
  ctx.fillStyle = '#18243d';
  ctx.fillRect(80, 255, 860, 40);
  ctx.fillRect(80, 455, 860, 40);
}

function drawDesk(d) {
  ctx.fillStyle = '#34486e';
  roundRect(d.x, d.y, d.w, d.h, 12, true, false);
  ctx.fillStyle = '#203252';
  roundRect(d.x + 10, d.y + 8, d.w - 20, 12, 6, true, false);
  ctx.fillStyle = '#dbeafe';
  roundRect(d.x + d.w/2 - 16, d.y + 16, 32, 22, 6, true, false);
  ctx.fillStyle = '#b8c7eb';
  ctx.font = '12px Inter';
  ctx.fillText(d.label, d.x + 12, d.y + d.h - 12);
  // chair
  ctx.fillStyle = '#3f4f73';
  roundRect(d.x + d.w/2 - 16, d.y + d.h + 8, 32, 16, 6, true, false);
}

function drawCoffeeBar() {
  const c = office.coffee;
  ctx.fillStyle = '#6b4f2f';
  roundRect(c.x + 14, c.y + 18, 94, 22, 8, true, false);
  ctx.fillStyle = '#d6a86a';
  roundRect(c.x + 22, c.y + 6, 74, 20, 8, true, false);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(c.x + 30, c.y + 20, 10, 16);
  ctx.fillRect(c.x + 52, c.y + 20, 10, 16);
  ctx.fillRect(c.x + 74, c.y + 20, 10, 16);
  ctx.fillStyle = '#8ea3d1';
  ctx.fillText(c.label, c.x + 18, c.y + 68);
}

function drawLounge() {
  const l = office.lounge;
  ctx.fillStyle = '#6d5ca5';
  roundRect(l.x + 16, l.y + 24, 48, 54, 12, true, false);
  roundRect(l.x + 74, l.y + 24, 48, 54, 12, true, false);
  ctx.fillStyle = '#9aa6c8';
  roundRect(l.x + 50, l.y + 48, 26, 18, 9, true, false);
  ctx.fillStyle = '#8ea3d1';
  ctx.fillText(l.label, l.x + 18, l.y + 112);
}

function drawAgent(agent) {
  // status halo
  const statusColor = agent.status === 'working' ? '#4ade80' : agent.status === 'break' ? '#f87171' : agent.status === 'transit' ? '#67e8f9' : '#94a3b8';
  ctx.fillStyle = hexToRgba(statusColor, 0.14);
  ctx.beginPath();
  ctx.arc(agent.x, agent.y - 18, 20, 0, Math.PI * 2);
  ctx.fill();

  // body seated vs standing
  if (agent.seated) {
    ctx.fillStyle = '#1e293b';
    roundRect(agent.x - 8, agent.y - 4, 16, 10, 3, true, false);
    ctx.fillStyle = agent.color;
    roundRect(agent.x - 10, agent.y - 20, 20, 16, 6, true, false);
  } else {
    ctx.fillStyle = agent.color;
    roundRect(agent.x - 9, agent.y - 16, 18, 20, 7, true, false);
    ctx.strokeStyle = '#dbeafe';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(agent.x - 4, agent.y + 4);
    ctx.lineTo(agent.x - 4, agent.y + 14);
    ctx.moveTo(agent.x + 4, agent.y + 4);
    ctx.lineTo(agent.x + 4, agent.y + 14);
    ctx.stroke();
  }

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(agent.x, agent.y - 26, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e5ecff';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(agent.name, agent.x, agent.y - 42);
  ctx.fillStyle = '#9fb2dc';
  ctx.fillText(agent.action, agent.x, agent.y - 54);
  ctx.textAlign = 'start';
}

function roundRect(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function syncUI() {
  document.getElementById('statAgents').textContent = agents.length;
  document.getElementById('statTasks').textContent = state.tasks.filter(t => !t.done).length;
  document.getElementById('statWorking').textContent = agents.filter(a => a.status === 'working').length;
  document.getElementById('statBreak').textContent = agents.filter(a => a.status === 'break').length;
  document.getElementById('queueHint').textContent = `${state.tasks.filter(t => !t.done).length} активных`;
  renderTasks();
  renderTeam();
}

function renderTasks() {
  const node = document.getElementById('taskList');
  node.innerHTML = '';
  state.tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.innerHTML = `
      <h4>#${task.id} — ${task.title}</h4>
      <div class="task-meta">Текущий этап: ${task.progress}</div>
      <div class="badge ${task.done ? 'break' : 'working'}">${task.done ? 'завершена' : 'в работе'}</div>
    `;
    node.appendChild(div);
  });
}

function renderTeam() {
  const node = document.getElementById('teamList');
  node.innerHTML = '';
  agents.forEach(agent => {
    const div = document.createElement('div');
    const cls = agent.status === 'working' ? 'working' : agent.status === 'break' ? 'break' : 'transit';
    div.className = 'member-item';
    div.innerHTML = `
      <h4>${agent.name} · ${agent.role}</h4>
      <div class="member-meta">Энергия ${agent.energy}% · Фокус ${agent.focus}%</div>
      <div class="badge ${cls}">${agent.action}</div>
    `;
    node.appendChild(div);
  });
}

function renderLogs() {
  const node = document.getElementById('logList');
  node.innerHTML = '';
  state.logs.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'log-item';
    div.innerHTML = `${entry.msg}<span class="log-time">${entry.ts}</span>`;
    node.appendChild(div);
  });
}

document.getElementById('btnStart').addEventListener('click', () => {
  if (state.running) return;
  state.running = true;
  state.timer = setInterval(tick, 1200);
  log('Офис запущен. Команда заняла рабочие места.');
  assignWork();
  syncUI();
});

document.getElementById('btnPause').addEventListener('click', () => {
  state.running = false;
  clearInterval(state.timer);
  log('Офис поставлен на паузу.');
});

document.getElementById('btnTask').addEventListener('click', newTask);

log('Офис готов к запуску.');
syncUI();
render();
